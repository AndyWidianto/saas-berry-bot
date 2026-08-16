import React, { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles } from "lucide-react";
import useAxios from "@/lib/axios.control";
import { ResponseLogin } from "@/types";
import { useAuthStore } from "@/lib/store/authStore";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function LoginPage() {
  const { AxiosPublic } = useAxios();
  const { setAccessToken, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await AxiosPublic.post("/login", {
        email: email,
        password: password
      }, {
        withCredentials: true
      });
      const result = res.data as ResponseLogin;
      if (result.user.role === "admin" || result.user.role === "super_admin") {
        setAccessToken(result.accessToken);
        setUser(result.user);
        toast.success("Login successfully");
        navigate("/");
      }
    } catch (err) {
      console.error("Fetch error: ", err)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0e1117] flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-white">
      {/* Background Glow Deco (Senada dengan tema Violet) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-[400px] bg-[#0e1117]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6 relative z-10 shadow-2xl shadow-black/50">

        {/* Header Section */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-2">
            <Sparkles size={20} />
          </div>
          <h1 className="text-[18px] font-semibold text-white/90 tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-[12px] text-white/40">
            Masukkan kredensial Anda untuk mengakses sistem
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-medium text-white/40">
                Password
              </label>
              <a
                href="#forgot"
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
              >
                Lupa password?
              </a>
            </div>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-9 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer border-0 bg-transparent p-0"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Remember Me / Toggle Option */}
          <div className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-lg">
            <span className="text-[12px] text-white/60">Ingat perangkat ini</span>
            <input
              type="checkbox"
              className="accent-violet-500 w-3.5 h-3.5 rounded bg-white/5 border-white/10 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 text-[13px] font-medium transition-all cursor-pointer border border-violet-500/30 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="text-[12px]">Memproses...</span>
            ) : (
              <>
                <span>Masuk Akun</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="pt-2 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-white/30 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Terenkripsi & Terlindungi oleh System Auth
          </p>
        </div>
      </div>
    </div>
  );
}