import { Badge } from "@/app/components/Bagde";
import { Btn } from "@/app/components/Button";
import { Card } from "@/app/components/Cards";
import { PageHeader } from "@/app/components/PageHeader";
import useAxios from "@/lib/axios-service";
import { useAIModelStore } from "@/lib/store/aiModelStore";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { AIModel, Workspace } from "@/lib/types";
import { Bot, CheckCircle2, Cpu, Database, Info, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";



export default function TabSettingChatbot({ workspaceId }: { workspaceId: string }) {
    const { AxiosPrivate } = useAxios();
    const { workspace, setWorkspace } = useWorkspaceStore();
    const { aimodels, setAIModels } = useAIModelStore();

    const [loading, setLoading] = useState<boolean>(false);
    const [updatingType, setUpdatingType] = useState<"chat" | "embedding" | null>(null);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await AxiosPrivate.get(`/aimodels/active`);
            console.log("models: ", res.data);
            const result = res.data;
            setAIModels((result.data as AIModel[]) || []);
        } catch (err) {
            console.error("Fetch error: ", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeModelSelection = async (modelId: string, type: "chat" | "embedding") => {
        if (!workspace) return;

        const oldWorkspace = { ...workspace };
        setUpdatingType(type);

        // Dynamic key update untuk UI yang responsif
        const updateKey = type === "chat" ? "activeChatModelId" : "activeEmbeddingModelId";
        setWorkspace({ ...workspace, [updateKey]: modelId } as Workspace);

        try {
            const payload = type === "chat" ? { activeChatModelId: modelId } : { activeEmbeddingModelId: modelId };
            const res = await AxiosPrivate.patch(`/workspaces/${workspace.id}`, payload);
            const updatedWorkspace = res.data.data as Workspace;
            setWorkspace(updatedWorkspace);
        } catch (err) {
            setWorkspace(oldWorkspace);
            console.error("Error updating workspace model selection: ", err);
        } finally {
            setUpdatingType(null);
        }
    };

    useEffect(() => {
        if (!workspaceId) return;
        fetchModels();
    }, [workspaceId]);

    return (
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-background">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                    <PageHeader
                        title="AI Engines & Settings"
                        subtitle="Konfigurasikan pilihan model, mesin respons utama, dan model vector embedding untuk RAG workspace Anda."
                    />
                    <Btn
                        variant="outline"
                        size="sm"
                        onClick={fetchModels}
                        disabled={loading}
                        className={`self-start sm:self-auto`}
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        Reload Models
                    </Btn>
                </div>

                {/* SECTION 1: PRIMARY ENGINES SELECTION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Active Chat Engine Card */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Primary Chat Engine</h3>
                                    <p className="text-[11px] text-muted-foreground">Generates natural language conversational replies</p>
                                </div>
                            </div>
                            {updatingType === "chat" && (
                                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <select
                                value={workspace?.activeChatModelId || ""}
                                onChange={(e) => handleChangeModelSelection(e.target.value, "chat")}
                                disabled={loading || updatingType === "chat"}
                                className="w-full text-xs font-semibold bg-muted/40 border border-border px-3.5 py-2.5 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            >
                                <option value="" disabled>Select Chat Model...</option>
                                {aimodels?.filter((m) => m.isChat && m.isActive).map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name} — ({model.provider})
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                <Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                <span>Digunakan secara default untuk menangani semua percakapan masuk.</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Embedding Engine Card */}
                    <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground">Primary Embedding Model</h3>
                                    <p className="text-[11px] text-muted-foreground">Processes vectorization for knowledge retrieval (RAG)</p>
                                </div>
                            </div>
                            {updatingType === "embedding" && (
                                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <select
                                value={workspace?.activeEmbeddingModelId || ""}
                                onChange={(e) => handleChangeModelSelection(e.target.value, "embedding")}
                                disabled={loading || updatingType === "embedding"}
                                className="w-full text-xs font-semibold bg-muted/40 border border-border px-3.5 py-2.5 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            >
                                <option value="" disabled>Select Embedding Engine...</option>
                                {aimodels?.filter((m) => m.isEmbedding && m.isActive).map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name} — ({model.provider})
                                    </option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                                <Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                <span>Menentukan Vektor Dimensi dokumen saat diproses ke Knowledge Base.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: AI MODEL REGISTRY TABLE */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold tracking-tight text-foreground">
                                    Available AI Models Registry
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Daftar kemampuan model, limitasi konteks, dan estimasi biaya per 1 juta token.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Card className="overflow-hidden border border-border shadow-sm rounded-xl">
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40 whitespace-nowrap">
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Model & Code</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Provider</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Capabilities</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Context Limit</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pricing / 1M</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Active Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, idx) => (
                                            <tr key={idx} className="animate-pulse">
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-32 mb-1" /><div className="h-3 bg-muted/60 rounded w-20" /></td>
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-16" /></td>
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-12" /></td>
                                                <td className="px-4 py-4"><div className="h-4 bg-muted rounded w-16 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : aimodels?.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                                                No AI models found in the database.
                                            </td>
                                        </tr>
                                    ) : (
                                        aimodels?.map((model) => {
                                            const isFree = model.inputPricePer1M === 0 && model.outputPricePer1M === 0;
                                            const isActiveChat = model.id === workspace?.activeChatModelId;
                                            const isActiveEmbed = model.id === workspace?.activeEmbeddingModelId;

                                            return (
                                                <tr
                                                    key={model.id}
                                                    className={`hover:bg-muted/30 transition-colors ${isActiveChat || isActiveEmbed ? 'bg-primary/[0.02]' : ''
                                                        }`}
                                                >
                                                    {/* Model Name & Code */}
                                                    <td className="px-4 py-3.5 max-w-[200px]">
                                                        <div className="text-xs font-semibold text-foreground truncate">{model.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                                                            {model.modelCode}
                                                        </div>
                                                    </td>

                                                    {/* Provider */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <span className="bg-muted text-foreground border border-border/80 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide">
                                                            {model.provider}
                                                        </span>
                                                    </td>

                                                    {/* Capabilities */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {model.isChat && (
                                                                <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                                                                    Chat
                                                                </span>
                                                            )}
                                                            {model.isEmbedding && (
                                                                <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                                                    Embedding
                                                                </span>
                                                            )}
                                                            {model.isVision && (
                                                                <span className="text-[9px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">
                                                                    Vision
                                                                </span>
                                                            )}
                                                            {model.isAudio && (
                                                                <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                                                    Audio
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Context Window */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                                                        <div className="text-foreground font-medium">
                                                            {model.contextWindow ? model.contextWindow.toLocaleString() : "-"} <span className="text-[10px] text-muted-foreground font-sans">tokens</span>
                                                        </div>
                                                        {model.isChat && model.maxOutputToken > 0 && (
                                                            <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                                                                max out: {model.maxOutputToken.toLocaleString()}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Pricing */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs">
                                                        {isFree ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                                                Free
                                                            </span>
                                                        ) : (
                                                            <div className="space-y-0.5 text-[11px]">
                                                                <div className="text-foreground">
                                                                    In: <span className="font-semibold">Rp {model.inputPricePer1M.toLocaleString("id-ID")}</span>
                                                                </div>
                                                                {!model.isEmbedding && (
                                                                    <div className="text-muted-foreground text-[10px]">
                                                                        Out: Rp {model.outputPricePer1M.toLocaleString("id-ID")}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap">
                                                        <Badge
                                                            variant={model.isActive ? "success" : "danger"}
                                                            className="text-[10px] font-semibold px-2 py-0.5"
                                                        >
                                                            {model.isActive ? "Active" : "Disabled"}
                                                        </Badge>
                                                    </td>

                                                    {/* Current Role Indicator */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {isActiveChat && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                                                    <CheckCircle2 className="w-3 h-3" /> Chat Engine
                                                                </span>
                                                            )}
                                                            {isActiveEmbed && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                                                                    <CheckCircle2 className="w-3 h-3" /> Embedding Engine
                                                                </span>
                                                            )}
                                                            {!isActiveChat && !isActiveEmbed && (
                                                                <span className="text-muted-foreground/30 text-xs font-mono">—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}