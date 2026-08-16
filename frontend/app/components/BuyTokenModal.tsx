"use client";
import React, { useState } from "react";
import { Card } from "./Cards";
import { Btn } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletData: any;
    onSubmit: (token: number) => void;
}
export default function BuyTokenModal({ isOpen, onClose, walletData, onSubmit }: ModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  if (!isOpen) return null;

  const tokenPackages = [
    { id: "pkg-1", amount: 500000, price: "$0.10", label: "Starter Pack", desc: "Cocok untuk uji coba webhook & testing chatbot skala kecil." },
    { id: "pkg-2", amount: 2000000, price: "$0.35", label: "Recommended", desc: "Paling populer untuk instansi desa atau operasional bulanan umum.", popular: true },
    { id: "pkg-3", amount: 10000000, price: "$1.50", label: "Enterprise Scale", desc: "Kapasitas besar untuk broadcast masal dan integrasi multi-agent." },
  ];

  const handleBuyToken = () => {
    const findPackage = tokenPackages.find(tp => tp.id === selectedPackage);
    if (!findPackage) return;
    onSubmit(findPackage.amount);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-2xl overflow-hidden border-border bg-card shadow-xl animate-scale-up">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Top Up AI Tokens
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Membeli kuota token untuk model <span className="font-semibold text-foreground font-mono">{walletData?.name || "GPT-4o Mini"}</span> ({walletData?.provider})
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground text-sm p-1.5 rounded-md hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Content Modal (Grid Package) */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tokenPackages.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-muted/10 hover:bg-muted/30"
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded-full bg-blue-500 text-white shadow-sm">
                      Best Value
                    </span>
                  )}

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-muted-foreground">{pkg.label}</div>
                    <div className="text-2xl font-black text-foreground font-mono">
                      {pkg.amount.toLocaleString()}
                      <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">Tokens</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
                      {pkg.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Price</span>
                    <span className="text-sm font-bold text-foreground font-mono">{pkg.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-2">
          <Btn variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Btn>
          <Btn 
            variant="primary" 
            size="sm" 
            disabled={!selectedPackage}
            onClick={() => handleBuyToken()}
            className={`px-4 ${!selectedPackage ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            Proceed to Payment
          </Btn>
        </div>

      </Card>
    </div>
  );
}