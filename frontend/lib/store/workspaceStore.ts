import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Workspace } from "../types";


interface WorkspaceStore {
  workspaceId: string | null;
  workspace: Workspace | null;
  setWorkspaceId: (id: string | null) => void;
  setWorkspace: (workspace: Workspace | null) => void;
}
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      workspaceId: null,
      workspace: null,
      setWorkspaceId: (id: string | null) => set({ workspaceId: id }),
      setWorkspace: (workspace: Workspace | null) => set({ workspace }),
    }),
    {
      name: "workspace-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);