import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Workspace } from "../types";


interface WorkspaceStore {
  workspaceId: string | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspaces: (data: Workspace[]) => void;
  setWorkspaceId: (id: string | null) => void;
  setWorkspace: (workspace: Workspace | null) => void;
}
export const useWorkspaceStore = create<WorkspaceStore>(
  (set) => ({
    workspaceId: null,
    workspace: null,
    workspaces: [],
    setWorkspaces: (data) => set({
      workspaces: data
    }),
    setWorkspaceId: (id: string | null) => set({ workspaceId: id }),
    setWorkspace: (workspace: Workspace | null) => set({ workspace }),
  })
);