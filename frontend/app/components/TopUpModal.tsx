"use client";
import React, { useState } from 'react';
import { X, Wallet, CreditCard, QrCode, ArrowRight } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: (nominal: number) => void;
}

export default function TopUpModal({ isOpen, onClose, onCheckout }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("qris");

  if (!isOpen) return null;

  const quickAmounts = [300000, 500000, 100000, 2500000, 5000000, 1000000];

  const handleQuickSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomInput = (val: string) => {
    setCustomAmount(val);
    setSelectedAmount(null);
  };

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-background border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Top Up Balance</h3>
              <p className="text-xs text-muted-foreground">Isi saldo akun Anda secara instan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground block mb-3">
            1. PILIH NOMINAL TOP UP (Rp)
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickSelect(amount)}
                className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  selectedAmount === amount
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-transparent hover:bg-muted text-foreground"
                }`}
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">$</span>
            <input
              type="number"
              placeholder="Masukkan nominal kustom..."
              value={customAmount}
              onChange={(e) => handleCustomInput(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground block mb-3">
            2. METODE PEMBAYARAN
          </label>
          <div className="space-y-2">
            {[
              { id: 'qris', name: 'QRIS / E-Wallet', desc: 'Dana, OVO, GoPay, ShopeePay', icon: QrCode },
              { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, JCB', icon: CreditCard },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === method.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground">{method.name}</p>
                      <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => {}}
                    className="accent-primary w-4 h-4"
                  />
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-muted-foreground font-medium">Total Pembayaran:</span>
            <span className="text-xl font-bold text-foreground">Rp.{finalAmount.toLocaleString()}</span>
          </div>
          <button
            type="button"
            disabled={finalAmount <= 0}
            onClick={() => onCheckout?.(finalAmount)}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            Bayar Sekarang
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}