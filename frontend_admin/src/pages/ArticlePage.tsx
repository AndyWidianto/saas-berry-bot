import { ActionBtn } from "@/components/Action"
import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import useAxios from "@/lib/axios.control"
import { Article, CreateArticle } from "@/types"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Edit3, ExternalLink, FileText, Globe, Loader2, Plus, RefreshCw, Search, ToggleLeft, ToggleRight, Trash2, Upload, X, XCircle } from "lucide-react"
import { useEffect, useState } from "react"





export default function ArticlesPage() {
  const { AxiosPrivate } = useAxios();
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [editorOpen, setEditorOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isSubmittingPublish, setIsSubmittingPublish] = useState(false);
  const [formData, setFormData] = useState<CreateArticle>({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    featuredImage: "",
    featuredImageAlt: "",
    excerpt: "",
    authorName: "Tim Redaksi",
    isPublished: false,
    publishedAt: undefined,
    isIndexable: true,
    tagIds: [],
  });
  const isSubmitting = isSubmittingDraft || isSubmittingPublish;

  const handleSubmit = async (e: React.FormEvent, shouldPublish?: boolean) => {
    e.preventDefault();
    if (shouldPublish) {
      setIsSubmittingPublish(true);
    } else {
      setIsSubmittingDraft(true);
    }
    try {

      const payload: CreateArticle = {
        ...formData,
        isPublished: shouldPublish !== undefined ? shouldPublish : formData.isPublished,
        publishedAt: shouldPublish ? new Date().toISOString() : formData.publishedAt,
      };
      setEditorOpen(false);
      const res = await AxiosPrivate.post("articles", payload);
      const result = res.data;
      console.log(result);
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      setIsSubmittingDraft(false);
      setIsSubmittingPublish(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await AxiosPrivate.get("articles");
      const result = res.data;
      setArticles(result.data);
      console.log(result);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === "all" || a.content === catFilter
    return matchSearch && matchCat
  })
  useEffect(() => {
    fetchArticles();
  }, [])

  return (
    <div className="p-6 space-y-4 relative">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…" className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all" />
        </div>
        {(["all", "Public Docs", "Tenant Guides", "System Prompts"] as const).map((c) => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border ${catFilter === c ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60"}`}>
            {c === "all" ? "All" : c}
          </button>
        ))}
        <div className="ml-auto">
          <ActionBtn variant="primary" onClick={() => setEditorOpen(true)}><Plus size={12} />Create Article</ActionBtn>
        </div>
      </div>
      <Card className="overflow-hidden border border-white/[0.08] bg-[#0e1117] rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {[
                  "Artikel",
                  "Author",
                  "Indexing (SEO)",
                  "Status",
                  "Tanggal Publish",
                  "Terakhir Diubah",
                  "Aksi",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((article) => (
                <tr
                  key={article.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Title, Featured Image & Slug */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3 max-w-[280px]">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt={article.featuredImageAlt || article.title}
                          className="w-10 h-10 rounded-lg object-cover bg-white/5 border border-white/[0.08] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-white/30">
                          <FileText size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div
                          className="font-medium text-white/90 truncate group-hover:text-violet-300 transition-colors"
                          title={article.title}
                        >
                          {article.title}
                        </div>
                        <div className="text-white/30 font-mono text-[10px] truncate max-w-[200px]">
                          /{article.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Author Name */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-white/70 font-medium">
                      {article.authorName || "Tim Redaksi"}
                    </span>
                  </td>

                  {/* Indexing / SEO Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {article.isIndexable ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={11} /> Indexable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.04] text-white/40 border border-white/[0.08]">
                        <XCircle size={11} /> Noindex
                      </span>
                    )}
                  </td>

                  {/* Publish Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {article.isPublished ? (
                      <Badge color="green">Published</Badge>
                    ) : (
                      <Badge color="amber">Draft</Badge>
                    )}
                  </td>

                  {/* Published At */}
                  <td className="px-4 py-3.5 text-white/50 whitespace-nowrap font-mono text-[11px]">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "-"}
                  </td>

                  {/* Updated At */}
                  <td className="px-4 py-3.5 text-white/40 whitespace-nowrap font-mono text-[11px]">
                    {new Date(article.updatedAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <ActionBtn size="xs" title="Edit Artikel">
                        <Edit3 size={11} />
                      </ActionBtn>
                      <ActionBtn size="xs" title="Lihat Slug">
                        <ExternalLink size={11} />
                      </ActionBtn>
                      <ActionBtn size="xs" variant="danger" title="Hapus Artikel">
                        <Trash2 size={11} />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                    Tidak ada artikel yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Article Editor Slide-over */}
      <AnimatePresence>
        {editorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setEditorOpen(false)}
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[540px] bg-[#0e1117] border-l border-white/[0.08] flex flex-col font-sans antialiased text-white"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <FileText size={14} />
                  </div>
                  <div className="text-[14px] font-semibold text-white/90">
                    Create Article
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer border-0 text-white/50 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Form Body */}
              <form id="article-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Article Title */}
                <div>
                  <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                    Article Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
                    placeholder="e.g. Cara Membangun Agent AI Menggunakan NestJS"
                  />
                </div>

                {/* Slug & Author Name Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                      Slug (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all font-mono"
                      placeholder="auto-generated-if-empty"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
                      placeholder="Tim Redaksi"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                    Excerpt / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all resize-none"
                    placeholder="Ringkasan singkat artikel untuk preview..."
                  />
                </div>

                {/* Featured Image & Alt */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                      Featured Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
                      placeholder="https://domain.com/image.png"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.featuredImageAlt}
                      onChange={(e) => setFormData({ ...formData, featuredImageAlt: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
                      placeholder="Deskripsi gambar untuk SEO"
                    />
                  </div>
                </div>

                {/* Content (Markdown) */}
                <div>
                  <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                    Content (Markdown) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/70 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all resize-none font-mono"
                    placeholder="# Article Title&#10;&#10;Write your content here in Markdown format..."
                  />
                </div>

                {/* SEO Section Accordion/Box */}
                <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
                    <Globe size={13} className="text-sky-400" />
                    <span>SEO Optimization</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50"
                      placeholder="Meta title unik untuk SERP Google"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-white/40">Meta Description</label>
                      <span className={`text-[10px] ${formData.metaDescription.length > 160 ? "text-rose-400" : "text-white/30"}`}>
                        {formData.metaDescription.length}/160
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={160}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 resize-none"
                      placeholder="Deskripsi singkat yang akan muncul di mesin pencari..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Keywords (Pisahkan koma)</label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50"
                      placeholder="nest, ai, vector, rag"
                    />
                  </div>
                </div>

                {/* Settings / Toggles */}
                <div className="space-y-2">
                  {/* Indexable Switch */}
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                    <div>
                      <div className="text-[12px] font-medium text-white/80">Search Engine Indexable</div>
                      <div className="text-[11px] text-white/35">Izinkan mesin pencari (Google) mengindeks artikel ini</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isIndexable: !formData.isIndexable })}
                      className="cursor-pointer border-0 bg-transparent p-0"
                    >
                      {formData.isIndexable ? (
                        <ToggleRight size={26} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={26} className="text-white/25" />
                      )}
                    </button>
                  </div>

                  {/* Published Switch */}
                  <div className="flex items-center justify-between p-3 bg-violet-500/8 border border-violet-500/15 rounded-lg">
                    <div>
                      <div className="text-[12px] font-medium text-violet-300">Publish Immediately</div>
                      <div className="text-[11px] text-white/35">Artikel langsung dapat diakses secara publik</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                      className="cursor-pointer border-0 bg-transparent p-0"
                    >
                      {formData.isPublished ? (
                        <ToggleRight size={26} className="text-violet-400" />
                      ) : (
                        <ToggleLeft size={26} className="text-white/25" />
                      )}
                    </button>
                  </div>
                </div>

              </form>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <ActionBtn
                  onClick={() => setEditorOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </ActionBtn>

                <ActionBtn
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={async (e: React.MouseEvent) => {
                    setIsSubmittingDraft(true);
                    try {
                      await handleSubmit(e, false);
                    } finally {
                      setIsSubmittingDraft(false);
                    }
                  }}
                >
                  {isSubmittingDraft ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-white/70" />
                      Saving...
                    </>
                  ) : (
                    "Save Draft"
                  )}
                </ActionBtn>

                <ActionBtn
                  variant="primary"
                  disabled={isSubmitting}
                  onClick={async (e: React.MouseEvent) => {
                    setIsSubmittingPublish(true);
                    try {
                      await handleSubmit(e, true);
                    } finally {
                      setIsSubmittingPublish(false);
                    }
                  }}
                  className="bg-violet-600 hover:bg-violet-500 border-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingPublish ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-white/90" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload size={12} />
                      Publish Article
                    </>
                  )}
                </ActionBtn>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}