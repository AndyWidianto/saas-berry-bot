import cn from "./ClassName";

interface ToggleProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export const Toggle = ({ checked, onChange }: ToggleProps) => {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors focus:outline-none",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
      style={{ height: 22, width: 40 }}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform",
          checked && "translate-x-[18px]"
        )}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
};