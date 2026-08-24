"use client";

import { useEffect, useState, useCallback } from "react";
import { Btn } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Cards";
import { ChevronLeft, ChevronRight, Download, Filter, MoreHorizontal, Plus, Search, ShieldAlert, Tag, Upload, CheckCircle2, X, Trash2, UserX, Eye, Pencil, Save, Loader2 } from "lucide-react";
import { Contact, ResponseApi } from "@/lib/types";
import { useParams } from "next/navigation";
import useAxios from "@/lib/axios-service";
import { ContactFormModal } from "@/app/components/ContactFormModal";
import { AnimatePresence, motion } from "framer-motion";
import { ContactPdfDocument } from "@/app/components/ContactDocumentPdf";
import { pdf } from "@react-pdf/renderer";


export default function ContactsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loadingExport, setLoadingExport] = useState(false);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { AxiosPrivate } = useAxios();
  const params = useParams();
  const workspaceId = params?.workspace as string;

  // Pagination & Cursor States
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [nextId, setNextId] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [mode, setMode] = useState<'show' | 'edit' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleOpenShow = (c: Contact) => {
    setSelectedContact(c);
    setMode('show');
  };

  const handleOpenEdit = (c: Contact) => {
    setSelectedContact(c);
    setMode(null);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedContact(null);
    setMode(null);
  };

  const handleDownloadPdf = async () => {
    setLoadingExport(true);
    try {
      const response = await AxiosPrivate.get(`/${workspaceId}/contacts`);
      const result = response.data;
      const contacts = result.data;

      const blob = await pdf(
        <ContactPdfDocument contacts={contacts} workspaceId={workspaceId} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts-${workspaceId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Gagal generate PDF:', error);
    } finally {
      setLoadingExport(false);
    }
  };

  // Helper Initials
  const getInitials = (name?: string, senderId?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return senderId ? senderId.substring(0, 2).toUpperCase() : "CT";
  };

  // Helper Format Date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddContact = async (data: Partial<Contact>) => {
    setLoading(true);
    try {
      const res = await AxiosPrivate.post(`/${workspaceId}/contacts`, data);
      const result = res.data as ResponseApi;
      setContacts((prev) => [result.data, ...prev]);
      setTotal((prev) => prev + 1);
    } catch (err) {
      console.error("Error adding contact: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContacts = async () => {
    if (!confirm("Apakah anda yakin ingin menghapus?")) return;
    const oldContacts = contacts.filter(p => selected.includes(p.id));
    try {
      setContacts((prev) => prev.filter(p => !selected.includes(p.id)));
      setSelected([]);
      await AxiosPrivate.post(`/${workspaceId}/contacts/delete`, {
        ids: selected
      });
    } catch (err) {
      console.error("Error adding contact: ", err);
      setContacts(prev => [...oldContacts, ...prev]);
    }
  };

  const toggleAll = () =>
    setSelected(selected.length === contacts.length ? [] : contacts.map((c) => c.id));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  // Fetch Contacts with Search & Cursor Pagination
  const fetchContacts = useCallback(
    async (cursor: string | null = null, search: string = "") => {
      if (!workspaceId) return;
      setLoading(true);
      try {
        const res = await AxiosPrivate.get(`/${workspaceId}/contacts`, {
          params: {
            cursor: cursor || undefined,
            limit: 10,
            search: search || undefined,
            status: statusFilter !== "ALL" ? statusFilter : undefined,
          },
        });
        const result = res.data as ResponseApi;

        setContacts(Array.isArray(result.data) ? result.data : []);
        setTotal(result.total || 0);
        setTotalPage(result.totalPage || 1);
        setNextId(result.nextId || null);
      } catch (err) {
        console.error("Fetch error: ", err);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId, AxiosPrivate, statusFilter]
  );

  // Initial Fetch & Reset on Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setCursorHistory([null]);
      fetchContacts(null, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchContacts]);

  const handleNextPage = () => {
    if (!nextId) return;
    setCursorHistory((prev) => [...prev, nextId]);
    setPage((p) => p + 1);
    fetchContacts(nextId, searchTerm);
  };

  const handlePrevPage = () => {
    if (page <= 1) return;
    const newHistory = [...cursorHistory];
    newHistory.pop();
    const prevCursor = newHistory[newHistory.length - 1];

    setCursorHistory(newHistory);
    setPage((p) => p - 1);
    fetchContacts(prevCursor, searchTerm);
  };

  return (
    <div className="h-full overflow-auto p-4 sm:p-6 bg-background space-y-5">
      {/* Page Header */}
      <PageHeader
        title="Contacts"
        subtitle={`${total.toLocaleString()} total contacts recorded`}
        actions={
          <div className="flex items-center gap-2">
            {/* <Btn variant="outline" size="sm" icon={Upload}>
              Export
            </Btn> */}
            <Btn variant="outline" size="sm" onClick={handleDownloadPdf}>
              {loadingExport ? <>
                <Loader2 className="animate-spin w-3.5 h-3.5" />
                processing
              </> : 
              <>
                <Download className="w-3.5 h-3.5" />
                export
              </>}
            </Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedContact(null);
                setIsOpen(true);
              }}
              icon={Plus}
            >
              Add Contact
            </Btn>
          </div>
        }
      />

      <ContactFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleAddContact}
        initialData={selectedContact}
      />

      {/* Filter & Actions Bar */}
      <Card className="p-3.5 border border-border shadow-sm rounded-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 rounded-lg pl-9 pr-8 py-2 text-xs border border-border focus:border-primary focus:bg-background focus:outline-none transition-all"
              placeholder="Cari berdasarkan nama, telepon, atau ID..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-muted/50 rounded-lg px-3 py-2 text-xs border border-border text-foreground font-medium focus:outline-none focus:border-primary"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            {/* Bulk Selection Actions */}
            {selected.length > 0 && (
              <div className="flex items-center gap-2 pl-2 border-l border-border animate-in fade-in">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                  {selected.length} dipilih
                </span>
                <Btn variant="outline" size="sm" icon={Tag}>
                  Tag
                </Btn>
                <Btn variant="danger" size="sm" icon={Trash2} onClick={() => handleDeleteContacts()}>
                  Delete
                </Btn>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Table Container */}
      <Card className="overflow-hidden border border-border shadow-sm rounded-xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 whitespace-nowrap">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selected.length === contacts.length}
                    onChange={toggleAll}
                    className="rounded accent-primary cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="px-3 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Kontak
                </th>
                <th className="px-3 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Sender ID / Phone
                </th>
                <th className="px-3 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-3 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Aktivitas Terakhir
                </th>
                <th className="px-3 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Metadata / Tags
                </th>
                <th className="px-3 py-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Dibuat
                </th>
                <th className="px-3 py-3 text-right text-[11px] font-bold tracking-wider text-muted-foreground uppercase pr-4">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-3.5"><div className="w-4 h-4 bg-muted rounded" /></td>
                    <td className="px-3 py-3.5"><div className="h-4 bg-muted rounded w-32 mb-1" /><div className="h-3 bg-muted/60 rounded w-20" /></td>
                    <td className="px-3 py-3.5"><div className="h-4 bg-muted rounded w-28" /></td>
                    <td className="px-3 py-3.5"><div className="h-4 bg-muted rounded w-16" /></td>
                    <td className="px-3 py-3.5"><div className="h-4 bg-muted rounded w-24" /></td>
                    <td className="px-3 py-3.5"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="px-3 py-3.5"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="px-3 py-3.5"><div className="w-16 h-6 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                      <div className="p-3 bg-muted rounded-full text-muted-foreground">
                        <UserX className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-foreground">Kontak tidak ditemukan</p>
                      <p className="text-[11px] text-muted-foreground">
                        {searchTerm
                          ? `Tidak ada hasil untuk pencarian "${searchTerm}".`
                          : "Belum ada data kontak di workspace ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const isSelected = selected.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors hover:bg-muted/30 ${isSelected ? "bg-primary/[0.03]" : ""
                        }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggle(c.id)}
                          className="rounded accent-primary cursor-pointer w-4 h-4"
                        />
                      </td>

                      {/* Name & Avatar */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl}
                              alt={c.name || c.senderId}
                              className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 shrink-0">
                              {getInitials(c.name ?? "", c.senderId)}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-foreground">
                              {c.name || "Tanpa Nama"}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                              {c.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sender ID & Phone */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-mono text-foreground font-semibold">
                          {c.phoneNumber ? `+${c.phoneNumber}` : "-"}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {c.senderId}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        {c.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                            <ShieldAlert className="w-3 h-3" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>

                      {/* Last Active At */}
                      <td className="px-3 py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">
                        {c.lastActiveAt ? formatDate(c.lastActiveAt) : '-'}
                      </td>

                      {/* Metadata / Tags */}
                      <td className="px-3 py-3.5">
                        {c.metadata && Object.keys(c.metadata).length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {Object.entries(c.metadata)
                              .slice(0, 2)
                              .map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/80"
                                >
                                  {key}: {String(val)}
                                </span>
                              ))}
                            {Object.keys(c.metadata).length > 2 && (
                              <span className="text-[10px] text-muted-foreground font-medium self-center">
                                +{Object.keys(c.metadata).length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-3 py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* Direct Actions (Show & Edit) */}
                      <td className="px-3 py-3.5 text-right whitespace-nowrap pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenShow(c)}
                            title="Detail Kontak"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Kontak"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Cursor Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">
            Halaman <span className="font-semibold text-foreground">{page}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalPage}</span> ({total.toLocaleString()} total kontak)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold bg-background hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs font-semibold px-2 text-foreground font-mono">
              {page}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!nextId || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold bg-background hover:bg-muted text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* MODAL SHOW / EDIT */}
      <AnimatePresence>
        {mode && selectedContact && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {mode === 'show' ? 'Detail Kontak' : 'Edit Kontak'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Detail (SHOW) */}
              {mode === 'show' && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20 shrink-0">
                      {getInitials(selectedContact.name ?? "", selectedContact.senderId)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {selectedContact.name || 'Tanpa Nama'}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedContact.senderId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Nomor Telepon</span>
                      <span className="font-mono text-foreground">{selectedContact.phoneNumber ? `+${selectedContact.phoneNumber}` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Status</span>
                      {selectedContact.isBlocked ? (
                        <span className="text-destructive font-semibold">Blocked</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Active</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Terakhir Aktif</span>
                      <span className="text-foreground">{formatDate(selectedContact.lastActiveAt || '')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Dibuat Pada</span>
                      <span className="text-foreground">{formatDate(selectedContact.createdAt)}</span>
                    </div>
                  </div>

                  {/* Metadata Section */}
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">Metadata</span>
                    {selectedContact.metadata && Object.keys(selectedContact.metadata).length > 0 ? (
                      <pre className="bg-muted p-2.5 rounded-lg text-[11px] font-mono text-foreground overflow-x-auto max-h-32">
                        {JSON.stringify(selectedContact.metadata, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Tidak ada metadata</p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenEdit(selectedContact)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Data
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}