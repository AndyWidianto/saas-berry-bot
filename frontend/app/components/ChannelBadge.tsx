import cn from "./ClassName";


export const ChannelBadge = ({ channel }: { channel: string }) => {
  const map: Record<string, { label: string; className: string }> = {
    whatsapp: { label: "WA", className: "bg-emerald-500 text-white" },
    instagram: { label: "IG", className: "bg-pink-500 text-white" },
    telegram: { label: "TG", className: "bg-blue-500 text-white" },
    email: { label: "EM", className: "bg-amber-500 text-white" },
  };
  const c = map[channel] || { label: "?", className: "bg-gray-400 text-white" };
  return <span className={cn("inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold flex-shrink-0", c.className)}>{c.label}</span>;
};
