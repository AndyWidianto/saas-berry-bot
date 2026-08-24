"use client";
import { AlertTriangle, Bell, Building2, Check, Database, ExternalLink, Eye, Key, Save, ScrollText, SettingsIcon, Shield, Trash2, UserMinus, Webhook } from "lucide-react";
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
import { useParams, useRouter } from "next/navigation";
import { Toggle } from "@/app/components/Toggle";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { WorkingHoursModal } from "@/app/components/WorkingHourModal";
import axios from "axios";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { ChangePasswordModal } from "@/app/components/ChangePasswordModal";
import { SettingsRow } from "@/app/components/SettingRow";
import { EmptyState } from "@/app/components/EmptyState";



type SettingsTab = "general" | "workspace" | "security" | "appearance" | "notifications" | "api" | "webhook" | "backup" | "audit";

export default function SettingsPage() {
  const { workspace, setWorkspace, workspaces, setWorkspaces } = useWorkspaceStore();
  const { AxiosPrivate } = useAxios()
  const { user, setUser, deleteSessionLogin } = useAuthStore();
  const [tab, setTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);
  const [formDataWorkspace, setFormDataWorkspace] = useState<UpdateWorkspace>({});
  const { workspace: workspaceId } = useParams();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageProfile, setIamgeProfile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [isWorkingHoursModalOpen, setIsWorkingHoursModalOpen] = useState(false);

  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const router = useRouter();

  const isRewriteActive = formDataWorkspace?.rewrite ?? workspace?.rewrite ?? false;


  const handleDeleteWorkspace = async () => {
    if (!workspace) return;

    if (workspaces.length <= 1) {
      toast.warning("Workspace tidak bisa dihapus karena minimal harus ada satu workspace.");
      return; // WAJIB return agar proses eksekusi berhenti di sini
    }

    setIsDeleting(true);

    try {
      await AxiosPrivate.delete(`/workspaces/${workspace.id}`);

      toast.success('Workspace berhasil dihapus.');
      setDeleteWorkspaceOpen(false);
      const remainingWorkspaces = workspaces.filter((w) => w.id !== workspace.id);
      setWorkspaces(remainingWorkspaces);

      if (remainingWorkspaces.length > 0) {
        setWorkspace(remainingWorkspaces[0]);
      }
    } catch (err: any) {
      console.error("Delete workspace error:", err);
      const errorMessage = err?.response?.data?.message || 'Gagal menghapus workspace.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };


  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await AxiosPrivate.delete(`/users/${user?.id}`);
      toast.success('Akun berhasil dihapus.');
      deleteSessionLogin();
      router.push('/register');
      setDeleteUserOpen(false);
    } catch (err) {
      console.error("Fetch eror: ", err);
      toast.error('Gagal menghapus akun.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (data: { currentPass: string; newPass: string }) => {
    try {
      await AxiosPrivate.post('/users/reset-password', {
        password: data.currentPass,
        newPassword: data.newPass
      });
      toast.success('Password berhasil diperbarui!');
    } catch (err) {
      console.error("Fetch error: ", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Terjadi kesalahan mohon coba lagi nanti.";
        throw {
          message: message
        }
      }
    }
  };


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
    { id: "notifications", label: "Notifications", icon: Bell },
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
    try {
      if (Object.entries(formDataWorkspace).length > 0) {
        await handleUpdateWorkspace();
      }
      if (imageProfile) {
        await updateIamgeProfile();
      }
      toast.success("Settings saved successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message ?? "Terjadi kesalahan. Mohon coba lagi nanti.";
        toast.error(message);
      }
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Sidebar: Horizontal Scrollable Tab on Mobile, Vertical Sidebar on Desktop */}
      <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-border bg-card overflow-x-auto md:overflow-y-auto py-2.5 px-3 flex-shrink-0 flex md:flex-col gap-1.5 md:gap-1 sticky top-0 z-10 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap md:whitespace-normal shrink-0 md:shrink",
              tab === t.id
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <t.icon className="w-3.5 h-3.5 flex-shrink-0" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {tab === "general" && (
            <>
              <DeleteConfirmModal
                isOpen={deleteUserOpen}
                onClose={() => setDeleteUserOpen(false)}
                onConfirm={handleDeleteUser}
                title="Hapus Akun Anda"
                description="Akun Anda beserta seluruh data pribadi akan dihapus secara permanen dari sistem."
                expectedName={user?.name || ''}
                inputLabel="Untuk mengonfirmasi nama Anda,"
                isLoading={isDeleting}
              />
              <div>
                <h2 className="text-base font-bold mb-1">General Settings</h2>
                <p className="text-xs text-muted-foreground">Manage your account and workspace preferences.</p>
              </div>

              <Card className="p-4 sm:p-5">
                {/* Profile Avatar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    {imagePreview || user?.profileUrl ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={imagePreview || user?.profileUrl || ""}
                          alt={user?.name || "Profile"}
                          className="h-12 w-12 rounded-full object-cover border border-border"
                        />
                      </div>
                    ) : (
                      <Avatar
                        initials={user?.name?.charAt(0).toUpperCase() || "AC"}
                        color="#6366f1"
                        size="lg"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{user?.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>

                  <input type="file" name="file" id="" hidden ref={inputRef} onChange={(e) => handleOnChange(e)} />
                  <Btn
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto justify-center"
                    onClick={() => inputRef.current?.click()}
                  >
                    Change Photo
                  </Btn>
                </div>

                {/* Inputs */}
                <SettingsRow label="Full Name">
                  <input
                    className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-full sm:w-64"
                    defaultValue={user?.name || ""}
                  />
                </SettingsRow>
                <SettingsRow label="Email Address" desc="Used for notifications and login">
                  <input
                    className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-full sm:w-64"
                    defaultValue={user?.email}
                  />
                </SettingsRow>
              </Card>

              {/* Danger Zone */}
              <Card className="p-4 sm:p-5 border-destructive/30 bg-destructive/5 space-y-4">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Danger Zone</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-destructive/20">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Delete Account</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Permanently delete your personal user account and data. This action cannot be undone.
                    </div>
                  </div>
                  <Btn
                    variant="danger"
                    size="sm"
                    className="flex-shrink-0 gap-1.5 w-full sm:w-auto justify-center"
                    onClick={() => setDeleteUserOpen(true)}
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    Delete Account
                  </Btn>
                </div>
              </Card>
            </>
          )}

          {tab === "workspace" && (
            <>
              <WorkingHoursModal
                isOpen={isWorkingHoursModalOpen}
                onClose={() => setIsWorkingHoursModalOpen(false)}
                onSave={(state) =>
                  setFormDataWorkspace((prev) => ({
                    ...prev,
                    ...state,
                  }))
                }
                initialConfig={{ timezone: workspace?.timezone, workingHours: workspace?.workingHours }}
              />
              <div>
                <h2 className="text-base font-bold mb-1">Workspace Settings</h2>
                <p className="text-xs text-muted-foreground">Configure your workspace name, logo, and defaults.</p>
              </div>

              <Card className="p-4 sm:p-5">
                <SettingsRow label="Workspace Name">
                  <input
                    className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-full sm:w-64"
                    value={formDataWorkspace?.name ?? workspace?.name ?? ""}
                    onChange={(e) => setFormDataWorkspace((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </SettingsRow>

                <SettingsRow
                  label="Working Hours"
                  desc={`Set schedule & timezone (${formDataWorkspace.timezone || "Asia/Jakarta"}) for agent routing`}
                >
                  <div className="flex items-center gap-3">
                    {(formDataWorkspace.workingHoursEnabled ?? workspace?.workingHoursEnabled) && (
                      <Btn variant="outline" size="sm" onClick={() => setIsWorkingHoursModalOpen(true)}>
                        Configure
                      </Btn>
                    )}
                    <Toggle
                      checked={formDataWorkspace.workingHoursEnabled ?? workspace?.workingHoursEnabled ?? false}
                      onChange={(value) =>
                        setFormDataWorkspace((prev) => ({ ...prev, workingHoursEnabled: value }))
                      }
                    />
                  </div>
                </SettingsRow>

                <div className="flex flex-col gap-2 py-4 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">System Rules</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Set default instructions/prompt for your workspace agent
                    </div>
                  </div>
                  <div className="w-full mt-1">
                    <textarea
                      rows={5}
                      className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-full resize-y"
                      placeholder="Enter system rules..."
                      value={formDataWorkspace?.systemRules ?? workspace?.systemRules ?? ""}
                      onChange={(e) => setFormDataWorkspace((prev) => ({ ...prev, systemRules: e.target.value }))}
                    />
                  </div>
                </div>

                {/* <div className="flex flex-col gap-2 py-4 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium text-foreground">Greeting Text</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Initial greeting message sent to users
                    </div>
                  </div>
                  <div className="w-full mt-1">
                    <input
                      className="bg-muted rounded-lg px-3 py-2 text-sm border border-border focus:border-primary/50 focus:outline-none w-full"
                      placeholder="Enter greeting message..."
                      value={formDataWorkspace?.greetingText ?? workspace?.greetingText ?? ""}
                      onChange={(e) => setFormDataWorkspace((prev) => ({ ...prev, greetingText: e.target.value }))}
                    />
                  </div>
                </div> */}

                <SettingsRow
                  label="AI Auto-Assignment"
                  desc="Automatically assign incoming conversations to agents using AI"
                >
                  <Toggle
                    checked={formDataWorkspace.isAiActive ?? workspace?.isAiActive ?? false}
                    onChange={(value) => setFormDataWorkspace((prev) => ({ ...prev, isAiActive: value }))}
                  />
                </SettingsRow>

                <SettingsRow label="Query Rewrite" desc="Automatically assign conversations to agents">
                  <Toggle checked={isRewriteActive} onChange={handleToggleChange} />
                </SettingsRow>

                <ConfirmModal
                  isOpen={showRewriteModal}
                  title="Aktifkan Query Rewrite?"
                  description={
                    <>
                      Dengan mengaktifkan fitur <strong>Query Rewrite</strong>, tingkat pencarian data akan menjadi
                      sangat akurat. Namun, proses ini akan memakan lebih banyak penggunaan <strong>token LLM</strong>{" "}
                      pada setiap percakapan.
                    </>
                  }
                  onConfirm={handleConfirmEnable}
                  onClose={() => setShowRewriteModal(false)}
                />
              </Card>

              {/* Danger Zone: Workspace Deletion */}
              <DeleteConfirmModal
                isOpen={deleteWorkspaceOpen}
                onClose={() => setDeleteWorkspaceOpen(false)}
                onConfirm={handleDeleteWorkspace}
                title="Hapus Workspace Permanen"
                description="Tindakan ini akan menghapus seluruh data, perangkat terhubung, dan riwayat di workspace ini."
                expectedName={workspace?.name || ''}
                inputLabel="Untuk mengonfirmasi,"
                isLoading={isDeleting}
              />
              <Card className="p-4 sm:p-5 border-destructive/30 bg-destructive/5 space-y-4">
                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Danger Zone</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-destructive/20">
                  <div>
                    <div className="text-xs font-semibold text-foreground">Delete Workspace</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Delete this workspace, all associated integrations, data, and active sessions.
                    </div>
                  </div>
                  <Btn
                    variant="danger"
                    size="sm"
                    className="flex-shrink-0 gap-1.5 w-full sm:w-auto justify-center"
                    onClick={() => setDeleteWorkspaceOpen(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Workspace
                  </Btn>
                </div>
              </Card>
            </>
          )}

          {tab === "security" && (
            <>
              <ChangePasswordModal
                isOpen={openPasswordModal}
                onClose={() => setOpenPasswordModal(false)}
                onSubmit={handleChangePassword}
              />
              <div>
                <h2 className="text-base font-bold mb-1">Security</h2>
                <p className="text-xs text-muted-foreground">Manage password, 2FA, and session settings.</p>
              </div>
              <Card className="p-4 sm:p-5">
                <SettingsRow label="Change Password" desc="Perbarui kata sandi untuk keamanan akun Anda">
                  <Btn variant="secondary" size="sm" icon={Shield} onClick={() => setOpenPasswordModal(true)}>
                    Update Password
                  </Btn>
                </SettingsRow>
              </Card>
            </>
          )}

          {tab === "notifications" && (
            <>
              <div>
                <h2 className="text-base font-bold mb-1">Notifications</h2>
                <p className="text-xs text-muted-foreground">Control how and when you receive alerts.</p>
              </div>
              <Card className="p-4 sm:p-5">
                {[
                  {
                    id: "ai_escalation" as NotificationSettingType,
                    label: "AI Escalations",
                    desc: "When AI escalates a conversation to human",
                  },
                  {
                    id: "billing_alert" as NotificationSettingType,
                    label: "Billing Alerts",
                    desc: "Invoice due, usage limit warnings",
                  },
                ].map((n) => (
                  <SettingsRow key={n.label} label={n.label} desc={n.desc}>
                    <Toggle
                      checked={
                        formDataWorkspace.notificationSettings?.[n.id] ??
                        workspace?.notificationSettings?.[n.id] ??
                        false
                      }
                      onChange={(value) =>
                        setFormDataWorkspace((prev) => ({
                          ...prev,
                          notificationSettings: { ...prev.notificationSettings, [n.id]: value },
                        }))
                      }
                    />
                  </SettingsRow>
                ))}
              </Card>
            </>
          )}

          {(tab === "api" || tab === "webhook" || tab === "backup" || tab === "audit") && (
            <>
              <div>
                <h2 className="text-base font-bold mb-1 capitalize">
                  {tabs.find((t) => t.id === tab)?.label}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure {tabs.find((t) => t.id === tab)?.label.toLowerCase()} settings for your workspace.
                </p>
              </div>
              <Card className="p-4 sm:p-5">
                <EmptyState
                  icon={tabs.find((t) => t.id === tab)!.icon}
                  title={`${tabs.find((t) => t.id === tab)?.label} Settings`}
                  description="Advanced configuration options are available here. Contact support for setup assistance."
                  action={
                    <Btn variant="primary" size="sm" icon={ExternalLink}>
                      Open Documentation
                    </Btn>
                  }
                />
              </Card>
            </>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end pt-4 gap-3">
            <Btn variant="secondary" className="flex-1 sm:flex-none justify-center">Cancel</Btn>
            <Btn variant="primary" icon={saved ? Check : Save} onClick={save} className="flex-1 sm:flex-none justify-center">
              {saved ? "Saved!" : "Save Changes"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}