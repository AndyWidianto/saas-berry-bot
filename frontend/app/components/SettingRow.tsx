
export const SettingsRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-0">
    <div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);