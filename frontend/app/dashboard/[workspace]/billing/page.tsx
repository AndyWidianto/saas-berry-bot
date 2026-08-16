"use client";

import { ArrowUpRight, CheckCircle, ChevronLeft, ChevronRight, Crown, Download, Wallet } from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Cards";
import { Badge, BadgeVariant } from "../../../components/Bagde";
import { Btn } from "../../../components/Button";
import { useEffect, useState } from "react";
import TopUpModal from "@/app/components/TopUpModal";
import useAxios from "@/lib/axios-service";
import { useParams } from "next/navigation";
import { CreditTransactionType, Invoice, ResponseApi, WorkspaceBalance } from "@/lib/types";
import { useBalanceStore } from "@/lib/store/balanceStore";



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


export default function BillingPage() {
    const { AxiosPrivate } = useAxios();
    const { balance, setBalance } = useBalanceStore(); // Mengambil saldo dari store    
    const [openModalTopUp, setOpenModalTopUp] = useState(false);
    const { workspace } = useParams();
    const [transactions, setTransactions] = useState<Invoice[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [nextId, setNextId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Kalkulasi Pagination
    const itemsPerPage = 10;
    const [totalItems, setTotalItems] = useState(100);
    const [totalPages, setTotalPages] = useState(1);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    const fetchBalance = async () => {
        if (balance !== null) return; // Jika saldo sudah ada, tidak perlu fetch lagi
        try {
            const res = await AxiosPrivate.get(`${workspace}/balance`);
            const result = res.data;
            setBalance(result.data.amount);
        } catch (err) {
            console.error("Fetch Error: ", err);
        }
    }
    const fetchInvoices = async (page: number, currentNextId?: string | null) => {
        if (page > totalPages && totalPages > 0) return;
        if (loading) return;

        try {
            setLoading(true);
            let searchParam = `limit=${itemsPerPage}`;
            if (page > 1 && currentNextId) {
                searchParam += `&lastId=${currentNextId}`;
            }

            const res = await AxiosPrivate.get(`/${workspace}/invoices?${searchParam}`);
            const result = res.data as ResponseApi;

            setTransactions(prev => page === 1 ? result.data : [...prev, ...result.data]);
            setTotalPages(result.totalPage);
            setTotalItems(result.total);
            setNextId(result.nextId);
        } catch (err) {
            console.error("fetch error: ", err);
        } finally {
            setLoading(false);
        }
    };
    const onDownloadAllReceipts = () => {
        alert("Sedang proses...")
    }

    const handleNextPage = () => {
        if (currentPage < totalPages && !loading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchInvoices(nextPage, nextId); // Pass nextPage secara langsung!
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };
    useEffect(() => {
        if (!workspace) return;

        fetchBalance();

        setCurrentPage(1);
        setNextId(null);
        fetchInvoices(1, null);

    }, [workspace]);
    return (
        <div className="h-full overflow-auto p-6">
            <PageHeader title="Wallet & Top Up" subtitle="Manage your balance, purchase credits, and track usage" />

            {/* Current Balance Banner */}
            <Card className="p-5 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">Current Balance</span>
                            <Badge variant="success">Active</Badge>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-bold text-foreground">Rp.{balance?.toLocaleString() || 0}</span>
                            <span className="text-xs text-muted-foreground">· Credits never expire</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Btn variant="secondary" size="sm">View History</Btn>
                        <Btn variant="primary" size="sm" icon={ArrowUpRight} onClick={() => setOpenModalTopUp(true)}>Instant Top Up</Btn>
                    </div>
                </div>
            </Card>

            {/* Remaining Resource Balances */}
            {/* <Card className="p-5 mb-6">
                <h3 className="font-semibold text-sm mb-4">Available Resources</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Messages Left", used: 6396, total: 25000, color: "#6366f1" },
                        { label: "Active Agents Slots", used: 3, total: 10, color: "#10b981" },
                        { label: "AI Tokens Left", used: 280000, total: 1000000, color: "#f59e0b" },
                        { label: "Contacts Limit", used: 32800, total: 50000, color: "#3b82f6" },
                    ].map(u => {
                        // Menghitung sisa kuota yang tersedia
                        const pct = Math.round((u.used / u.total) * 100);
                        return (
                            <div key={u.label}>
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="font-medium text-foreground">{u.label}</span>
                                    <span className="text-muted-foreground">{pct}% Left</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: u.color }} />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>{u.used.toLocaleString()} available</span>
                                    <span>{u.total.toLocaleString()} max</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card> */}

            {/* Top Up / Transaction History */}
            <Card className="overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div>
                        <h3 className="font-semibold text-sm">Credit & Billing History</h3>
                        <p className="text-xs text-muted-foreground">Riwayat pengisian ulang dan penggunaan kredit workspace.</p>
                    </div>
                    <Btn
                        variant="secondary"
                        size="sm"
                        icon={Download}
                        onClick={onDownloadAllReceipts}
                    >
                        Download Receipts
                    </Btn>
                </div>

                {/* Table Wrapper */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Transaction / Invoice ID</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Date</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Type</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase">Description</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-right">Amount</th>
                                <th className="px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase text-center">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {currentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                        Belum ada riwayat transaksi
                                    </td>
                                </tr>
                            ) : (
                                currentTransactions.map((tx) => {
                                    const isPositive = tx.type === 'TOP_UP' || tx.type === 'BONUS' || tx.type === 'REFUND';
                                    const formattedDate = new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });

                                    return (
                                        <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 text-xs font-mono text-foreground font-medium">
                                                {tx.invoiceId || tx.id.slice(0, 8)}
                                            </td>

                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {formattedDate}
                                            </td>

                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge variant={getTransactionBadgeVariant(tx.type)}>
                                                    {formatTransactionType(tx.type)}
                                                </Badge>
                                            </td>

                                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate" title={tx.description}>
                                                <span>{tx.description}</span>
                                                {tx.channel && (
                                                    <span className="ml-1.5 inline-block text-[10px] bg-muted px-1.5 py-0.2 rounded font-mono">
                                                        {tx.channel}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-xs font-semibold text-right whitespace-nowrap font-mono">
                                                <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                    {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('id-ID')}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                {tx.invoiceId ? (
                                                    <button
                                                        onClick={() => { }}
                                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                        Receipt
                                                    </button>
                                                ) : (
                                                    <span className="text-muted-foreground/40 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
                        <div>
                            Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to{' '}
                            <span className="font-medium text-foreground">{Math.min(endIndex, totalItems)}</span> of{' '}
                            <span className="font-medium text-foreground">{totalItems}</span> entries
                        </div>

                        <div className="flex items-center gap-2">
                            <Btn
                                variant="secondary"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="h-8 px-2 text-xs"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </Btn>

                            <span className="text-xs font-medium px-2">
                                Page {currentPage} of {totalPages}
                            </span>

                            <Btn
                                variant="secondary"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="h-8 px-2 text-xs"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Btn>
                        </div>
                    </div>
                )}
            </Card>
            <TopUpModal isOpen={openModalTopUp} onClose={() => setOpenModalTopUp(false)} />
        </div>
    );
}