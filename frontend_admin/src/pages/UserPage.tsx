import { useState, useEffect } from "react"
import { Search, Plus, Eye, Ban, RefreshCw } from "lucide-react"
import { ActionBtn } from "@/components/Action"
import { Card } from "@/components/Card"
import { Tooltip2 } from "@/components/ToolTip"
import { Badge } from "@/components/Badge"
import useUserHook from "@/hooks/UserHook"
import { UserFormModal } from "@/components/UserFormModal"

const roleColor: Record<string, "violet" | "sky" | "slate"> = {
  SUPER_ADMIN: "violet", SUPPORT: "sky", PLATFORM_CLIENT: "slate"
}

export default function UsersPage() {
  const {
    users, setUsers, nextId, setNextId,
    isOpen, setIsOpen,
    createUser
  } = useUserHook();
  const [search, setSearch] = useState("");
  return (
    <div className="p-6 space-y-4">
      <UserFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} onSave={createUser} />
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all" />
        </div>
        <div className="ml-auto"><ActionBtn variant="primary" onClick={() => setIsOpen(!isOpen)}><Plus size={12} />Add Admin User</ActionBtn></div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["User", "Username", "Email", "Role", "Registered", "Updated", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                // Ambil inisial nama atau username untuk fallback avatar jika thumbnail kosong
                const avatarFallback = (u.name || u.username).substring(0, 2).toUpperCase();

                return (
                  <tr key={u.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === users.length - 1 ? "border-0" : ""}`}>
                    {/* User & Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {u.thumbnail ? (
                          <img src={u.thumbnail} alt={u.username} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-700 to-indigo-900 flex items-center justify-center text-[10px] font-bold text-white">
                            {avatarFallback}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-white/80">{u.name ?? u.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3 text-white/60 font-mono text-[11px]">@{u.username}</td>

                    {/* Email */}
                    <td className="px-4 py-3 text-white/50 font-mono text-[11px]">{u.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <Badge color={roleColor[u.role]}>{u.role}</Badge>
                    </td>

                    {/* Created At (Registered) */}
                    <td className="px-4 py-3 text-white/40">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Updated At */}
                    <td className="px-4 py-3 text-white/40">
                      {new Date(u.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Tooltip2 content="Reset password">
                          <ActionBtn size="xs">
                            <RefreshCw size={11} />
                          </ActionBtn>
                        </Tooltip2>
                        <Tooltip2 content="View profile">
                          <ActionBtn size="xs">
                            <Eye size={11} />
                          </ActionBtn>
                        </Tooltip2>
                        <Tooltip2 content="Ban user">
                          <ActionBtn size="xs" variant="danger">
                            <Ban size={11} />
                          </ActionBtn>
                        </Tooltip2>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}