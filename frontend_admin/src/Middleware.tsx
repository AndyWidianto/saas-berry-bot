import { useAuthStore } from "./lib/store/authStore";
import { Navigate } from "react-router";

export default function Middleware({ children }: { children: React.ReactElement }) {
    const { isLogin } = useAuthStore();

    if (!isLogin) {
        return <Navigate to="/login" replace />;
    }

    return children;
}