import useAxios from "@/lib/axios-service";
import { ResponseApi } from "@/lib/types";
import { useState, useCallback, useEffect } from "react";

export const useConversationList = (workspaceId?: string, filter: string = "all") => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { AxiosPrivate } = useAxios();

  const fetchConverstation = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/contacts`, {
        params: {
          limit: 10,
          platform: filter === "all" ? undefined : filter,
        },
      });
      const result = res.data as ResponseApi;

      setContacts(result.data || []);
      setNextCursor(result.nextId ?? null);
      setHasMore(Boolean(result.nextId));
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, filter]);

  const loadMoreContacts = useCallback(async () => {
    if (!workspaceId || !nextCursor || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const res = await AxiosPrivate.get(`/${workspaceId}/contacts`, {
        params: {
          limit: 10,
          platform: filter === "all" ? undefined : filter,
          cursor: nextCursor, // Kirim cursor data terakhir
        },
      });
      const result = res.data as ResponseApi;

      // Append data kontak baru di BAWAH array lama
      setContacts((prev) => [...prev, ...result.data]);
      setNextCursor(result.nextId ?? null);
      setHasMore(Boolean(result.nextId));
    } catch (err) {
      console.error("Load more error: ", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [workspaceId, filter, nextCursor, isLoadingMore, hasMore]);

  // Otomatis fetch ulang jika workspaceId atau filter berubah
  useEffect(() => {
    fetchConverstation();
  }, [fetchConverstation]);

  return {
    contacts,
    setContacts,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreContacts,
    refetchContacts: fetchConverstation,
  };
};