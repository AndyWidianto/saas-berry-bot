import { create } from "zustand";
import { AIModel, TokenBalance } from "../types";



export interface AIModelStore {
    selectedModel: string | null;
    aimodels: AIModel[]; 
    aiModelNextId: string | null;
    tokenBalanceNextId: string | null;
    tokenBalances: TokenBalance[];
    isLoadingModels: boolean;
    isLoadingTokenBalances: boolean;
    setSelectedModel: (modelId: string | null) => void;
    setAIModels: (models: AIModel[]) => void;
    setTokenBalances: (balances: TokenBalance[]) => void;
}

export const useAIModelStore = create<AIModelStore>((set) => ({
    selectedModel: null,
    aimodels: [],
    tokenBalances: [],
    aiModelNextId: null,
    tokenBalanceNextId: null,
    isLoadingModels: false,
    isLoadingTokenBalances: false,
    setSelectedModel: (modelId) => set({ selectedModel: modelId }),
    setAIModels: (models) => set({ aimodels: models }),
    setTokenBalances: (balances) => set({ tokenBalances: balances }),
}));
