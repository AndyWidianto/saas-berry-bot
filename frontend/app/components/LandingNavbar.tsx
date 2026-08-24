"use client";
import { LogIn, Menu, MessageSquare, UserPlus, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"
import { Btn } from "./Button";
import Link from "next/link";
import LogoApp from "./LogoApp";


export default function LandingNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    return (
        <nav className="w-full flex items-center justify-between px-6 md:px-10 py-4 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-50">
            <LogoApp />
            <div className="hidden md:flex items-center gap-7">
                <Link
                    href="/home"
                    className={`text-xs transition-colors ${pathname === '/'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Home
                </Link>

                <a
                    href="/home/#features"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    Features
                </a>

                <Link
                    href="/home/blog"
                    className={`text-xs transition-colors ${pathname.startsWith('/home/blog')
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Blog
                </Link>

                <Link
                    href="/home/contact"
                    className={`text-xs transition-colors ${pathname === '/home/contact'
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Contact
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
                <a href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                </a>
                <Btn onClick={() => router.push("/register")} variant="primary" size="sm" className="shadow-sm shadow-primary/10">
                    Register Free
                </Btn>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-muted-foreground">
                <Menu className="w-5 h-5" />
            </button>
        </nav>
    )
}