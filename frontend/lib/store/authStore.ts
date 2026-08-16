import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";



type UserRole = "user" | "admin" | "super_admin" | "review"
type User = {
    id: string;
    name: string | null;
    email: string;
    role: UserRole;
    username: string;
    profileUrl: string | null;
}

type AuthStore = {
    user: User | null
    accessToken: string
    isLogin: boolean
    hasHydrated: boolean
    login: (user: User, accessToken: string) => void
    setAccessToken: (token: string) => void
    setHasHydrated: (hydrated: boolean) => void
    deleteSessionLogin: () => void
    setUser: (user: User) => void
}
const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            accessToken: "",
            user: null,
            isLogin: false,
            hasHydrated: false,
            setAccessToken: (token) => set({
                accessToken: token
            }),
            login: (user, accessToken) => set({
                accessToken: accessToken,
                user: user
            }),
            setHasHydrated: (state) => set({
                hasHydrated: state
            }),
            deleteSessionLogin: () => set({
                accessToken: "",
                isLogin: false,
                user: null,
            }),
            setUser: (user) => set({
                user: user
            })
        }),
        {
            name: "auth-session",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: (state) => {
                return () => {
                    state?.setHasHydrated(true);
                };
            },
        }
    )
)

export default useAuthStore;