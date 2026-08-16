"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Crown, Edit, Loader2, Send, Trash2, UserPlus, X, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { PageHeader } from "@/app/components/PageHeader";
import { Btn } from "@/app/components/Button";
import { Card } from "@/app/components/Cards";
import { Avatar } from "@/app/components/Avatar";
import { Badge } from "@/app/components/Bagde";
import cn from "@/app/components/ClassName";
import { MemberStatus, RoleWorkspaceMember, WorkspaceMember } from "@/lib/types";
import useAxios from "@/lib/axios-service";
import { useParams } from "next/navigation";
import axios from "axios";



interface TeamMember {
  id: string; name: string; email: string; role: "owner" | "admin" | "supervisor" | "agent" | "viewer";
  status: "online" | "offline" | "busy"; lastActive: string; initials: string;
  conversations: number; color: string;
}

const StatusDot = ({ status }: { status: MemberStatus }) => {
  const colors = { ACTIVE: "bg-emerald-500", SUSPENDED: "bg-slate-300 dark:bg-slate-600", INVITED: "bg-amber-500" };
  return <span className={cn("inline-block w-2 h-2 rounded-full", colors[status])} />;
};

const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen", email: "alex@company.com", role: "owner", status: "online", lastActive: "Now", initials: "AC", conversations: 24, color: "#6366f1" },
  { id: "2", name: "Maya Patel", email: "maya@company.com", role: "admin", status: "online", lastActive: "Now", initials: "MP", conversations: 18, color: "#10b981" },
  { id: "3", name: "James Wilson", email: "james@company.com", role: "supervisor", status: "busy", lastActive: "5m ago", initials: "JW", conversations: 12, color: "#3b82f6" },
  { id: "4", name: "Priya Singh", email: "priya@company.com", role: "agent", status: "online", lastActive: "Now", initials: "PS", conversations: 31, color: "#f59e0b" },
  { id: "5", name: "Lucas Brown", email: "lucas@company.com", role: "agent", status: "offline", lastActive: "2h ago", initials: "LB", conversations: 8, color: "#8b5cf6" },
  { id: "6", name: "Sofia Garcia", email: "sofia@company.com", role: "agent", status: "online", lastActive: "Now", initials: "SG", conversations: 22, color: "#ec4899" },
  { id: "7", name: "David Kim", email: "david@company.com", role: "viewer", status: "offline", lastActive: "1d ago", initials: "DK", conversations: 0, color: "#14b8a6" },
];

