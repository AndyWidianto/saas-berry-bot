import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { chatbotKeys } from "../keys"
import { AxiosPrivate } from "@/lib/axios-service"
import { Filter, Knowledge, ResultResponse } from "@/lib/types"


export const useGetKnowledges = (workspaceId: string, filter: Filter) => {
    const fetchKnowledges = async () => {
        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/knowledges`);
            const result: ResultResponse<Knowledge[]> = res.data;
            console.log(result);
            return result;
        } catch (err) {
            console.error("Fetch error: ", err);
        }
    }

    return useQuery({
        queryKey: chatbotKeys.knowledges(filter),
        queryFn: fetchKnowledges
    })
}

export const useUpdateKnowledge = (id: string) => {

}

export const useDeleteKnowledge = (filter: Filter) => {
    const queryClient = useQueryClient();

    const deleteKnowledge = async (workspaceId: string, id: string) => {
        if (!confirm("Apakah anda yakin ingin menghapus" + id + "?")) return;
        const res = await AxiosPrivate.delete(`/${workspaceId}/knowledges/${id}`);
        const result: { message: string } = res.data;
        return result;
    }

    return useMutation({
        mutationFn: ({ workspaceId, id }: { workspaceId: string, id: string }) => deleteKnowledge(workspaceId, id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: chatbotKeys.knowledges(filter) })
        }
    })
}


export const useAddUrlKnowledge = (filter: Filter) => {
    const queryClient = useQueryClient();

    const handleAddUrlKnowledge = async (workspaceId: string, url: string) => {
        const res = await AxiosPrivate.post(`/${workspaceId}/knowledges/url`, {
            url
        });
        const result: ResultResponse<Knowledge> = res.data;
    }

    return useMutation({
        mutationFn: ({ workspaceId, url } : { workspaceId: string, url: string }) => handleAddUrlKnowledge(workspaceId, url),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatbotKeys.knowledges(filter) })
        }
    })
}

export const useCreateKnowledge = (workspaceId: string) => {
    const queryClient = useQueryClient();

    const createKnowledge = async (file: File) => {
        const formdata = new FormData();
        formdata.append("file", file);
        const res = await AxiosPrivate.post(`/${workspaceId}/knowledges`, formdata, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        const result: ResultResponse<Knowledge> = res.data;
        return result;
    }
    return useMutation({
        mutationFn: (file: File) => createKnowledge(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatbotKeys.knowledges({}) })
        }
    })
}