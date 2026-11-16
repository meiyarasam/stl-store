"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStore } from "@/context/StoreContext";
import { COUNTRIES_LIST, SUPPORTED_CURRENCIES } from "@/lib/currency/currencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UPIQRCodeModal } from "@/components/checkout/UPIQRCodeModal";
import { OrderSummary } from "@/components/checkout/OrderSummary";
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
        name: "The Print Factory",
        description: `Order #${order.orderNumber} – Digital 3D Files`,
        order_id: rzpConfig.orderId,
        image: "/images/logo.png",
        prefill: {
          name: fullName,
          email: email,
          contact: phone || undefined,
        },
        theme: {
          color: "#2563eb", // The Print Factory blue
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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Checkout Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-display">
          Secure Digital Checkout
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Complete your purchase to immediately unlock high-speed download links.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start w-full">
        {/* Customer Details Form */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 shadow-sm space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">Customer Information</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your order confirmation and download license will be sent to this email.
            </p>
          </div>

          <form onSubmit={handlePayNow} className="space-y-4 w-full">
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
                className="w-full text-sm"
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
                className="w-full text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Country / Region *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="flex h-11 w-full max-w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 truncate"
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
                  className="w-full text-sm"
                />
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="pt-3 sm:pt-4 border-t border-zinc-100 space-y-3 w-full">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Authorised Payment Processing
              </h3>

              <div className="p-3.5 sm:p-4 rounded-lg border-2 border-zinc-900 bg-zinc-50 flex items-center justify-between gap-2.5 w-full overflow-hidden">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    RZP
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-zinc-900 block truncate">
                      Razorpay Standard Checkout
                    </span>
                    <span className="text-[11px] sm:text-xs text-zinc-500 block truncate">
                      Credit / Debit Cards, UPI, NetBanking, Dynamic QR
                    </span>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full min-h-[48px] text-xs sm:text-sm font-bold shadow-md mt-4 touch-manipulation"
            >
              Pay {formatAmount(cartTotal)} & Unlock Downloads
            </Button>
          </form>

          {/* Fallback Merchant Payment Option */}
          <div className="pt-3 sm:pt-4 border-t border-zinc-100 text-center w-full">
            <p className="text-xs text-zinc-500">
              Need manual payment or personalized link?
            </p>
            <a
              href="https://razorpay.me/@meiyarasan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:underline mt-1"
            >
              Pay directly via Merchant Profile (meiyarasan) <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Order Review Sidecard Component */}
        <div className="lg:col-span-5 w-full max-w-full">
          <OrderSummary
            cart={cart}
            cartTotal={cartTotal}
            currency={currency}
            formatAmount={formatAmount}
            getProductPrice={getProductPrice}
          />
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

