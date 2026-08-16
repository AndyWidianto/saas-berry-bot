"use client";

import React, { useEffect, useState } from "react";
import {
    Briefcase, Plus, Users, LayoutDashboard, Settings,
    Globe, Calendar, PlusCircle, UserPlus,
    Check,
    X,
    MailCheck
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Card } from "../components/Cards";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Btn } from "../components/Button";
import { Badge } from "../components/Bagde";
import { PageHeader } from "../components/PageHeader";
import { useRouter } from "next/navigation";
import useAxios from "@/lib/axios-service";
import { toast } from "sonner";
import axios from "axios";
import { Workspace, WorkspaceMember } from "@/lib/types/workspace";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import { p } from "motion/react-client";



export default function WorkspacePage() {
    const { AxiosPrivate } = useAxios();
    const { setWorkspace } = useWorkspaceStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFetch, setIsLoadingFetch] = useState(true);
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
    })
    const [receivedInvites, setReceivedInvites] = useState<(WorkspaceMember & { workspace: Workspace })[]>([]);
    const [myWorkspaces, setMyWorkspaces] = useState<(WorkspaceMember & { workspace: Workspace })[]>([]);

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    const createWorkspace = async () => {
        setIsLoading(true);
        try {
            const res = await AxiosPrivate.post("/workspaces", formData);
            const data = res.data;
            console.log(data);
            toast.success(data.message || "Create workspace successfully");
            setIsCreateModalOpen(false);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data.message;
                if (message) toast.error(message);
            }
            console.error("Fetch error: ", err);
        }
    }

    // Mock Data Performa Volume Pesan per Workspace
    const workspaceTrafficData = [
        { name: "Marketing", volume: 12450 },
        { name: "CS Support", volume: 34890 },
        { name: "R&D Test", volume: 120 },
    ];

    const recentInvites = [
        { id: 1, email: "budi.cs@company.com", workspace: "Customer Support CS", role: "MEMBER", status: "PENDING" },
        { id: 2, email: "siti.marketing@company.com", workspace: "Tim Marketing Utama", role: "ADMIN", status: "ACCEPTED" },
    ];

    const fetchWorkspaces = async () => {
        setIsLoadingFetch(true);
        try {
            const res = await AxiosPrivate.get("/workspaces");
            const data = res.data;
            const newWorkspaces = data.data as (WorkspaceMember & { workspace: Workspace })[];

            const workspaceActive = newWorkspaces.filter(nw => nw.status === "ACTIVE");
            const workspaceInvite = newWorkspaces.filter(nw => nw.status === "INVITED");
            console.log(newWorkspaces);
            setMyWorkspaces(workspaceActive);
            setReceivedInvites(workspaceInvite);
        } catch (err) {
            console.error("Fetch error: ", err);
        } finally {
            setIsLoadingFetch(false);
        }
    }

    const handleAcceptInvite = async (id: string) => {
        const findWorkspace = receivedInvites.find(ri => ri.workspaceId === id);
        if (!findWorkspace) return;
        try {
            setReceivedInvites(prev => prev.filter(p => p.id !== findWorkspace.id));
            setMyWorkspaces(prev => [...prev, { ...findWorkspace, status: "ACTIVE" }])
            await AxiosPrivate.patch(`/workspaces/${id}/members/accept`);
        } catch (err) {
            setMyWorkspaces(prev => prev.filter(p => p.workspaceId !== id));
            setReceivedInvites(prev => [...prev, findWorkspace]);
            console.error("Fetch error: ", err);
        }
    };

    const handleDeclineInvite = async (id: string) => {
        const findWorkspace = receivedInvites.find(ri => ri.workspaceId === id);
        if (!findWorkspace) return;
        try {
            setReceivedInvites(prev => prev.filter(p => p.workspaceId !== id));
            const res = await AxiosPrivate.delete(`/workspaces/${id}/members/reject`);
            const data = res.data;
            console.log(data);
        } catch (err) {
            setReceivedInvites(prev => [...prev, findWorkspace]);
            console.error("Fetch error: ", err);
        }
    };
    const handleNavigateToWorkspace = (id: string) => {
        router.push(`/dashboard/${id}`);
        setWorkspace(myWorkspaces.find(m => m.workspaceId === id)?.workspace || null);
    }

    useEffect(() => {
        fetchWorkspaces();
    }, [])

    return (
        <div className="h-full overflow-auto p-6">
            <PageHeader
                title="Workspaces"
                subtitle="Manage your collaborative zones, channels isolation, and workspace members."
                actions={
                    <Btn variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                        Create Workspace
                    </Btn>
                }
            />

            {/* Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <div className="xl:col-span-2 space-y-6">
                    <AnimatePresence>
                        {receivedInvites.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm text-foreground">Workspace Invitations</h3>
                                        <Badge variant="warning">{receivedInvites.length} Pending</Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Action required to join</span>
                                </div>

                                <div className="space-y-3">
                                    {receivedInvites.map((inv) => (
                                        <Card key={inv.id} className="p-4 border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <MailCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold text-sm text-foreground">{inv.workspace.name}</h4>
                                                            <Badge variant="info">{inv.role}</Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Invited by <span className="font-medium text-foreground">{inv.invitedBy}</span> ({inv.invitedEmail})
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                                    <Btn
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleDeclineInvite(inv.workspaceId)}
                                                    >
                                                        <X className="w-3.5 h-3.5 mr-1" /> Decline
                                                    </Btn>
                                                    <Btn
                                                        variant="primary"
                                                        size="sm"
                                                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => handleAcceptInvite(inv.workspaceId)}
                                                    >
                                                        <Check className="w-3.5 h-3.5 mr-1" /> Accept Join
                                                    </Btn>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Workspaces Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-foreground px-1">Your Active Workspaces</h3>

                        {myWorkspaces.map((ws, i) => (
                            <motion.div
                                key={ws.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-5 hover:border-primary/40 transition-all duration-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-sm text-foreground">{ws.workspace.name}</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    slug: <span className="font-mono bg-muted px-1 py-0.2 rounded text-[11px]">{ws.workspace.slug}</span>
                                                </p>

                                                {/* Meta data list */}
                                                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" /> {0} Members
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3.5 h-3.5" /> {0} Integrations
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" /> Created {new Date(ws.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions button */}
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <Btn variant="secondary" size="sm" icon={LayoutDashboard} onClick={() => handleNavigateToWorkspace(ws.workspaceId)}>
                                                Enter
                                            </Btn>
                                            <Btn variant="ghost" size="sm" className="p-2 h-9 w-9 justify-center">
                                                <Settings className="w-4 h-4 text-muted-foreground" />
                                            </Btn>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Analytics & Outgoing Invites Tracker */}
                <div className="space-y-6">
                    {/* Workspace Traffic Performance */}
                    <Card className="p-5">
                        <div className="mb-4">
                            <h3 className="font-semibold text-sm text-foreground">Message Load</h3>
                            <p className="text-xs text-muted-foreground">Volume distributed per workspace</p>
                        </div>
                        <ResponsiveContainer width="100%" height={140}>
                            <BarChart data={workspaceTrafficData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={70} />
                                <Tooltip formatter={(v: any) => v.toLocaleString()} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                                <Bar dataKey="volume" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Pending Outgoing Team Invitations Log */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-sm text-foreground">Sent Invitations</h3>
                            <button className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                Invite <UserPlus className="w-3 h-3 ml-0.5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {recentInvites.map(invite => (
                                <div key={invite.id} className="text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-foreground truncate max-w-[160px]">{invite.email}</span>
                                        <Badge variant={invite.status === "PENDING" ? "warning" : "success"}>
                                            {invite.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground text-[11px] mt-1">
                                        <span>Target: {invite.workspace}</span>
                                        <span className="font-mono text-[10px]">{invite.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Create Workspace Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-5 border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground">Create New Workspace</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Separate data setups for marketing teams or client integrations.</p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Workspace Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Toko Online Budi B2B"
                                    name="name"
                                    onChange={(e) => handleOnChange(e)}
                                    className="w-full h-9 px-3 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Workspace URL Slug (Unique)</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-xs text-muted-foreground font-mono">/dashboard/</span>
                                    <input
                                        type="text"
                                        placeholder="toko-online-budi"
                                        name="slug"
                                        onChange={(e) => handleOnChange(e)}
                                        className="w-full h-9 pl-24 pr-3 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary font-mono transition-colors"
                                    />
                                </div>
                            </div> */}
                        </div>

                        <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                            <Btn variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>Cancel</Btn>
                            <Btn variant="primary" size="sm" icon={PlusCircle} onClick={createWorkspace}>Create Now</Btn>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}