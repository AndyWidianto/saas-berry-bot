import { MessageSquare } from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import LogoApp from "../components/LogoApp";


export default function LandingLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="scroll-smooth">
            <LandingNavbar />
            {children}
            <footer className="border-t border-border/40">
                <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <LogoApp />
                    {/* <div className="flex items-center gap-6 text-[11px] font-medium text-muted-foreground">
                        <a href="#" className="hover:text-foreground">Terms</a>
                        <a href="#" className="hover:text-foreground">Privacy</a>
                        <a href="#" className="hover:text-foreground">Status</a>
                    </div> */}
                    <div className="text-[11px] text-muted-foreground/60">
                        © {new Date().getFullYear()} Berry Sweet. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}