"use client";

import { useState } from "react";
import { Btn } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Cards";
import { Badge } from "../../../components/Bagde";
import { Avatar } from "../../../components/Avatar";
import { ChevronLeft, ChevronRight, Download, Filter, MoreHorizontal, Plus, Search, Tag, Upload } from "lucide-react";
import cn from "../../../components/ClassName";


interface Contact {
  id: string; name: string; initials: string; phone: string; email: string;
  tags: string[]; lastInteraction: string; status: "active" | "inactive" | "blocked";
  createdAt: string; source: string; country: string; score: number; ltv: number; color: string;
}

const contacts: Contact[] = [
  { id: "1", name: "Sarah Johnson", initials: "SJ", phone: "+1 555-0101", email: "sarah@example.com", tags: ["VIP", "Loyal"], lastInteraction: "2h ago", status: "active", createdAt: "Jan 15, 2024", source: "WhatsApp", country: "US", score: 92, ltv: 4820, color: "#6366f1" },
  { id: "2", name: "Marcus Williams", initials: "MW", phone: "+1 555-0102", email: "marcus@example.com", tags: ["New"], lastInteraction: "15m ago", status: "active", createdAt: "Mar 22, 2024", source: "Instagram", country: "US", score: 67, ltv: 320, color: "#10b981" },
  { id: "3", name: "Emma Rodriguez", initials: "ER", phone: "+34 600 123 456", email: "emma@example.com", tags: ["Churned"], lastInteraction: "2d ago", status: "inactive", createdAt: "Nov 5, 2023", source: "Email", country: "ES", score: 34, ltv: 1250, color: "#3b82f6" },
  { id: "4", name: "Liam Chen", initials: "LC", phone: "+86 138 0013 8000", email: "liam@example.com", tags: ["VIP", "Enterprise"], lastInteraction: "1h ago", status: "active", createdAt: "Feb 10, 2024", source: "Telegram", country: "CN", score: 88, ltv: 12400, color: "#f59e0b" },
  { id: "5", name: "Olivia Davis", initials: "OD", phone: "+44 7911 123456", email: "olivia@example.com", tags: ["Loyal"], lastInteraction: "3h ago", status: "active", createdAt: "Dec 1, 2023", source: "Instagram", country: "UK", score: 78, ltv: 3200, color: "#8b5cf6" },
  { id: "6", name: "Noah Martinez", initials: "NM", phone: "+52 55 1234 5678", email: "noah@example.com", tags: ["New", "Lead"], lastInteraction: "4h ago", status: "active", createdAt: "Apr 1, 2024", source: "WhatsApp", country: "MX", score: 55, ltv: 180, color: "#ec4899" },
  { id: "7", name: "Ava Thompson", initials: "AT", phone: "+1 555-0107", email: "ava@example.com", tags: ["Loyal"], lastInteraction: "5h ago", status: "active", createdAt: "Oct 18, 2023", source: "Web Chat", country: "US", score: 81, ltv: 5600, color: "#14b8a6" },
  { id: "8", name: "Isabella Lee", initials: "IL", phone: "+82 10-1234-5678", email: "isabella@example.com", tags: ["VIP"], lastInteraction: "6h ago", status: "active", createdAt: "Sep 25, 2023", source: "WhatsApp", country: "KR", score: 95, ltv: 9800, color: "#f59e0b" },
];
export default function ContactsPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const toggleAll = () => setSelected(selected.length === contacts.length ? [] : contacts.map(c => c.id));
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const statusConfig: Record<Contact["status"], { label: string; variant: "success" | "default" | "danger" }> = {
    active: { label: "Active", variant: "success" },
    inactive: { label: "Inactive", variant: "default" },
    blocked: { label: "Blocked", variant: "danger" },
  };

  return (
    <div className="h-full overflow-auto p-6">
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length.toLocaleString()} total contacts`}
        actions={
          <>
            <Btn variant="secondary" size="sm" icon={Download}>Export</Btn>
            <Btn variant="secondary" size="sm" icon={Upload}>Import</Btn>
            <Btn variant="primary" size="sm" icon={Plus}>Add Contact</Btn>
          </>
        }
      />

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className="w-full bg-muted rounded-lg pl-9 pr-3 py-2 text-xs border border-border focus:border-primary/30 focus:outline-none" placeholder="Search by name, phone, email..." />
          </div>
          <Btn variant="secondary" size="sm" icon={Filter}>Filter</Btn>
          <Btn variant="secondary" size="sm" icon={Tag}>Segments</Btn>
          <select className="bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:outline-none">
            <option>All Status</option><option>Active</option><option>Inactive</option>
          </select>
          <select className="bg-muted rounded-lg px-3 py-2 text-xs border border-border focus:outline-none">
            <option>All Sources</option><option>WhatsApp</option><option>Instagram</option>
          </select>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
              <Btn variant="secondary" size="sm">Tag</Btn>
              <Btn variant="secondary" size="sm">Export</Btn>
              <Btn variant="danger" size="sm">Delete</Btn>
            </div>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selected.length === contacts.length} onChange={toggleAll} className="rounded accent-primary" />
                </th>
                {["Contact", "Phone", "Email", "Tags", "Last Interaction", "Status", "Score", "LTV", ""].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-muted-foreground px-3 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => {
                const st = statusConfig[c.status];
                return (
                  <tr key={c.id} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", selected.includes(c.id) && "bg-primary/5")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="rounded accent-primary" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={c.initials} color={c.color} size="sm" />
                        <div>
                          <div className="text-xs font-semibold text-foreground">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.source} · {c.country}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-foreground font-mono">{c.phone}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{c.email}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map(t => <Badge key={t} variant="info">{t}</Badge>)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{c.lastInteraction}</td>
                    <td className="px-3 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${c.score}%` }} />
                        </div>
                        <span className="text-xs font-mono text-foreground">{c.score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-foreground">${c.ltv.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Showing 1–8 of 24,812 contacts</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1,2,3].map(n => (
              <button key={n} onClick={() => setPage(n)} className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors", page === n ? "bg-primary text-white" : "hover:bg-muted text-foreground")}>
                {n}
              </button>
            ))}
            <span className="text-muted-foreground text-xs px-1">...</span>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-foreground text-xs font-medium">3101</button>
            <button onClick={() => setPage(p => p + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}