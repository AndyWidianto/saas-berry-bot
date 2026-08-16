"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, RefreshCw, Smartphone } from 'lucide-react';
import { siWhatsapp } from 'simple-icons';


interface WAConnectModalProps {
  onClose: () => void;
  qrCodeString: string;
  isLoading: boolean;
  isExpired?: boolean;
  fetchQrCode?: () => void;
  // Anda bisa menambahkan prop callback jika sudah integrasi ke backend
  // onStatusConnected?: () => void;
}

export function WABaileysConnectModal({ onClose, qrCodeString, isLoading, fetchQrCode, isExpired }: WAConnectModalProps) {
  const qrSize = 180;
  const logoSize = 40;
  const centerOffset = (qrSize - logoSize) / 2;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 transition-opacity duration-300 animate-fade-in">

      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">Hubungkan WhatsApp Gateway</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Konten */}
        <div className="flex flex-col items-center gap-8 p-6 md:flex-row md:p-8">

          <div className="relative flex h-64 w-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center gap-3 animate-pulse">
                <div className="h-44 w-44 rounded-lg bg-gray-200"></div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
              </div>
            )}

            {qrCodeString && !isLoading && !isExpired && (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg bg-white p-2 shadow-sm border border-gray-100 relative flex items-center justify-center">
                  <QRCodeSVG
                    value={qrCodeString}
                    size={qrSize}
                    level="H"
                    includeMargin={false}
                  />

                  <div
                    className="absolute bg-white rounded-md p-1 shadow-sm flex items-center justify-center"
                    style={{
                      width: `${logoSize + 8}px`,
                      height: `${logoSize + 8}px`,
                    }}
                  >
                    {/* Menggunakan path SVG dari simple-icons secara manual */}
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      width={logoSize}
                      height={logoSize}
                      fill={`#${siWhatsapp.hex}`}
                    >
                      <path d={siWhatsapp.path} />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-1">Pindai kode QR di atas</span>
              </div>
            )}

            {isExpired && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white bg-opacity-95 p-4 text-center">
                <div className="rounded-full bg-amber-50 p-3 text-amber-500 mb-2">
                  <RefreshCw className="h-8 w-8 animate-spin-slow" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Kode QR Kadaluarsa</p>
                <p className="text-xs text-gray-500 max-w-[180px] mt-0.5">Kode QR diperbarui secara berkala untuk keamanan</p>
                <button
                  onClick={() => { }}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Muat Ulang QR
                </button>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Gunakan WhatsApp di ponsel Anda</h4>
            <ol className="list-decimal list-outside space-y-3.5 pl-5 text-sm text-gray-600 md:text-base">
              <li>Buka aplikasi <span className="font-semibold text-gray-700">WhatsApp</span> di HP Anda.</li>
              <li>Ketuk ikon <span className="font-semibold text-gray-700">Menu</span> (titik tiga) atau masuk ke <span className="font-semibold text-gray-700">Pengaturan</span> (ikon gerigi).</li>
              <li>Pilih opsi <span className="font-semibold text-gray-700">Perangkat Tertaut (Linked Devices)</span>.</li>
              <li>Ketuk tombol <span className="font-semibold text-emerald-600">Tautkan Perangkat</span>.</li>
              <li>Arahkan kamera ponsel Anda ke layar monitor untuk memindai kode QR.</li>
            </ol>

            {/* Footer Tip */}
            <div className="mt-8 flex items-start gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
              <Smartphone className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p>Pastikan perangkat Anda terhubung ke internet yang stabil selama proses sinkronisasi berlangsung.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}