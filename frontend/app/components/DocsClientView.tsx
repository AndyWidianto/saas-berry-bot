"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Code,
  Cpu,
  Database,
  Key,
  MessageSquare,
  Search,
  ChevronRight,
  Menu,
  X,
  Zap,
  Sparkles,
  Send,
  Inbox,
  FileText
} from 'lucide-react';
import LogoApp from '../components/LogoApp';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}


export const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs', icon: BookOpen },
      { title: 'Quickstart', href: '/docs/quickstart', icon: Zap },
    ],
  },
  // {
  //   title: 'WhatsApp Integration',
  //   items: [
  //     { title: 'Connect WhatsApp', href: '/docs/whatsapp-connect', icon: MessageSquare },
  //   ],
  // },
  {
    title: 'AI & Knowledge Base',
    items: [
      { title: 'Vector Embeddings', href: '/docs/embeddings', icon: Database },
    ],
  },
  {
    title: 'API & Integration',
    items: [
      { title: 'API Keys', href: '/docs/api-keys', icon: Key },
      { title: 'Get Messages', href: '/docs/messages', icon: Inbox },
    ],
  },
];

export default function DocsClientView({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setMobileSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans relative selection:bg-primary/20">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed top-[30%] right-[-10%] w-[400px] h-[400px] bg-violet-500/10 rounded-full filter blur-[120px] -z-10 pointer-events-none" />

      {/* Header Sticky Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Brand & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Toggle Navigation"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <LogoApp />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                Docs v1.0
              </span>
            </Link>
          </div>

          {/* Search Input Bar (Desktop) */}
          <div className="relative w-full max-w-xs hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-14 text-xs bg-muted/20 border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-background transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground/80 bg-muted/50 border border-border/40 rounded pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Search Button untuk Layar Kecil */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Input Search versi Mobile */}
        {mobileSearchOpen && (
          <div className="sm:hidden p-3 border-t border-border/40 bg-background/95">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-9 pl-9 pr-8 text-xs bg-muted/30 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-8">

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:sticky top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] shrink-0 border-r border-border/40 bg-background lg:bg-transparent transition-transform duration-300 ease-in-out overflow-y-auto p-4 lg:p-0 lg:py-8 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          <nav className="space-y-6">
            {filteredNavigation.length > 0 ? (
              filteredNavigation.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 px-3">
                    {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIdx) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon || FileText;

                      return (
                        <li key={itemIdx}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              setSidebarOpen(false);
                              setMobileSearchOpen(false);
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg font-medium transition-all duration-200 group relative ${isActive
                                ? 'text-primary bg-primary/10 font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                              }`}
                          >
                            {isActive && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                            )}

                            <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                              }`} />

                            <span className="flex-1 truncate">{item.title}</span>

                            {isActive && (
                              <ChevronRight className="w-3.5 h-3.5 text-primary ml-auto" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Tidak ditemukan</p>
                <p>Dokumentasi dengan kata kunci "{searchQuery}" tidak ada.</p>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content View Container */}
        <main className="flex-1 py-8 max-w-3xl min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}