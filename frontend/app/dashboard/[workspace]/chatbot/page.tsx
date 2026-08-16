"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ScrollText,
  Upload,
  Search,
  Plus,
  Trash2,
  Download,
  Settings
} from "lucide-react";
import { Btn } from "../../../components/Button";
import { toast } from "sonner";
import cn from "../../../components/ClassName";
import { PageHeader } from "../../../components/PageHeader";
import { Badge } from "../../../components/Bagde";
import { Card } from "../../../components/Cards";
import { AILogs, AIModel, Knowledge, ResponseApi, Workspace } from "@/lib/types";
import useAxios from "@/lib/axios-service";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAIModelStore } from "@/lib/store/aiModelStore";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";


type ChatbotTab = "knowledge" | "logs" | "settings";


const aiLogs = [
  { id: "1", question: "How do I track my order?", answer: "You can track your order by visiting our website and entering your order number in the tracking section...", confidence: 96, fallback: false, escalated: false, time: "10:37 AM" },
  { id: "2", question: "What is your return policy?", answer: "Our return policy allows you to return items within 30 days of purchase for a full refund...", confidence: 91, fallback: false, escalated: false, time: "10:25 AM" },
  { id: "3", question: "Can I change my order after placing it?", answer: "Order modifications are possible within 1 hour of placement. Please contact our support team...", confidence: 78, fallback: false, escalated: true, time: "10:12 AM" },
  { id: "4", question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, American Express, PayPal, and bank transfers.", confidence: 99, fallback: false, escalated: false, time: "09:58 AM" },
  { id: "5", question: "My package is damaged, what do I do?", answer: "", confidence: 42, fallback: true, escalated: true, time: "09:45 AM" },
  { id: "6", question: "Do you ship internationally?", answer: "Yes! We ship to over 50 countries worldwide. International shipping takes 7-14 business days.", confidence: 88, fallback: false, escalated: false, time: "09:30 AM" },
];


const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export default function ChatbotPage() {
  const { AxiosPrivate } = useAxios();
  const { workspace, setWorkspace } = useWorkspaceStore();
  const { aimodels, setAIModels } = useAIModelStore();
  const [tab, setTab] = useState<ChatbotTab>("knowledge");
  const [showAdvancedChunking, setShowAdvancedChunking] = useState(false);
  const [loadingCreateKnowledge, setLoadingCreateKnowledge] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
  const [knowledgeId, setKnowledgeId] = useState<string | null>(null);
  const [ailogs, setAilogs] = useState<AILogs[]>([]);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const { workspace: workspaceId } = useParams();

  const tabs: { id: ChatbotTab; label: string; icon: React.ElementType }[] = [
    { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
    { id: "logs", label: "AI Logs", icon: ScrollText },
    { id: "settings", label: "Settings & Token AI", icon: Settings }
  ];

  const handleUpdateChunking = async (value: number, type: "size" | "overlap") => {
    if (!workspace) return;
    setWorkspace({ ...workspace, [type === "size" ? "chunkSize" : "chunkOverlap"]: value } as Workspace);
  }

  const fetchModels = async () => {
    try {
      const res = await AxiosPrivate.get(`/aimodels`);
      const result = res.data;
      console.log(result);
      setAIModels(result.data as AIModel[]);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const fetchKnowledges = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/knowledges`);
      const result: ResponseApi = res.data;
      const data: Knowledge[] = result.data;
      setKnowledgeItems(data);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const fetchAiLogs = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/aimodels/ailogs`);
      const result = res.data;
      console.log(result);
      setAilogs(result.data);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const deleteKnowledge = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus" + id + "?")) return;
    try {
      setKnowledgeId(id);
      const res = await AxiosPrivate.delete(`/${workspaceId}/knowledges/${id}`);
      const result = res.data;
      setKnowledgeItems(prev => prev.filter(p => p.id !== id));
      toast.success("Knowledge berhasil di hapus");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Gagal delete knowledge";
        toast.error(message);
      }
    } finally {
      setKnowledgeId(null);
    }
  }

  const randomId = (max: number, min: number) => {
    return `temporary-${Math.floor(Math.random() * (max - min + 1)) + min}`;
  }
  const handleCreateKnowledge = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!workspaceId) return;
    setLoadingCreateKnowledge(true);
    const temporaryId = randomId(1000, 9999);
    try {

      const createdAt = new Date().toISOString();
      const safeWorkspaceId = Array.isArray(workspaceId)
        ? workspaceId[0]
        : (workspaceId || "");

      setKnowledgeItems(prev => [{
        id: temporaryId,
        name: file.name || "",
        size: file.size || 0,
        totalChunk: 0,
        workspaceId: safeWorkspaceId || "",
        type: file.type.split("/")[1],
        status: "PROCESSING",
        createdAt: createdAt,
        updatedAt: createdAt,
      }, ...prev]);

      const formdata = new FormData();
      formdata.append("file", file);
      const res = await AxiosPrivate.post(`/${workspaceId}/knowledges`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const result = res.data;
      setKnowledgeItems(prev => prev.map(p => p.id === temporaryId ? (result.data) : p));
    } catch (err) {
      setKnowledgeItems(prev => prev.filter(p => p.id !== temporaryId));
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Gagal menambahkan knoledge";
        toast.error(message);
      }
      console.error("Fetch error: ", err);
    }
  }

  const handleChangeModelSelection = async (modelId: string, type: "chat" | "embedding") => {
    console.log("workspace: ", workspace);
    if (!workspace) return;
    const oldWorkspace = { ...workspace };
    setWorkspace({ ...workspace, activeEmbeddingModelId: modelId } as Workspace);
    try {
      const payload = type === "chat" ? { activeChatModelId: modelId } : { activeEmbeddingModelId: modelId };
      const res = await AxiosPrivate.patch(`/workspaces/${workspace.id}`, payload);
      const updatedWorkspace = res.data.data as Workspace;
      console.log("Updated workspace model selection: ", updatedWorkspace);
      setWorkspace(updatedWorkspace);
    } catch (err) {
      setWorkspace(oldWorkspace);
      console.error("Error updating workspace model selection: ", err);
    }
  }

  useEffect(() => {
    if (!workspaceId) return;
    if (tab === "settings") {
      if (!aimodels || aimodels.length === 0) {
        fetchModels();
      }
    }
    if (tab === "knowledge") {
      fetchKnowledges();
    }
    if (tab === "logs") {
      fetchAiLogs();
    }
  }, [workspaceId, tab])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Sub-nav */}
      <div className="border-b border-border bg-card px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex gap-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors", tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>
        {/* {tab === "builder" && (
          <div className="flex items-center gap-2 py-2">
            <Btn variant="ghost" size="sm" icon={RotateCcw}>Undo</Btn>
            <Btn variant="secondary" size="sm" icon={Save}>Save</Btn>
            <Btn variant="primary" size="sm" icon={Zap} onClick={() => toast.success("Flow published successfully!")}>Publish</Btn>
          </div>
        )} */}
      </div>

      {/* {tab === "builder" && (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-52 border-r border-border bg-card overflow-y-auto p-3 flex-shrink-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Node Types</p>
            <div className="space-y-1">
              {Object.entries(nodeTypeConfig).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted cursor-grab text-xs text-foreground">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                    <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  <span>{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] bg-[length:24px_24px]">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-md z-10">
              <button className="text-xs text-muted-foreground hover:text-foreground px-1 font-mono">-</button>
              <span className="text-xs font-medium text-foreground w-10 text-center">100%</span>
              <button className="text-xs text-muted-foreground hover:text-foreground px-1 font-mono">+</button>
              <div className="w-px h-4 bg-border" />
              <button className="text-xs text-muted-foreground hover:text-foreground">Fit</button>
            </div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ left: 100 }}>
              {flowEdges.map((edge, i) => {
                const src = nodes.find(n => n.id === edge.from);
                const tgt = nodes.find(n => n.id === edge.to);
                if (!src || !tgt) return null;
                const s = getNodeCenter(src);
                const t = getNodeCenter(tgt);
                const my = (s.y + t.y) / 2;
                return (
                  <g key={i}>
                    <path d={`M${s.x} ${s.y + 10} C${s.x} ${my} ${t.x} ${my} ${t.x} ${t.y - 10}`} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <circle cx={t.x} cy={t.y - 10} r="3" fill="var(--primary)" />
                  </g>
                );
              })}
            </svg>

            {nodes.map(node => {
              const cfg = nodeTypeConfig[node.type];
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={cn("absolute w-44 cursor-pointer rounded-xl border-2 transition-all select-none", selectedNode?.id === node.id ? "shadow-lg" : "hover:shadow-md")}
                  style={{
                    left: node.x + 100,
                    top: node.y + 60,
                    borderColor: selectedNode?.id === node.id ? cfg.color : "var(--border)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div className="px-3 py-2.5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground">{cfg.label}</p>
                      <p className="text-xs font-semibold text-foreground leading-tight">{node.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-64 border-l border-border bg-card overflow-y-auto p-4 flex-shrink-0">
            <h3 className="text-sm font-semibold mb-4">Properties</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Node Label</label>
                  <input className="w-full bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:border-primary/50 focus:outline-none" defaultValue={selectedNode.label} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Node Type</label>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <span className="text-xs font-medium capitalize">{selectedNode.type}</span>
                  </div>
                </div>
                {selectedNode.type === "message" && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Message Content</label>
                    <textarea className="w-full bg-muted rounded-lg px-3 py-2 text-xs resize-none border border-border focus:border-primary/50 focus:outline-none" rows={4} placeholder="Enter message text..." defaultValue="Welcome! How can I help you today?" />
                  </div>
                )}
                {selectedNode.type === "condition" && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Condition</label>
                    <select className="w-full bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:outline-none">
                      <option>Contains keyword</option>
                      <option>Equals</option>
                      <option>Starts with</option>
                    </select>
                  </div>
                )}
                {selectedNode.type === "delay" && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Delay Duration</label>
                    <div className="flex gap-2">
                      <input type="number" defaultValue={5} className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:outline-none" />
                      <select className="bg-muted rounded-lg px-2 py-2 text-xs border border-border focus:outline-none">
                        <option>min</option><option>hours</option><option>days</option>
                      </select>
                    </div>
                  </div>
                )}
                <Btn variant="danger" size="sm" icon={Trash2} className="w-full justify-center">Remove Node</Btn>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Select a node to edit its properties.</p>
            )}
          </div>
        </div>
      )} */}

      {tab === "knowledge" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <PageHeader title="Knowledge Base" subtitle="Train your AI with documents, URLs, and FAQs" actions={<Btn variant="primary" size="sm" icon={Plus}>Add Source</Btn>} />
            {/* Upload Zone */}
            <button onClick={() => inputFileRef.current?.click()} className="w-full">
              <Card className="p-8 border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer mb-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Drop files to upload</p>
                <p className="text-xs text-muted-foreground mb-3">Supports PDF, Word, TXT — max 50MB per file</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["PDF", "Word", "TXT", "Website URL", "FAQ", "Manual"].map(t => (
                    <Badge key={t} variant="default">{t}</Badge>
                  ))}
                </div>
              </Card>
              <input type="file" ref={inputFileRef} onChange={handleCreateKnowledge} accept=".pdf,.doc,.docx,.txt" className="hidden" />
            </button>
            {/* Knowledge List */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input className="w-full bg-muted rounded-lg pl-8 pr-3 py-1.5 text-xs border border-border focus:outline-none" placeholder="Search knowledge base..." />
                </div>
              </div>
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {["Title", "Type", "Chunks", "Status", "Updated", "Size", ""].map(h => (
                    <th key={h} className="text-left text-[11px] font-medium text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {knowledgeItems.map(k => (
                    <tr key={k.id} className={`border-b border-border/50 hover:bg-muted/30 ${k.id === knowledgeId || k.id.includes("temporary") ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-foreground">{k.name}</span></td>
                      <td className="px-4 py-3"><Badge variant="info">{k.type}</Badge></td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{k.totalChunk > 0 ? k.totalChunk : "—"}</td>
                      <td className="px-4 py-3"><Badge variant={k.status === "INDEXED" ? "success" : "warning"}>{k.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{k.updatedAt}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{k.size}</td>
                      <td className="px-4 py-3"><button onClick={() => deleteKnowledge(k.id)} disabled={k.id === knowledgeId} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <PageHeader title="AI Logs" subtitle="Monitor AI responses, confidence scores, and escalations" actions={<Btn variant="secondary" size="sm" icon={Download}>Export</Btn>} />
            <Card className="overflow-hidden">
              <div className="w-full overflow-x-auto rounded-md border border-border">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Question</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">AI Answer</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Confidence</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Model</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Fallback</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Escalated</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-right">Metrics</th>
                      <th className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {ailogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                          No logs available
                        </td>
                      </tr>
                    ) : (
                      ailogs.map((log) => {
                        const confidencePercent = log.confidence <= 1 ? Math.round(log.confidence * 100) : Math.round(log.confidence);

                        return (
                          <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-3 text-xs font-medium text-foreground max-w-[200px] truncate" title={log.question}>
                              {log.question}
                            </td>

                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[250px] truncate" title={log.answer || undefined}>
                              {log.answer ? (
                                log.answer
                              ) : (
                                <span className="italic text-muted-foreground/50">No answer</span>
                              )}
                            </td>

                            {/* Confidence */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
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
                                <span className="text-xs font-mono text-foreground font-medium">
                                  {confidencePercent}%
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                              {log.modelName ? (
                                <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
                                  {log.modelName}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/40">-</span>
                              )}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant={log.isFallback ? "warning" : "default"}>
                                {log.isFallback ? "Yes" : "No"}
                              </Badge>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant={log.isEscalated ? "destructive" : "default"}>
                                {log.isEscalated ? "Yes" : "No"}
                              </Badge>
                            </td>

                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono text-right whitespace-nowrap">
                              <div className="flex flex-col items-end gap-0.5 text-[10px]">
                                {log.latencyMs !== null && <span>{log.latencyMs}ms</span>}
                                {log.tokensUsed !== null && <span className="text-muted-foreground/60">{log.tokensUsed} tokens</span>}
                                {log.latencyMs === null && log.tokensUsed === null && <span>-</span>}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-xs text-muted-foreground font-mono text-right whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      )}

      {tab === "settings" && (
        <div className="flex-1 overflow-auto p-6 bg-background/95">
          <div className="max-w-5xl mx-auto space-y-10">
            {/* Header */}
            <div className="border-b border-border/60 pb-5">
              <PageHeader
                title="AI Settings & Wallets"
                subtitle="Manage your token balances, select embedding/chat models, and designate primary engines directly from the registry."
              />
            </div>

            {/* SECTION 1: ACTIVE ENGINE SELECTOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-5 rounded-xl border border-border/60">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Primary Chat Model
                </label>
                <select
                  value={workspace?.activeChatModelId || ""}
                  onChange={(e) => handleChangeModelSelection(e.target.value, "chat")}
                  className="w-full text-xs font-medium bg-card border border-border px-3 py-2 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="" disabled>Select Chat Engine...</option>
                  {aimodels?.filter(m => m.isChat && m.isActive).map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground/80">
                  Digunakan untuk merespons pertanyaan dan interaksi chat pengguna.
                </p>
              </div>

              {/* Selector untuk Embedding Model */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Primary Embedding Model (RAG)
                </label>
                <select
                  value={workspace?.activeEmbeddingModelId || ""}
                  onChange={(e) => handleChangeModelSelection(e.target.value, "embedding")}
                  className="w-full text-xs font-medium bg-card border border-border px-3 py-2 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                >
                  <option value="" disabled>Select Embedding Engine...</option>
                  {aimodels?.filter(m => m.isEmbedding && m.isActive).map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground/80">
                  Digunakan untuk memproses vektorisasi dokumen saat proses upload RAG.
                </p>
              </div>
            </div>

            {/* ADDED SECTION: RAG TEXT SPLITTING & CHUNKING CONFIGURATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 22V4c0-.5.2-1 .6-1.4C5 2.2 5.5 2 6 2h12c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4v18l-4-2-4 2-4-2-4 2z" /><path d="M14 10H8" /></svg>
                </div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Knowledge Base Indexing Parameters (RAG)
                </h3>
              </div>

              <Card className="p-5 border border-border bg-card shadow-sm rounded-xl space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Advanced Chunking Mode</h4>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      Sesuaikan akurasi pemotongan konteks dokumen untuk pencarian database vektor.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedChunking(!showAdvancedChunking)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none shadow-inner ${showAdvancedChunking ? 'bg-primary' : 'bg-muted'
                      }`}
                  >
                    <span
                      className={`pointer-events-none block h-4 w-4 rounded-full bg-background border border-border/20 shadow-md transition-transform ${showAdvancedChunking ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground block">
                        Chunk Size (Tokens)
                      </label>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono font-bold text-muted-foreground">
                        {workspace?.chunkSize || 500} tokens
                      </span>
                    </div>
                    <input
                      type="number"
                      min={200}
                      max={1500}
                      disabled={!showAdvancedChunking}
                      value={workspace?.chunkSize || 500}
                      onChange={(e) => handleUpdateChunking(Number(e.target.value), "size")}
                      className="w-full text-xs font-medium bg-card disabled:opacity-40 disabled:bg-muted/30 border border-border px-3 py-2 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground/80">
                      Ukuran maksimum potongan teks per blok. Rentang aman: 200 - 1500 tokens (Default: 500).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-foreground block">
                        Chunk Overlap (Tokens)
                      </label>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono font-bold text-muted-foreground">
                        {workspace?.chunkOverlap || 50} tokens
                      </span>
                    </div>
                    <input
                      type="number"
                      min={20}
                      max={300}
                      disabled={!showAdvancedChunking}
                      value={workspace?.chunkOverlap || 50}
                      onChange={(e) => handleUpdateChunking(Number(e.target.value), "overlap")}
                      className="w-full text-xs font-medium bg-card disabled:opacity-40 disabled:bg-muted/30 border border-border px-3 py-2 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition-all"
                    />
                    <p className="text-[10px] text-muted-foreground/80">
                      Jumlah token duplikasi antar potongan agar AI tidak kehilangan makna di area potongan teks (Disarankan 10% dari Chunk Size).
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* SECTION 2: AVAILABLE AI MODELS (TABLE) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m12 3-1.912 5.886H3.886L9 12.518 7.088 18.4 12 14.764 16.912 18.4 15 12.518l5.114-4.632h-6.202Z" /></svg>
                </div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  AI Model Capabilities Registry
                </h3>
              </div>

              <Card className="overflow-hidden border border-border bg-card shadow-sm rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 whitespace-nowrap">
                        {["Model Name & Code", "Provider", "Capabilities", "Context Window", "Pricing (/1M)", "Status", "Current Usage"].map(h => (
                          <th key={h} className="text-left text-[11px] font-bold text-muted-foreground/80 px-4 py-3.5 tracking-tight uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {aimodels?.map((model) => {
                        const isFree = model.inputPricePer1M === 0 && model.outputPricePer1M === 0;

                        const isActiveChat = model.id === workspace?.activeChatModelId;
                        const isActiveEmbed = model.id === workspace?.activeEmbeddingModelId;

                        return (
                          <tr key={model.id} className={`hover:bg-muted/10 transition-colors ${isActiveChat || isActiveEmbed ? 'bg-primary/[0.01]' : ''}`}>
                            <td className="px-4 py-3.5 max-w-[200px]">
                              <div className="text-xs font-bold text-foreground truncate">{model.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5 opacity-80">{model.modelCode}</div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-muted-foreground font-medium">
                              <span className="bg-muted border border-border/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                                {model.provider}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex flex-wrap gap-1 max-w-[220px]">
                                {model.isChat && <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-md">Chat</span>}
                                {model.isEmbedding && <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md">Embedding</span>}
                                {model.isVision && <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-md">Vision</span>}
                                {model.isAudio && <span className="text-[9px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold px-2 py-0.5 rounded-md">Audio</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs font-mono">
                              <div className="text-foreground font-bold">{model.contextWindow.toLocaleString()} <span className="text-[10px] text-muted-foreground font-sans font-normal">ctx</span></div>
                              {model.isChat && (
                                <div className="text-[10px] text-muted-foreground/60 mt-0.5">out: {model.maxOutputToken.toLocaleString()}</div>
                              )}
                              {model.isEmbedding && (
                                <div className="text-[10px] text-muted-foreground/60 mt-0.5">Dim: Auto-Mapped</div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-xs font-mono">
                              {isFree ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded">Free</span>
                              ) : (
                                <div className="space-y-0.5">
                                  <div className="text-foreground font-medium">In: ${model.inputPricePer1M}</div>
                                  {!model.isEmbedding && (
                                    <div className="text-[10px] text-muted-foreground/60">Out: ${model.outputPricePer1M}</div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <Badge variant={model.isActive ? "success" : "danger"} className="text-[10px] font-bold py-0.5 px-2">
                                {model.isActive ? "Available" : "Disabled"}
                              </Badge>
                            </td>

                            <td className="px-4 py-3.5">
                              {isActiveChat && (
                                <span className="text-[10px] bg-blue-500 text-white font-bold px-2 py-0.5 rounded-md shadow-sm">
                                  Active Chat
                                </span>
                              )}
                              {isActiveEmbed && (
                                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-md shadow-sm">
                                  Active Embedding
                                </span>
                              )}
                              {!isActiveChat && !isActiveEmbed && (
                                <span className="text-[10px] text-muted-foreground/40 font-medium">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}