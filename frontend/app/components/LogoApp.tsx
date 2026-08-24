"use client";
import { AnimatePresence, motion } from "framer-motion";


export default function LogoApp({ collapsed = false, mobileOpen = false }: { mobileOpen?: boolean, collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <img src="/logo_berry.png" alt="logo berry" className="w-6 h-6 object-cover" />
      </div>
      <AnimatePresence>
        {(!collapsed || mobileOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span className="font-bold text-foreground text-base tracking-tight truncate block">
              Berry Sweet
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}