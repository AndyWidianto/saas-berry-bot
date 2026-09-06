"use client";

import { ArrowUpRight, CheckCircle, ChevronLeft, ChevronRight, Crown, Download, History, Loader2, Receipt, Wallet } from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Cards";
import { Badge, BadgeVariant } from "../../../components/Bagde";
import { Btn } from "../../../components/Button";
import { useEffect, useState } from "react";
import TopUpModal from "@/app/components/TopUpModal";
import useAxios from "@/lib/axios-service";
import { useParams } from "next/navigation";
import { CreditLedger, CreditTransactionType, Invoice, WorkspaceBalance } from "@/lib/types";
import { useBalanceStore } from "@/lib/store/balanceStore";
import { InvoicePdfDocument } from "@/app/components/InvoicePdfDocument";
import { pdf } from "@react-pdf/renderer";
import axios from "axios";
import { toast } from "sonner";
import Script from "next/script";


declare global {
    interface Window {
        snap: {
            pay: (
                token: string,
                options: {
                    onSuccess?: (result: any) => void;
                    onPending?: (result: any) => void;
                    onError?: (result: any) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}


const getTransactionBadgeVariant = (type: CreditTransactionType): BadgeVariant => {
    switch (type) {
        case 'TOP_UP':
            return 'success';
        case 'BONUS':
            return 'purple';
        case 'REFUND':
            return 'info';
        case 'USAGE_CHAT':
        case 'USAGE_RAG':
            return 'secondary';
        default:
            return 'default';
    }
};

const formatTransactionType = (type: CreditTransactionType) => {
    return type.replace('_', ' ');
};

const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val || 0);



export default function BillingPage() {
    const { AxiosPrivate } = useAxios();
    const { balance, setBalance } = useBalanceStore();
    const { workspace: workspaceId } = useParams();

    const [activeTab, setActiveTab] = useState<"invoices" | "ledgers">("invoices");
    const [openModalTopUp, setOpenModalTopUp] = useState(false);

    // State Data Invoices
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoicePage, setInvoicePage] = useState(1);
    const [invoiceNextId, setInvoiceNextId] = useState<string | null>(null);
    const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
    const [invoiceTotalItems, setInvoiceTotalItems] = useState(0);

    // State Data Credit Ledgers
    const [ledgers, setLedgers] = useState<CreditLedger[]>([]);
    const [ledgerPage, setLedgerPage] = useState(1);
    const [ledgerNextId, setLedgerNextId] = useState<string | null>(null);
    const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
    const [ledgerTotalItems, setLedgerTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const [loadingImport, setLoadingImport] = useState(false);

    const itemsPerPage = 10;

    const fetchBalance = async (balance: WorkspaceBalance | null) => {
        if (balance && balance.workspaceId === workspaceId) return;
        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/balance`);
            setBalance(res.data.data);
        } catch (err) {
            console.error("Fetch Balance Error: ", err);
        }
    };

    // 2. Fetch Invoices (Tab 1)
    const fetchInvoices = async (page: number, currentNextId?: string | null) => {
        try {
            setLoading(true);
            const res = await AxiosPrivate.get(`/${workspaceId}/invoices`, {
                params: {
                    limit: itemsPerPage,
                    lastId: currentNextId ?? undefined
                }
            });
            const result = res.data;

            setInvoices(prev => page === 1 ? result.data : [...prev, ...result.data]);
            setInvoiceTotalPages(result.totalPage || 1);
            setInvoiceTotalItems(result.total || 0);
            setInvoiceNextId(result.nextId);
        } catch (err) {
            console.error("Fetch Invoices Error: ", err);
        } finally {
            setLoading(false);
        }
    };

    // 3. Fetch Credit Ledgers (Tab 2)
    const fetchLedgers = async (page: number, currentNextId?: string | null) => {
        try {
            setLoading(true);
            const res = await AxiosPrivate.get(`/${workspaceId}/creditledger`, {
                params: {
                    limit: itemsPerPage,
                    lastId: currentNextId ?? undefined
                }
            });
            const result = res.data;

            setLedgers(prev => page === 1 ? result.data : [...prev, ...result.data]);
            setLedgerTotalPages(result.totalPage || 1);
            setLedgerTotalItems(result.total || 0);
            setLedgerNextId(result.nextId);
        } catch (err) {
            console.error("Fetch Ledgers Error: ", err);
        } finally {
            setLoading(false);
        }
    };

    // Export PDF Invoice
    const handleDownloadInvoicePdf = async () => {
        if (!workspaceId) return;
        try {
            setLoadingImport(true);
            const response = await AxiosPrivate.get(`/${workspaceId}/invoices/import`);
            const invoicesData = response.data.data;

            const blob = await pdf(
                <InvoicePdfDocument workspaceId={workspaceId as string} invoices={invoicesData} />
            ).toBlob();

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `invoice-${workspaceId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Gagal membuat PDF invoice:', error);
            toast.error('Gagal mengeksport PDF invoice');
        } finally {
            setLoadingImport(false);
        }
    };

    // Instant Top Up Midtrans
    const handleCheckout = async (nominal: number) => {
        try {
            const res = await AxiosPrivate.post(`/${workspaceId}/topup`, { nominal });
            const result = res.data;

            if (typeof window !== "undefined" && window.snap) {
                window.snap.pay(result.token, {
                    onSuccess: function () {
                        toast.success("Pembayaran berhasil!");
                        fetchBalance(null);
                        fetchInvoices(1, null);
                    },
                    onPending: function () {
                        toast.info("Menunggu pembayaran diselesaikan.");
                        fetchInvoices(1, null);
                    },
                    onError: function () {
                        toast.error("Pembayaran gagal!");
                    },
                    onClose: function () {
                        toast.warning("Popup pembayaran ditutup.");
                    }
                });
            }
        } catch (err) {
            console.error("Checkout error: ", err);
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Gagal melakukan checkout");
            }
        }
    };

    useEffect(() => {
        if (!workspaceId) return;
        fetchBalance(balance);
        fetchInvoices(1, null);
        fetchLedgers(1, null);
    }, [workspaceId]);

    // Formatters Helper
    const formatIDR = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

    return (
        <div className="h-full overflow-auto p-6">
            <Script
                src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js"}
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            <PageHeader title="Wallet & Top Up" subtitle="Kelola saldo Anda, beli kredit, dan pantau penggunaan" />

            {/* Current Balance Banner */}
            <Card className="p-4 sm:p-5 mb-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 shadow-sm rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-foreground">Current Balance</span>
                            <Badge variant="success" className="text-[10px] px-2 py-0.5">Active</Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 pt-1">
                            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {formatIDR(balance?.amount || 0)}
                            </span>
                            <span className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                                <span className="hidden sm:inline">·</span> Credits never expire
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                            ⚡ Mode Sandbox / Testing
                        </span>
                        <Btn
                            variant="primary"
                            size="sm"
                            icon={ArrowUpRight}
                            onClick={() => setOpenModalTopUp(true)}
                            className="flex-1 sm:flex-none justify-center text-xs"
                        >
                            Instant Top Up
                        </Btn>
                    </div>
                </div>
            </Card>

            {/* Billing & Ledger Card Container */}
            <Card className="overflow-hidden">
                {/* Navigation Tabs Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border gap-4 bg-muted/10">
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg w-fit border border-border/50">
                        <button
                            onClick={() => setActiveTab("invoices")}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "invoices"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Receipt className="w-3.5 h-3.5" />
                            Riwayat Tagihan & Top Up
                        </button>
                        <button
                            onClick={() => setActiveTab("ledgers")}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "ledgers"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <History className="w-3.5 h-3.5" />
                            Log Mutasi Kredit
                        </button>
                    </div>

                    {activeTab === "invoices" && (
                        <Btn variant="secondary" size="sm" onClick={handleDownloadInvoicePdf} disabled={loadingImport}>
                            {loadingImport ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" /> Download PDF Receipts
                                </>
                            )}
                        </Btn>
                    )}
                </div>

                {activeTab === "invoices" && (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">No Invoice</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Total Biaya</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Kredit Dibeli</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Status</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                            Belum ada tagihan top up.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 text-xs font-mono font-medium text-foreground">
                                                {inv.invoiceNumber}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(inv.createdAt).toLocaleDateString("id-ID", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-xs font-semibold font-mono">
                                                {formatIDR(Number(inv.totalAmount))}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-emerald-600 font-semibold font-mono">
                                                +{inv.creditAmount.toLocaleString("id-ID")} Kredit
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {inv.status === "PAID" && <Badge variant="success">Lunas</Badge>}
                                                {inv.status === "PENDING" && <Badge variant="warning">Menunggu Pembayaran</Badge>}
                                                {inv.status === "CANCELLED" && <Badge variant="destructive">Dibatalkan</Badge>}
                                            </td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {inv.status === "PENDING" && inv.paymentUrl ? (
                                                    <a
                                                        href={inv.paymentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded font-medium inline-block shadow-sm transition-colors"
                                                    >
                                                        Bayar Sekarang
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: LOG MUTASI KREDIT (CREDIT LEDGERS) */}
                {activeTab === "ledgers" && (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Ref ID</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Tipe</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Deskripsi</th>
                                    <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right">Jumlah Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {ledgers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                            Belum ada log penggunaan kredit.
                                        </td>
                                    </tr>
                                ) : (
                                    ledgers.map((tx) => {
                                        const isPositive = tx.amount > 0;
                                        return (
                                            <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 text-xs font-mono text-foreground font-medium">
                                                    {tx.invoiceId ? "TOP-UP" : tx.id.slice(0, 8)}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Badge variant={isPositive ? "success" : "secondary"}>
                                                        {tx.type}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[250px] truncate" title={tx.description}>
                                                    <span>{tx.description}</span>
                                                    {tx.channel && (
                                                        <span className="ml-1.5 inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                                                            {tx.channel}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-semibold text-right whitespace-nowrap font-mono">
                                                    <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                        {isPositive ? "+" : "-"}{Math.abs(tx.amount).toLocaleString("id-ID")}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                    <div>
                        Showing Page <span className="font-medium text-foreground">{activeTab === "invoices" ? invoicePage : ledgerPage}</span> of{" "}
                        <span className="font-medium text-foreground">{activeTab === "invoices" ? invoiceTotalPages : ledgerTotalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Btn
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                if (activeTab === "invoices" && invoicePage > 1) {
                                    setInvoicePage(p => p - 1);
                                    fetchInvoices(invoicePage - 1, invoiceNextId);
                                } else if (activeTab === "ledgers" && ledgerPage > 1) {
                                    setLedgerPage(p => p - 1);
                                    fetchLedgers(ledgerPage - 1, ledgerNextId);
                                }
                            }}
                            disabled={activeTab === "invoices" ? invoicePage === 1 : ledgerPage === 1}
                            className="h-8 px-2 text-xs"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </Btn>

                        <Btn
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                if (activeTab === "invoices" && invoicePage < invoiceTotalPages) {
                                    setInvoicePage(p => p + 1);
                                    fetchInvoices(invoicePage + 1, invoiceNextId);
                                } else if (activeTab === "ledgers" && ledgerPage < ledgerTotalPages) {
                                    setLedgerPage(p => p + 1);
                                    fetchLedgers(ledgerPage + 1, ledgerNextId);
                                }
                            }}
                            disabled={activeTab === "invoices" ? invoicePage >= invoiceTotalPages : ledgerPage >= ledgerTotalPages}
                            className="h-8 px-2 text-xs"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Btn>
                    </div>
                </div>
            </Card>

            <TopUpModal isOpen={openModalTopUp} onClose={() => setOpenModalTopUp(false)} onCheckout={handleCheckout} />
        </div>
    );
}