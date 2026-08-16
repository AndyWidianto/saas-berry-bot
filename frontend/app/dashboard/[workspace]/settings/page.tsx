"use client";
import { Bell, Building2, Check, Database, ExternalLink, Eye, Key, Save, ScrollText, SettingsIcon, Shield, Webhook } from "lucide-react";
import { toast } from "sonner";
import React, { useRef, useState } from "react";
import cn from "@/app/components/ClassName";
import { Card } from "@/app/components/Cards";
import { Avatar } from "@/app/components/Avatar";
import { Btn } from "@/app/components/Button";
import { useWorkspaceStore } from "@/lib/store/workspaceStore";
import useAuthStore from "@/lib/store/authStore";
import useAxios from "@/lib/axios-service";
import { NotificationSettingType, UpdateWorkspace } from "@/lib/types";
import { useParams } from "next/navigation";
import { Toggle } from "@/app/components/Toggle";
import { ConfirmModal } from "@/app/components/ConfirmModal";



type SettingsTab = "general" | "workspace" | "security" | "appearance" | "notifications" | "api" | "webhook" | "backup" | "audit";

const SettingsRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
    <div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

export default function SettingsPage() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const { AxiosPrivate } = useAxios()
  const { user, setUser } = useAuthStore();
  const [tab, setTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);
  const [formDataWorkspace, setFormDataWorkspace] = useState<UpdateWorkspace>({});
  const { workspace: workspaceId } = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageProfile, setIamgeProfile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const isRewriteActive = formDataWorkspace?.rewrite ?? workspace?.rewrite ?? false;

  const handleToggleChange = (checked: boolean) => {
    if (checked) {
      setShowRewriteModal(true);
    } else {
      setFormDataWorkspace((prev) => ({ ...prev, rewrite: false }));
    }
  };

  const handleConfirmEnable = () => {
    setFormDataWorkspace((prev) => ({ ...prev, rewrite: true }));
    setShowRewriteModal(false);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "workspace", label: "Workspace", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
    // { id: "appearance", label: "Appearance", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    // { id: "api", label: "API", icon: Key },
    // { id: "webhook", label: "Webhook", icon: Webhook },
    // { id: "backup", label: "Backup", icon: Database },
    // { id: "audit", label: "Audit Log", icon: ScrollText },
  ];

  const handleUpdateWorkspace = async () => {
    try {
      const res = await AxiosPrivate.patch(`/workspaces/${workspaceId}`, formDataWorkspace);
      const result = res.data;
      setWorkspace(result.data);
      console.log(result);
    } catch (err) {
      console.error("Fetch error: ", err);
      throw err;
    }
  }

  const updateIamgeProfile = async () => {
    if (!imageProfile) return;
    try {
      const dataToSend = new FormData();
      dataToSend.append("file", imageProfile);
      const res = await AxiosPrivate.post(`/users/upload`, dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const result = res.data;
      console.log(result);
      setUser(result.data);
    } catch (err) {
      console.error("Fetch error: ", err);
      throw err;
    }
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setIamgeProfile(file);
    }
  }

  const save = async () => {
    if (saved) return;
    if (Object.entries(formDataWorkspace).length > 0) {
      await handleUpdateWorkspace();
    }
    if (imageProfile) {
      await updateIamgeProfile();
    }
    toast.success("Settings saved successfully!");
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-52 border-r border-border bg-card overflow-y-auto py-3 px-2 flex-shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors", tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
            <t.icon className="w-3.5 h-3.5 flex-shrink-0" />{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl">
          {tab === "general" && (
            <>
              <h2 className="text-base font-semibold mb-1">General Settings</h2>
              <p className="text-xs text-muted-foreground mb-6">Manage your account and workspace preferences.</p>
              <Card className="p-5">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                  {imagePreview || user?.profileUrl ? (
                    <div className="relative flex-shrink-0">
                      <img
                        src={imagePreview || user?.profileUrl || ""}
                        alt={user?.name || "Profile"}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <Avatar
                      initials={user?.name?.charAt(0).toUpperCase() || "AC"}
                      color="#6366f1"
                      size="lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">{user?.name}</h3>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <input type="file" name="file" id="" hidden ref={inputRef} onChange={(e) => handleOnChange(e)} />
                  <Btn variant="secondary" size="sm" className="ml-auto" onClick={() => inputRef.current?.click()}>Change Photo</Btn>
                </div>
                <SettingsRow label="Full Name">
                  <input className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-48" defaultValue={user?.name || ""} />
                </SettingsRow>
                <SettingsRow label="Email Address" desc="Used for notifications and login">
                  <input className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-48" defaultValue={user?.email} />
                </SettingsRow>
                {/* <SettingsRow label="Language">
                  <select className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:outline-none">
                    <option value="english">English (US)</option><option value="indonesia">Indonesian</option><option value="spain">Spanish</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Timezone">
                  <select className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:outline-none">
                    <option>UTC+7 (WIB)</option><option>UTC+0</option><option>UTC-5</option>
                  </select>
                </SettingsRow> */}
              </Card>
            </>
          )}

          {tab === "workspace" && (
            <>
              <h2 className="text-base font-semibold mb-1">Workspace Settings</h2>
              <p className="text-xs text-muted-foreground mb-6">Configure your workspace name, logo, and defaults.</p>
              <Card className="p-5">
                <SettingsRow label="Workspace Name">
                  <input
                    className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-48"
                    value={formDataWorkspace?.name ?? workspace?.name ?? ""}
                    onChange={(e) => setFormDataWorkspace(prev => ({ ...prev, name: e.target.value }))}
                  />
                </SettingsRow>
                <SettingsRow label="Default Language">
                  <select className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:outline-none">
                    <option>English</option><option>Indonesian</option>
                  </select>
                </SettingsRow>
                {/* <SettingsRow label="Working Hours" desc="Set availability for agent routing">
                  <Btn variant="secondary" size="sm">Configure</Btn>
                </SettingsRow> */}
                <SettingsRow label="Auto-assignment" desc="Automatically assign conversations to agents">
                  <Toggle checked={formDataWorkspace.isAiActive ?? workspace?.isAiActive ?? false} onChange={(value) => setFormDataWorkspace((prev) => ({ ...prev, isAiActive: value }))} />
                </SettingsRow>
                <SettingsRow label="Re Write" desc="Automatically assign conversations to agents">
                  <Toggle
                    checked={isRewriteActive}
                    onChange={handleToggleChange}
                  />
                </SettingsRow>
                <ConfirmModal
                  isOpen={showRewriteModal}
                  title="Aktifkan Query Rewrite?"
                  description={
                    <>
                      Dengan mengaktifkan fitur <strong>Query Rewrite</strong>, tingkat pencarian data akan menjadi sangat akurat. Namun, proses ini akan memakan lebih banyak penggunaan <strong>token LLM</strong> pada setiap percakapan.
                    </>
                  }
                  onConfirm={handleConfirmEnable}
                  onClose={() => setShowRewriteModal(false)}
                />
              </Card>
            </>
          )}

          {tab === "security" && (
            <>
              <h2 className="text-base font-semibold mb-1">Security</h2>
              <p className="text-xs text-muted-foreground mb-6">Manage password, 2FA, and session settings.</p>
              <Card className="p-5">
                {/* <SettingsRow label="Two-Factor Authentication" desc="Add an extra layer of security to your account">
                  <Toggle checked={false} />
                </SettingsRow> */}
                <SettingsRow label="Session Timeout" desc="Automatically log out after inactivity">
                  <select className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:outline-none">
                    <option>30 minutes</option><option>1 hour</option><option>8 hours</option><option>Never</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Change Password">
                  <Btn variant="secondary" size="sm" icon={Shield}>Update Password</Btn>
                </SettingsRow>
                <SettingsRow label="Active Sessions" desc="Manage devices where you're logged in">
                  <Btn variant="secondary" size="sm">View Sessions</Btn>
                </SettingsRow>
              </Card>
            </>
          )}

          {tab === "appearance" && (
            <>
              <h2 className="text-base font-semibold mb-1">Appearance</h2>
              <p className="text-xs text-muted-foreground mb-6">Customize the look and feel of your workspace.</p>
              <Card className="p-5">
                <SettingsRow label="Theme" desc="Switch between light and dark mode">
                  <div className="flex gap-2">
                    {["Light", "Dark", "System"].map(t => (
                      <button key={t} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", t === "Light" ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:text-foreground")}>{t}</button>
                    ))}
                  </div>
                </SettingsRow>
                <SettingsRow label="Accent Color">
                  <div className="flex gap-2">
                    {["#6366f1", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"].map(c => (
                      <button key={c} className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </SettingsRow>
                <SettingsRow label="Compact Mode" desc="Reduce spacing for denser information display">
                  <Toggle checked={false} />
                </SettingsRow>
              </Card>
            </>
          )}

          {tab === "notifications" && (
            <>
              <h2 className="text-base font-semibold mb-1">Notifications</h2>
              <p className="text-xs text-muted-foreground mb-6">Control how and when you receive alerts.</p>
              <Card className="p-5">
                {[
                  // { label: "New Conversations", desc: "When a new conversation is assigned to you", on: true },
                  // { label: "Mentions", desc: "When someone mentions you in a conversation", on: true },
                  // { label: "Campaign Completed", desc: "When a broadcast campaign finishes", on: true },
                  { id: "ai_escalation" as NotificationSettingType, label: "AI Escalations", desc: "When AI escalates a conversation to human" },
                  // { id: "team_update" as NotificationSettingType, label: "Team Updates", desc: "Member invitations and role changes" },
                  { id: "billing_alert" as NotificationSettingType, label: "Billing Alerts", desc: "Invoice due, usage limit warnings" },
                ].map(n => (
                  <SettingsRow key={n.label} label={n.label} desc={n.desc}>
                    <Toggle checked={formDataWorkspace.notificationSettings?.[n.id] ?? workspace?.notificationSettings?.[n.id] ?? false} onChange={(value) => setFormDataWorkspace(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, [n.id]: value } }))} />
                  </SettingsRow>
                ))}
              </Card>
            </>
          )}

          {(tab === "api" || tab === "webhook" || tab === "backup" || tab === "audit") && (
            <>
              <h2 className="text-base font-semibold mb-1 capitalize">{tabs.find(t => t.id === tab)?.label}</h2>
              <p className="text-xs text-muted-foreground mb-6">Configure {tabs.find(t => t.id === tab)?.label.toLowerCase()} settings for your workspace.</p>
              <Card className="p-5">
                <EmptyState icon={tabs.find(t => t.id === tab)!.icon} title={`${tabs.find(t => t.id === tab)?.label} Settings`} description="Advanced configuration options are available here. Contact support for setup assistance." action={<Btn variant="primary" size="sm" icon={ExternalLink}>Open Documentation</Btn>} />
              </Card>
            </>
          )}

          <div className="flex justify-end mt-6 gap-3">
            <Btn variant="secondary">Cancel</Btn>
            <Btn variant="primary" icon={saved ? Check : Save} onClick={save}>{saved ? "Saved!" : "Save Changes"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}