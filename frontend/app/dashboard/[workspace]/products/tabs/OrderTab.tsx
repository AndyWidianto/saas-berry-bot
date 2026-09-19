"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShoppingBag,
  Loader2
} from 'lucide-react';
import useAxios from '@/lib/axios-service';
import { Order, OrderStatus } from '@/lib/types';
import { OrderList } from '../_components/OrderList';
import { useSocket } from '@/lib/context/SocketContext';


const statusBadges: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  PAID: { label: 'Dibayar', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  PROCESSING: { label: 'Diproses', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  SHIPPED: { label: 'Dikirim', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Selesai', className: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Dibatalkan', className: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export default function IncomingOrders({ workspaceId }: { workspaceId: string }) {
  const { AxiosPrivate } = useAxios();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { socket } = useSocket();

  const isFetchingRef = useRef(false);
  const itemsPerPage = 10;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(number);
  };

  const toggleExpand = (id: string) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  const handleAccept = async (id: string) => {
    try {
      const statusPriority: Record<OrderStatus, number> = {
        PAID: 1,
        PENDING: 2,
        PROCESSING: 3,
        COMPLETED: 5,
        SHIPPED: 4,
        CANCELLED: 6,
      };

      // const newOrders = orders
      //   .map((order) =>
      //     order.id === id ? { ...order, status: "COMPLETED" as OrderStatus } : order
      //   )
      //   .sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

      setOrders(orders.filter(order => order.id !== id));
      await AxiosPrivate.patch(`/${workspaceId}/orders/${id}`, {
        status: "COMPLETED" as OrderStatus
      });

    } catch (err) {
      console.error("Fetch error: ", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setOrders((prev) => prev.filter((order) => order.id !== id));
      await AxiosPrivate.patch(`/${workspaceId}/orders/${id}`, {
        status: "CANCELLED" as OrderStatus
      });
    } catch (err) {
      console.error("Fetch erorr: ", err);
    }
  };

  // Fungsi fetch menerima cursor secara langsung untuk menghindari bug Stale State
  const fetchOrders = useCallback(async (cursorParam?: string | null, isInitial = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await AxiosPrivate.get(`${workspaceId}/orders`, {
        params: {
          cursor: cursorParam ?? undefined,
          limit: itemsPerPage,
        },
      });

      const result = res.data;
      console.log(result);
      const fetchedItems: Order[] = result.data || [];

      if (fetchedItems.length < itemsPerPage || !result.nextId) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setNextId(result.nextId ?? null);

      // Deduplikasi array berdasarkan item.id
      setOrders((prev) => {
        if (isInitial) return fetchedItems;

        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueItems = fetchedItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...uniqueItems];
      });
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingInitial(false);
      setIsLoadingMore(false);
    }
  }, [AxiosPrivate, workspaceId]);

  useEffect(() => {
    fetchOrders(null, true);
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    socket.on("order.upsert", (data: Order) => {
      const findOrder = orders.find(order => order.id === data.id);
      if (findOrder) {
        setOrders(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        setOrders(prev => [data, ...prev]);
      }
    })
  }, [socket]);
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || isFetchingRef.current) return;
    setIsLoadingMore(true);
    await fetchOrders(nextId, false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Orderan Masuk</h1>
              <p className="text-sm text-gray-500">Kelola dan proses pesanan pelanggan secara real-time</p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full text-sm">
            {orders.length} Pesanan
          </span>
        </div>

        {/* List Card Orderan */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">Tidak ada orderan masuk</h3>
            <p className="text-gray-400 text-sm">Pesanan baru dari pelanggan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <OrderList
              orders={orders}
              expandedOrder={expandedOrder}
              toggleExpand={toggleExpand}
              handleAccept={handleAccept}
              handleReject={handleReject}
              formatRupiah={formatRupiah}
            />
            {/* Tombol Load More */}
            {hasMore && orders.length > 0 && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl border border-gray-200 shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Memuat data...</span>
                    </>
                  ) : (
                    <span>Tampilkan Lebih Banyak</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}