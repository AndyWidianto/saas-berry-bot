import { Badge } from "@/app/components/Bagde";
import { Btn } from "@/app/components/Button";
import { Card } from "@/app/components/Cards";
import { PageHeader } from "@/app/components/PageHeader";
import useAxios from "@/lib/axios-service";
import { AILogs, ResponseApi } from "@/lib/types";
import axios from "axios";
import { ArrowUpRight, Bot, ChevronLeft, ChevronRight, Clock, Download, Loader2, RefreshCw, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";



export default function TabAILog({ workspaceId }: { workspaceId: string }) {
  const { AxiosPrivate } = useAxios();

  // States Data & Filter
  const [ailogs, setAilogs] = useState<AILogs[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AILogs | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingExport, setLoadingExport] = useState(false);

  // Pagination States
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [cursorId, setCursorId] = useState<string | null>();
  const [limit] = useState<number>(10);

  const fetchAiLogs = async () => {
    setLoading(true);
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/aimodels/ailogs`, {
        params: {
          limit: limit,
          cursor: cursorId
        }
      });
      const result: ResponseApi = res.data;
      setCursorId(result.nextId);
      setAilogs(result.data || []);
      setTotalPage(result.totalPage || 1);
      setTotalItems(result.total || (result.data ? result.data.length : 0));
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      setLoading(false);
    }
  };


  const exportToCSV = async () => {
    setLoadingExport(true);
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/aimodels/ailogs/export`);
      const result = res.data;
      const ailogs: AILogs[] = result.data;
      const headers = Object.keys(ailogs[0]).join(',');

      const rows = ailogs.map(row =>
        Object.values(row)
          .map(value => `"${String(value).replace(/"/g, '""')}"`) // Bungkus string dengan double quote agar aman dari koma
          .join(',')
      );

      const csvContent = '\uFEFF' + [headers, ...rows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_data_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();

      // Cleanup memory
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Fetch error: ", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Gagal export data.";
        toast.error(message);
      }
    } finally {
      setLoadingExport(false);
    }
  };

  useEffect(() => {
    fetchAiLogs();
  }, [page, workspaceId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset ke halaman pertama saat melakukan pencarian
    fetchAiLogs();
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Section */}
        <PageHeader
          title="AI Logs"
          subtitle="Pantau respons AI, tingkat keyakinan (confidence score), latensi, dan pemicu eskalasi"
          actions={
            <div className="flex items-center gap-2">
              <Btn
                variant="outline"
                size="sm"
                onClick={fetchAiLogs}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Btn>
              <Btn variant="secondary" size="sm" onClick={exportToCSV}>
                {loadingExport ? <>
                  <Loader2 className="animate-spin w-3.5 h-3.5" />
                  processing
                </> :
                  <>
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </>}
              </Btn>
            </div>
          }
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search question or answer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 rounded-lg pl-9 pr-4 py-1.5 text-xs border border-transparent focus:border-primary/40 focus:bg-background focus:outline-none transition-all"
            />
          </form>

          <div className="flex items-center gap-2 text-xs text-muted-foreground self-end sm:self-auto">
            <span>Total Log: <strong className="text-foreground">{totalItems}</strong></span>
          </div>
        </div>

        {/* Table Container */}
        <Card className="overflow-hidden border border-border shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Question & Answer</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Model</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Metrics</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-3.5 space-y-2">
                        <div className="h-3.5 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted/60 rounded w-1/2" />
                      </td>
                      <td className="px-4 py-3.5"><div className="h-3 bg-muted rounded w-16" /></td>
                      <td className="px-4 py-3.5"><div className="h-3 bg-muted rounded w-20" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-muted rounded w-12" /></td>
                      <td className="px-4 py-3.5"><div className="h-3 bg-muted rounded w-12 ml-auto" /></td>
                      <td className="px-4 py-3.5"><div className="h-3 bg-muted rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : ailogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Bot className="w-8 h-8 text-muted-foreground/40 stroke-1" />
                        <span>No AI logs found for this filter.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ailogs.map((log) => {
                    const confidencePercent = log.confidence <= 1
                      ? Math.round(log.confidence * 100)
                      : Math.round(log.confidence);

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        {/* Question & Answer Overview */}
                        <td className="px-4 py-3 max-w-[280px]">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1">
                              {log.question}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {log.answer || <em className="text-muted-foreground/50">No answer generated</em>}
                            </span>
                          </div>
                        </td>

                        {/* Confidence Indicator */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(confidencePercent, 100)}%`,
                                  backgroundColor:
                                    confidencePercent > 75
                                      ? "#10b981"
                                      : confidencePercent > 50
                                        ? "#f59e0b"
                                        : "#ef4444",
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono font-medium text-foreground">
                              {confidencePercent}%
                            </span>
                          </div>
                        </td>

                        {/* Model Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.modelName ? (
                            <span className="font-mono bg-muted/80 text-foreground border border-border/80 px-2 py-0.5 rounded text-[10px] font-medium">
                              {log.modelName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">-</span>
                          )}
                        </td>

                        {/* Status Badges */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {log.isEscalated ? (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                Escalated
                              </Badge>
                            ) : log.isFallback ? (
                              <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
                                Fallback
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                                Success
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Metrics (Latency & Tokens) */}
                        <td className="px-4 py-3 text-xs font-mono text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-0.5 text-[10px]">
                            {log.latencyMs != null && (
                              <span className="text-foreground flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                {log.latencyMs}ms
                              </span>
                            )}
                            {log.tokensUsed != null && (
                              <span className="text-muted-foreground/70">
                                {log.tokensUsed} tokens
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Timestamp */}
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <div className="px-4 py-3 border-t border-border bg-card flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{totalPage}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPage }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPage || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <div key={p} className="flex items-center gap-1">
                        {showEllipsis && <span className="text-xs text-muted-foreground px-1">...</span>}
                        <button
                          onClick={() => setPage(p)}
                          className={`min-w-[28px] h-7 px-1.5 text-xs rounded-md font-medium transition-colors ${page === p
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page >= totalPage || loading}
                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Detail Modal / Drawer bila Baris Diklik */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-card h-full border-l border-border p-6 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-semibold text-base">AI Log Detail</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">User Question</label>
                <div className="bg-muted/50 p-3 rounded-lg border border-border text-foreground font-medium">
                  {selectedLog.question}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground font-semibold block mb-1">AI Answer</label>
                <div className="bg-muted/50 p-3 rounded-lg border border-border text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedLog.answer ? <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {selectedLog.answer}
                  </ReactMarkdown> : <em className="text-muted-foreground">No Answer Generated</em>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-muted/30 p-2.5 rounded-lg border border-border/80">
                  <span className="text-muted-foreground block text-[10px]">Confidence Score</span>
                  <span className="font-semibold text-sm">{Math.round(selectedLog.confidence <= 1 ? selectedLog.confidence * 100 : selectedLog.confidence)}%</span>
                </div>
                <div className="bg-muted/30 p-2.5 rounded-lg border border-border/80">
                  <span className="text-muted-foreground block text-[10px]">Model Used</span>
                  <span className="font-semibold text-sm">{selectedLog.modelName || "-"}</span>
                </div>
                <div className="bg-muted/30 p-2.5 rounded-lg border border-border/80">
                  <span className="text-muted-foreground block text-[10px]">Latency</span>
                  <span className="font-semibold text-sm">{selectedLog.latencyMs ? `${selectedLog.latencyMs} ms` : "-"}</span>
                </div>
                <div className="bg-muted/30 p-2.5 rounded-lg border border-border/80">
                  <span className="text-muted-foreground block text-[10px]">Tokens Used</span>
                  <span className="font-semibold text-sm">{selectedLog.tokensUsed || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}