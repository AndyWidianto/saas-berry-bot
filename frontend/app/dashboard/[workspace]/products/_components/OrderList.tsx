import React, { useState } from 'react';
import { 
  Clock, User, Package, ChevronDown, ChevronUp, 
  XCircle, CheckCircle, Image as ImageIcon, Eye, Phone 
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';


const statusBadges: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  PAID: { label: 'Dibayar', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  PROCESSING: { label: 'Diproses', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  SHIPPED: { label: 'Dikirim', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Selesai', className: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Dibatalkan', className: 'bg-rose-100 text-rose-800 border-rose-200' },
};


interface OrderListProps {
    orders: Order[],
    expandedOrder: string | null,
    toggleExpand: (id: string) => void,
    handleReject: (id: string) => void,
    handleAccept: (id: string) => void,
    formatRupiah: (state: number) => string,
}
export function OrderList({ orders, expandedOrder, toggleExpand, handleReject, handleAccept, formatRupiah } : OrderListProps) {
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => {
          const badge = statusBadges[order.status] || statusBadges.PENDING;
          const isDone = order.status === 'COMPLETED' || order.status === 'CANCELLED';

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isDone ? 'border-gray-200 opacity-75 bg-gray-50/30' : 'border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 md:p-5 flex flex-wrap items-center justify-between border-b border-gray-100 bg-gray-50/50 gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-gray-900">
                    #{order.orderNumber || order.shortCode}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 font-medium">
                    Metode: <span className="text-gray-800 font-semibold">{order.paymentMethod}</span>
                  </span>

                  {/* Tombol Preview Bukti Pembayaran */}
                  {order.paymentProofUrl ? (
                    <button
                      type="button"
                      onClick={() => setSelectedProofUrl(order.paymentProofUrl)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Bukti Bayar
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Tanpa Bukti</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Info Pelanggan dari `details` */}
                  <div className="space-y-2 text-sm bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/80">
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                      Informasi Pelanggan
                    </div>
                    {order.details && Object.keys(order.details).length > 0 ? (
                      Object.entries(order.details).map(([key, val]) => {
                        if (val === null || val === undefined || typeof val === 'object') return null;

                        return (
                          <div key={key} className="flex items-start gap-2 text-gray-700">
                            <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <div className="leading-tight">
                              <span className="capitalize text-xs text-gray-400 block">{key.replace(/_/g, ' ')}</span>
                              <span className="font-medium text-gray-800">{String(val)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">Tidak ada detail pelanggan</span>
                    )}
                  </div>

                  {/* Ringkasan Item Quick-View */}
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between gap-2">
                    <div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                        Ringkasan Pesanan ({order.items.length} Barang)
                      </div>
                      <div className="text-sm text-gray-800 line-clamp-2">
                        {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(', ')}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500">TOTAL BAYAR</span>
                      <span className="text-base font-bold text-blue-600">{formatRupiah(Number(order.grandTotal))}</span>
                    </div>
                  </div>
                </div>

                {/* Detail Items Accordion */}
                {expandedOrder === order.id && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Detail Barang</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm gap-3">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-9 h-9 object-cover rounded-lg border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-gray-900 font-medium leading-tight">{item.productName}</p>
                              <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(Number(item.price))}</p>
                            </div>
                          </div>
                          <span className="text-gray-700 font-semibold">{formatRupiah(Number(item.subtotal))}</span>
                        </div>
                      ))}
                    </div>

                    {/* Rincian Pembayaran Tambahan */}
                    <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 space-y-1.5 text-xs text-gray-600 mt-2">
                      <div className="flex justify-between">
                        <span>Subtotal Produk</span>
                        <span>{formatRupiah(Number(order.subtotal))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ongkos Kirim</span>
                        <span>{formatRupiah(Number(order.shippingCost))}</span>
                      </div>
                      {Number(order.discountTotal) > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Diskon</span>
                          <span>-{formatRupiah(Number(order.discountTotal))}</span>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div className="text-xs text-gray-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                        <span className="font-semibold text-amber-800">Catatan:</span> {order.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer / Action Buttons */}
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(order.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 font-medium order-2 sm:order-1"
                >
                  {expandedOrder === order.id ? (
                    <>Sembunyikan Detail <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Lihat Detail Pesanan <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>

                {/* Sembunyikan/Nonaktifkan Tombol jika Status Sudah COMPLETED atau CANCELLED */}
                {!isDone && (
                  <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => handleReject(order.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAccept(order.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Terima Pesanan
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL LIGHTBOX FOTO BUKTI PEMBAYARAN */}
      {selectedProofUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedProofUrl(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Bukti Pembayaran</h3>
              <button 
                onClick={() => setSelectedProofUrl(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-900/5 min-h-[250px]">
              <img 
                src={selectedProofUrl} 
                alt="Bukti Transfer" 
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-right">
              <a 
                href={selectedProofUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Buka Gambar Penuh ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}