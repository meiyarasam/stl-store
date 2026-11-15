"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageSquare, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight font-display">
          Contact Our Team
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Have questions about slicing a model, order reconciliation, or commercial licensing inquiries? We&apos;re here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-zinc-950 text-sm">Direct Contact Channels</h3>

            <div className="space-y-3 text-xs text-zinc-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-zinc-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Customer Support</span>
                  <a href="mailto:support@stlforge.com" className="hover:underline">
                    support@stlforge.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Licencing & Verification</span>
                  <a href="mailto:licensing@stlforge.com" className="hover:underline">
                    licensing@stlforge.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-zinc-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-zinc-900 block">Response Time</span>
                  <span>Usually within 24 business hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Message Received!</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out, {name}. A member of our support engineering team will review your inquiry and follow up at {email}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Your Name *
                </label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Your Email *
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Subject *
                </label>
                <Input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order inquiry, printing question, or feedback..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry with as much detail as possible..."
                  className="w-full rounded-md border border-zinc-300 bg-white p-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 leading-relaxed"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-xs font-bold"
              >
                Send Inquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
