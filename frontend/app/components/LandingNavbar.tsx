"use client";
import { LogIn, Menu, MessageSquare, UserPlus, X, Zap } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"
import { Btn } from "./Button";
import Link from "next/link";
import LogoApp from "./LogoApp";
import { useState } from "react";


export default function LandingNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="w-full border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 md:px-10 py-4">
                <LogoApp />

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-7">
                    <Link
                        href="/home"
                        className={`text-xs transition-colors ${pathname === '/home' || pathname === '/'
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

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <a href="/login" className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        Sign In
                    </a>
                    <Btn onClick={() => router.push("/register")} variant="primary" size="sm" className="shadow-sm shadow-primary/10">
                        Register Free
                    </Btn>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu Overlay/Dropdown */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md px-6 py-5 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/home"
                            onClick={closeMenu}
                            className={`text-sm py-1 transition-colors ${pathname === '/home' || pathname === '/'
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Home
                        </Link>

                        <a
                            href="/home/#features"
                            onClick={closeMenu}
                            className="text-sm py-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Features
                        </a>

                        <Link
                            href="/home/blog"
                            onClick={closeMenu}
                            className={`text-sm py-1 transition-colors ${pathname.startsWith('/home/blog')
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Blog
                        </Link>

                        <Link
                            href="/home/contact"
                            onClick={closeMenu}
                            className={`text-sm py-1 transition-colors ${pathname === '/home/contact'
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Contact
                        </Link>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex flex-col gap-3">
                        <a
                            href="/login"
                            onClick={closeMenu}
                            className="text-sm text-center font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors"
                        >
                            Sign In
                        </a>
                        <Btn
                            onClick={() => {
                                closeMenu();
                                router.push("/register");
                            }}
                            variant="primary"
                            size="sm"
                            className="w-full shadow-sm shadow-primary/10"
                        >
                            Register Free
                        </Btn>
                    </div>
                </div>
            )}
        </nav>
    );
}