export default function TeamPage() {
  const { AxiosPrivate } = useAxios();
  const [showInvite, setShowInvite] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    role: "MEMBER" as RoleWorkspaceMember
  })
  const [loading, setLoading] = useState(false);
  const { workspace: workspaceId } = useParams();

  const roleConfig: Record<RoleWorkspaceMember, { label: string; color: string; variant: "default" | "success" | "warning" | "danger" | "info" | "purple" }> = {
    OWNER: { label: "Owner", color: "#6366f1", variant: "purple" },
    ADMIN: { label: "Admin", color: "#3b82f6", variant: "info" },
    MEMBER: { label: "Viewer", color: "#94a3b8", variant: "default" },
    // supervisor: { label: "Supervisor", color: "#f59e0b", variant: "warning" },
    // agent: { label: "Agent", color: "#10b981", variant: "success" },
    // viewer: { label: "Viewer", color: "#94a3b8", variant: "default" },
  };

  const fetchWorkspaceMembers = async () => {
    try {
      const res = await AxiosPrivate.get(`/workspaces/${workspaceId}/members`);
      const result = res.data;
      setMembers(result.data);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }
  const addNewMember = async () => {
    try {
      setLoading(true);
      const res = await AxiosPrivate.post(`/workspaces/${workspaceId}/members`, formData);
      const result = res.data;
      setMembers((prev) => [...prev, result.data]);
      toast.success(result.message || "Member berhasil ditambahkan!");
    } catch (err) {
      console.error("Fetch error: ", err);

      if (axios.isAxiosError(err)) {
        const responseMessage = err.response?.data?.message;
        const errorMessage = Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage || "Gagal menambahkan member";

        toast.error(errorMessage);
      } else {
        toast.error("Terjadi kesalahan sistem yang tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };

  const permissions = [
    { feature: "View Conversations", owner: true, admin: true, supervisor: true, agent: true, viewer: true },
    { feature: "Reply to Messages", owner: true, admin: true, supervisor: true, agent: true, viewer: false },
    { feature: "Delete Messages", owner: true, admin: true, supervisor: false, agent: false, viewer: false },
    { feature: "Manage Campaigns", owner: true, admin: true, supervisor: true, agent: false, viewer: false },
    { feature: "Manage Contacts", owner: true, admin: true, supervisor: true, agent: true, viewer: false },
    { feature: "View Analytics", owner: true, admin: true, supervisor: true, agent: false, viewer: true },
    { feature: "Manage Integrations", owner: true, admin: true, supervisor: false, agent: false, viewer: false },
    { feature: "Invite Members", owner: true, admin: true, supervisor: false, agent: false, viewer: false },
    { feature: "Billing & Subscriptions", owner: true, admin: false, supervisor: false, agent: false, viewer: false },
  ];

  useEffect(() => {
    fetchWorkspaceMembers();
  }, [])

  return (
    <div className="h-full overflow-auto p-6">
      <PageHeader
        title="Team Management"
        subtitle={`${teamMembers.length} members in your workspace`}
        actions={
          <Btn variant="primary" size="sm" icon={UserPlus} onClick={() => setShowInvite(true)}>Invite Member</Btn>
        }
      />

      {/* Team Table */}
      <Card className="overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {["Member", "Role", "Email", "Status", "Last Active", ""].map(h => (
                <th key={h} className="text-left text-[11px] font-medium text-muted-foreground px-4 py-3">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {members.map(m => {
                const rc = roleConfig[m.role];
                return (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* <Avatar initials={m.initials} color={m.color} size="md" /> */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">{m.user.name}</span>
                            {m.role === "OWNER" && <Crown className="w-3 h-3 text-amber-500" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={rc.variant}>{rc.label}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={m.status} />
                        <span className="text-xs text-foreground capitalize">{m.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.lastActiveAt}</td>
                    {/* <td className="px-4 py-3 text-xs font-mono text-foreground">{m}</td> */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors" onClick={() => toast.info(`Editing ${m.user.name}...`)}><Edit className="w-3.5 h-3.5" /></button>
                        {m.role !== "OWNER" && <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Permission Matrix */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Permission Matrix</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Access control by role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-3 w-48">Feature</th>
              {["Owner", "Admin", "Supervisor", "Agent", "Viewer"].map(r => (
                <th key={r} className="text-center text-[11px] font-medium text-muted-foreground px-4 py-3">{r}</th>
              ))}
            </tr></thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.feature} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-xs text-foreground">{p.feature}</td>
                  {[p.owner, p.admin, p.supervisor, p.agent, p.viewer].map((has, i) => (
                    <td key={i} className="px-4 py-2.5 text-center">
                      {has ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={() => !loading && setShowInvite(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold">Invite Team Member</h3>
                  <button onClick={() => setShowInvite(false)} disabled={loading} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-50"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email Address</label>
                    <input disabled={loading} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary/50 focus:outline-none disabled:opacity-50" placeholder="colleague@company.com" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role</label>
                    <select disabled={loading} onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as RoleWorkspaceMember }))} className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:outline-none disabled:opacity-50">
                      <option value="">Select Role Member</option>
                      {(["ADMIN", "MEMBER", "OWNER"] as RoleWorkspaceMember[]).map(role => (
                        <option value={role} key={role}>{role.toLowerCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Btn variant="secondary" className="flex-1 justify-center" disabled={loading} onClick={() => setShowInvite(false)}>Cancel</Btn>
                    <Btn variant="primary" className="flex-1 justify-center" disabled={loading} icon={loading ? undefined : Send} onClick={() => addNewMember()}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        "Send Invite"
                      )}
                    </Btn>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
