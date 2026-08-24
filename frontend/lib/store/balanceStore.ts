import { create } from "zustand";
import { WorkspaceBalance } from "../types";


interface BalanceStore {
  balance: WorkspaceBalance | null;
  setBalance: (newBalance: WorkspaceBalance) => void;
}

export const useBalanceStore = create<BalanceStore>((set) => ({
  balance: null,
  setBalance: (newBalance) => set({ balance: newBalance })
}));