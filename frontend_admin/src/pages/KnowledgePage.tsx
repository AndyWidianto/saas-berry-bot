import { ActionBtn } from "@/components/Action";
import { Card } from "@/components/Card";
import { BookOpen, Plus } from "lucide-react";


export default function KnowledgeBasePage() {
  return (
    <div className="p-6">
      <Card className="p-12 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
          <BookOpen size={22} />
        </div>
        <div className="text-[15px] font-semibold text-white/70">System Knowledge Base</div>
        <div className="text-[12px] text-white/35 max-w-xs">Manage base knowledge templates distributed to all chatbot tenants on workspace creation. Coming soon.</div>
        <ActionBtn variant="primary"><Plus size={12} />Create Template</ActionBtn>
      </Card>
    </div>
  )
}