"use client";

import { ArrowRight, Loader2, Lock, PackageX, Settings, ShoppingBag, Sparkles, Van } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductList } from "./tabs/ProductTab";
import cn from "@/app/components/ClassName";
import IncomingOrders from "./tabs/OrderTab";
import DynamicSettings from "./tabs/SettingTab";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { Btn } from "@/app/components/Button";
import useAxios from "@/lib/axios-service";
import { toast } from "sonner";
import axios from "axios";

type ProductTab = "products" | "orders" | "settings";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export default function ProductPage() {
    const [tab, setTab] = useState<ProductTab>("products");
    const { workspace, setWorkspace } = useWorkspaceStore();
    const { workspace: workspaceId } = useParams();
    const { AxiosPrivate } = useAxios();
    const searchParam = useSearchParams();
    const searchTab = searchParam.get("tab");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const tabs: { id: ProductTab; label: string; icon: React.ElementType }[] = [
        { id: "products", label: "List Products", icon: ShoppingBag },
        { id: "orders", label: "Order", icon: Van },
        { id: "settings", label: "Settings", icon: Settings }
    ];

    const onActivateProduct = async () => {
        setLoading(true);
        try {
            const res = await AxiosPrivate.patch(`/workspaces/${workspaceId}`, {
                isProductActive: true,
                productSettings: {
                    fields: [
                        { id: 1, label: 'Nama Pelanggan', name: "name", required: true },
                        { id: 2, label: 'Nomor WhatsApp', name: "phone", required: true },
                        { id: 3, label: 'Alamat Pengiriman', name: "address", required: true },
                    ],
                    paymentMethod: {
                        qris: {
                            name: "",
                            imageUrl: null,
                            filename: null,
                        },
                        bankItems: []
                    }
                },
            });
            const result = res.data;
            setWorkspace(result.data);
        } catch (err) {
            console.error("Fetch error: ", err);
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message ?? "Gagal mengaktifkan fitur product";
                toast.error(message);
            }
        }
    }

    const renderingTab = () => {
        if (!workspaceId) return;
        switch (tab) {
            case "products":
                return <ProductList workspaceId={workspaceId as string} />
            case "orders":
                return <IncomingOrders workspaceId={workspaceId as string} />
            case "settings":
                return <DynamicSettings workspaceId={workspaceId as string} />
        }
    }

    const handleClickTab = (id: ProductTab) => {
        setTab(id);
        router.replace(`/dashboard/${workspaceId}/products?tab=${id}`);
    }

    useEffect(() => {
        if (!searchTab) return;
        if (searchTab === "settings") {
            setTab("settings");
        } else if (searchTab === "orders") {
            setTab("orders");
        } else {
            setTab("products");
        }
    }, [searchTab])

    if (!workspace?.isProductActive) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-100/50 relative overflow-hidden">

                    {/* Aksens Lingkaran Gradient di Background */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Icon Header dengan Bintang Sparkle */}
                    <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100/60 shadow-inner">
                            <PackageX className="w-10 h-10" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-md">
                            <Lock className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    {/* Judul & Deskripsi */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Katalog Produk Belum Aktif
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        Fitur katalog produk untuk workspace ini saat ini dalam status nonaktif. Aktifkan modul produk untuk mulai mengelola produk dan menerima transaksi pesanan.
                    </p>

                    {/* Tombol Aksi Utama */}
                    <div className="space-y-3">
                        <Btn
                            onClick={onActivateProduct}
                            variant="primary"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {/* <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" /> */}
                            <span>{loading ? 'Processing' : 'Aktifkan Katalog Produk'}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Btn>

                        {/* Sub-text / Bantuan */}
                        <p className="text-xs text-gray-400">
                            Butuh bantuan? Hubungi tim support platform kami.
                        </p>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Sub-nav Container */}
            <div className="border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
                {/* Tab Navigation Wrapper dengan Horizontal Scroll */}
                <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleClickTab(t.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                                tab === t.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Tab Content Wrapper */}
            <div className="flex-1 overflow-auto">
                {renderingTab()}
            </div>
        </div>
    );
}