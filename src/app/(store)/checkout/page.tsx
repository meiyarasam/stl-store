"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStore } from "@/context/StoreContext";
import { COUNTRIES_LIST, SUPPORTED_CURRENCIES } from "@/lib/currency/currencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UPIQRCodeModal } from "@/components/checkout/UPIQRCodeModal";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  QrCode,
  ExternalLink,
  ShoppingBag,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    cart,
    cartTotal,
    currency,
    country,
    setCountry,
    formatAmount,
    getProductPrice,
    clearCart,
  } = useStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(country);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UPI QR state
  const [upiData, setUpiData] = useState<{
    isOpen: boolean;
    upiIntentUrl: string;
    orderNumber: string;
    orderId: string;
    amount: number;
    currency: string;
  } | null>(null);

  // Prefill details if user is logged in
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setFullName(session.user.name);
      if (session.user.email) setEmail(session.user.email);
      if ((session.user as any).country) {
        setSelectedCountry((session.user as any).country);
      }
    }
  }, [session]);

  // Sync country selector
  const handleCountryChange = (cCode: string) => {
    setSelectedCountry(cCode);
    setCountry(cCode);
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setErrorMessage("Please enter your name and email address.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Initiate pending order on backend
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          customerCountry: selectedCountry,
          currency,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to initiate order");
      }

      const { order, razorpay: rzpConfig, upi, merchantProfileUrl } = orderData;

      // Check if Razorpay client script is loaded
      if (typeof window.Razorpay === "undefined" && !rzpConfig.isMock) {
        // Fallback: Show UPI or payment instructions
        if (upi) {
          setUpiData({
            isOpen: true,
            upiIntentUrl: upi.intentUrl,
            orderNumber: order.orderNumber,
            orderId: order.id,
            amount: upi.amount,
            currency,
          });
          setIsLoading(false);
          return;
        }
      }

      // 2. Open Razorpay Standard Checkout
      const options = {
        key: rzpConfig.keyId,
        amount: rzpConfig.amountSubunits,
        currency: rzpConfig.currency,
        name: "STLForge",
        description: `Order #${order.orderNumber} – Digital 3D Files`,
        order_id: rzpConfig.orderId,
        prefill: {
          name: fullName,
          email: email,
          contact: phone || undefined,
        },
        theme: {
          color: "#0f172a", // STLForge charcoal
        },
        handler: async function (response: any) {
          setIsLoading(true);
          try {
            // 3. Cryptographically verify payment on backend
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id || rzpConfig.orderId,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpaySignature: response.razorpay_signature || `sig_test_${Date.now()}`,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Clear cart upon successful verified payment
            clearCart();
            router.push(verifyData.redirectUrl);
          } catch (verifyErr: any) {
            console.error("Payment verification error:", verifyErr);
            setErrorMessage(verifyErr.message || "Payment verification failed");
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      if (typeof window.Razorpay !== "undefined") {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // If in test simulation mode without remote script
        options.handler({
          razorpay_order_id: rzpConfig.orderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: `sig_test_${Date.now()}`,
        });
      }
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      setErrorMessage(err.message || "An error occurred during checkout");
      setIsLoading(false);
    }
  };

  const handleSimulateUpiVerified = async () => {
    if (!upiData) return;
    setIsLoading(true);
    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: upiData.orderId,
          razorpayOrderId: `order_upi_${Date.now()}`,
          razorpayPaymentId: `pay_upi_${Date.now()}`,
          razorpaySignature: `sig_test_upi_${Date.now()}`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        clearCart();
        router.push(verifyData.redirectUrl);
      }
    } catch (e) {
      setErrorMessage("Could not verify simulated UPI payment.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Your cart is empty</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Select digital 3D models before proceeding to checkout.
        </p>
        <div className="mt-6">
          <Link
            href="/products"
            className="px-5 py-2.5 bg-zinc-950 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800"
          >
            Explore 3D Models
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Header */}
      <div>
        <h1 className="text-3xl font-black text-zinc-950 tracking-tight font-display">
          Secure Digital Checkout
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Complete your purchase to immediately unlock high-speed download links.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Customer Details Form */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Customer Information</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your order confirmation and download license will be sent to this email.
            </p>
          </div>

          <form onSubmit={handlePayNow} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Full Name *
              </label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Email Address (For File Delivery) *
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Country / Region *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                >
                  {COUNTRIES_LIST.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.defaultCurrency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Mobile Number (Optional)
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0199"
                />
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Authorised Payment Processing
              </h3>

              <div className="p-4 rounded-lg border-2 border-zinc-900 bg-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    RZP
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-900 block">
                      Razorpay Standard Checkout
                    </span>
                    <span className="text-xs text-zinc-500">
                      Credit / Debit Cards, UPI, NetBanking, Dynamic QR
                    </span>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-sm font-bold shadow-md mt-4"
            >
              Pay {formatAmount(cartTotal)} & Unlock Downloads
            </Button>
          </form>

          {/* Fallback Merchant Payment Option */}
          <div className="pt-4 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500">
              Need manual payment or personalized link?
            </p>
            <a
              href="https://razorpay.me/@meiyarasan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:underline mt-1"
            >
              Pay directly via Merchant Profile (meiyarasan) <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Order Review Sidecard */}
        <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Your Order ({cart.length})</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-zinc-200 rounded text-zinc-800">
              Currency: {currency}
            </span>
          </div>

          {/* Items Summary */}
          <div className="divide-y divide-zinc-200 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => {
              const { amount } = getProductPrice(item.product);
              return (
                <div key={item.product.id} className="py-3 flex justify-between items-start text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900 block line-clamp-1">
                      {item.product.title}
                    </span>
                    <span className="text-zinc-500 text-[11px]">
                      Formats: STL, ZIP • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-zinc-950 ml-4">
                    {formatAmount(amount * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2 pt-4 border-t border-zinc-200 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-zinc-900">
                {formatAmount(cartTotal)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Instant Digital Delivery</span>
              <span className="text-emerald-600 font-semibold">Free</span>
            </div>
            <div className="pt-2 border-t border-zinc-200 flex justify-between text-base font-black text-zinc-950">
              <span>Total to Pay</span>
              <span className="font-mono">{formatAmount(cartTotal)}</span>
            </div>
          </div>

          <div className="p-3 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe Digital Fulfillment</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Files are watermarked with your private order token and become available immediately in your dashboard upon payment authorization.
            </p>
          </div>
        </div>
      </div>

      {/* UPI QR Modal if applicable */}
      {upiData && (
        <UPIQRCodeModal
          isOpen={upiData.isOpen}
          onClose={() => setUpiData(null)}
          upiIntentUrl={upiData.upiIntentUrl}
          orderNumber={upiData.orderNumber}
          amount={upiData.amount}
          currency={upiData.currency}
          onSimulateVerified={handleSimulateUpiVerified}
        />
      )}
    </div>
  );
}
