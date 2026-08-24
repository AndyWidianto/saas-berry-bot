import { Badge } from "@/app/components/Bagde";
import { Btn } from "@/app/components/Button";
import { Card } from "@/app/components/Cards";
import ModalAddUrlKnowledge from "@/app/components/ModalAddUrlKnowledge";
import { PageHeader } from "@/app/components/PageHeader";
import useAxios from "@/lib/axios-service";
import { Knowledge, ResponseApi } from "@/lib/types";
import axios from "axios";
import { Plus, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function TabKnowledge({ workspaceId }: { workspaceId: string }) {
    const { AxiosPrivate } = useAxios();
    const [loadingCreateKnowledge, setLoadingCreateKnowledge] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
    const [knowledgeId, setKnowledgeId] = useState<string | null>(null);
    const inputFileRef = useRef<HTMLInputElement | null>(null);


    const fetchKnowledges = async () => {
        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/knowledges`);
            const result: ResponseApi = res.data;
            const data: Knowledge[] = result.data;
            console.log(data);
            setKnowledgeItems(data);
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
                modelName: ""
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

    const handleAddUrlKnowledge = async (url: string) => {
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
                name: url || "",
                size: 0,
                totalChunk: 0,
                workspaceId: safeWorkspaceId || "",
                type: "url",
                status: "PROCESSING",
                createdAt: createdAt,
                updatedAt: createdAt,
                modelName: ""
            }, ...prev]);
            setIsOpen(false);

            const res = await AxiosPrivate.post(`/${workspaceId}/knowledges/url`, {
                url
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
            throw err;
        }
    }

    useEffect(() => {
        fetchKnowledges();
    }, []);


    return (
        <div className="flex-1 overflow-auto p-6">
            <ModalAddUrlKnowledge isOpen={isOpen} onClose={() => setIsOpen(false)} onSubmit={handleAddUrlKnowledge} />
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Knowledge Base" subtitle="Latih AI Anda menggunakan dokumen, URL, dan FAQ" actions={<Btn variant="primary" size="sm" onClick={() => setIsOpen(true)} icon={Plus}>Add Source</Btn>} />
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


                <Card className="overflow-hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-border">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input className="w-full bg-muted rounded-lg pl-8 pr-3 py-1.5 text-xs border border-border focus:outline-none" placeholder="Search knowledge base..." />
                        </div>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/20">
                                    {["Title", "Type", "Model", "Chunks", "Status", "Updated", "Size", ""].map(h => (
                                        <th key={h} className="text-left text-[11px] font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {knowledgeItems.map(k => (
                                    <tr key={k.id} className={`border-b border-border/50 hover:bg-muted/30 ${k.id === knowledgeId || k.id.includes("temporary") ? 'opacity-40' : ''}`}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs font-medium text-foreground block truncate max-w-[200px]" title={k.name}>
                                                {k.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap"><Badge variant="info">{k.type}</Badge></td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-[11px] font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/50">
                                                {k.modelName || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{k.totalChunk > 0 ? k.totalChunk : "—"}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><Badge variant={k.status === "INDEXED" ? "success" : "warning"}>{k.status}</Badge></td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{k.updatedAt}</td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{k.size}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <button onClick={() => deleteKnowledge(k.id)} disabled={k.id === knowledgeId} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}