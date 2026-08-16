import { ResponseApi } from "@/lib/types";
import axios from "axios";
import { Calendar, ArrowRight, Tag, Clock } from "lucide-react";
import { Card } from "../../components/Cards";
import { Btn } from "../../components/Button";
import LandingNavbar from "../../components/LandingNavbar";


interface ArticleTagPivot {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  tags?: ArticleTagPivot[];
}

async function FetchArticles(): Promise<ResponseApi | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await axios.get(`${baseUrl}/articles`);
    return res.data as ResponseApi;
  } catch (err) {
    console.error("Fetch error: ", err);
    return null;
  }
}

export default async function BlogPage() {
  // Melakukan fetch data di sisi server
  const response = await FetchArticles();

  // Asumsi response.data berisi array of Article
  const articles: Article[] = response?.data || [];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/20">
      <header className="max-w-5xl mx-auto px-6 pt-24 pb-12 border-b border-border/30">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
          Latest Updates
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Pembaruan terbaru, tutorial integrasi API, dan panduan lengkap seputar pengelolaan WhatsApp dengan AI.
        </p>
      </header>

      {/* Main Content / Blog Grid */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-2xl bg-muted/10">
            <p className="text-sm font-medium text-muted-foreground">Belum ada artikel yang diterbitkan saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="p-0 overflow-hidden bg-card border border-border/60 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                {/* 1. Thumbnail Image */}
                <div className="aspect-video w-full bg-muted/40 relative overflow-hidden border-b border-border/40">
                  <img
                    src={"https://images.pexels.com/photos/7304970/pexels-photo-7304970.jpeg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  {/* 2. Tags & Read Time */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.map((t) => (
                        <span key={t.tag.id} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {t.tag.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 5 min read
                    </span>
                  </div>

                  {/* 3. Title & Excerpt */}
                  <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-6">
                    {article.content.replace(/<[^>]+>/g, '')}
                  </p>

                  {/* 4. Footer: Author & Date */}
                  <div className="pt-4 border-t border-border/40 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        A
                      </div>
                      <span className="text-xs font-medium text-foreground">Andy W.</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}