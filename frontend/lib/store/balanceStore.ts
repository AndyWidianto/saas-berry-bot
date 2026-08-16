import { create } from "zustand";


interface BalanceStore {
  balance: number | null;
  setBalance: (newBalance: number) => void;
}

export const useBalanceStore = create<BalanceStore>((set) => ({
  balance: null,
  setBalance: (newBalance) => set({ balance: newBalance })
}));