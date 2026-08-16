import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./components/AppSidebar"
import { Topbar } from "./components/AppNavbar"
import OverviewPage from "./pages/OverviewPage"
import WorkspacesPage from "./pages/WorkspacePage"
import UsersPage from "./pages/UserPage"
import AIModelsPage from "./pages/AiModelPage"
import ProviderKeysPage from "./pages/ProviderKeyPage"
import VectorDBPage from "./pages/VectorPage"
import ArticlesPage from "./pages/ArticlePage"
import KnowledgeBasePage from "./pages/KnowledgePage"
import TransactionsPage from "./pages/TransactionPage"
import SettingsPage from "./pages/SettingPage"
import LogsPage from "./pages/LogPage"
import { Page } from "./types"
import { Route, Routes } from "react-router"
import LoginPage from "./pages/LoginPage"
import Middleware from "./Middleware"


// ── Page titles ────────────────────────────────────────────────────────────
const pageMeta: Record<Page, { title: string; subtitle: string }> = {
  overview: { title: "Platform Overview", subtitle: "System health, revenue, and AI traffic" },
  workspaces: { title: "Workspaces / Tenants", subtitle: "147 workspaces · 3 requiring attention" },
  users: { title: "Platform Users", subtitle: "All platform accounts and roles" },
  "ai-models": { title: "AI Models Engine", subtitle: "LLMs, embedding models, fallback strategy" },
  "provider-keys": { title: "Provider Key Vault", subtitle: "System-level API key management" },
  "vector-db": { title: "Vector DB & Embeddings", subtitle: "Qdrant collections across all workspaces" },
  articles: { title: "Global Articles", subtitle: "Public docs, tenant guides, system prompts" },
  "knowledge-base": { title: "System Knowledge Base", subtitle: "Base templates for tenant chatbots" },
  transactions: { title: "Credit Ledger", subtitle: "Real-time token and credit audit log" },
  logs: { title: "System Logs & Traffic", subtitle: "Live event stream across all services" },
  settings: { title: "Platform Settings", subtitle: "Global configuration and system toggles" },
}


export default function App() {
  const [page, setPage] = useState<Page>("overview")
  const meta = pageMeta[page]

  const renderPage = () => {
    switch (page) {
      case "overview": return <OverviewPage />
      case "workspaces": return <WorkspacesPage />
      case "users": return <UsersPage />
      case "ai-models": return <AIModelsPage />
      case "provider-keys": return <ProviderKeysPage />
      case "vector-db": return <VectorDBPage />
      case "articles": return <ArticlesPage />
      case "knowledge-base": return <KnowledgeBasePage />
      case "transactions": return <TransactionsPage />
      case "logs": return <LogsPage />
      case "settings": return <SettingsPage />
      default: return null
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Middleware>
        <div className="flex h-screen overflow-hidden bg-[#080b12]">
          <Sidebar page={page} onNav={setPage} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar title={meta.title} subtitle={meta.subtitle} />
            <main className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderPage()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </Middleware>} />
    </Routes>
  )
}
