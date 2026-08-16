import LandingNavbar from "../components/LandingNavbar";


export default function LandingLayout({ children }: { children: React.ReactNode }) {

    return (
        <div>
            <LandingNavbar />
            {children}
        </div>
    );
}