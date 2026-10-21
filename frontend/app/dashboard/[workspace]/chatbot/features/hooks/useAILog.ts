import { AxiosPrivate } from "@/lib/axios-service";
import { AILogs, Filter, ResultResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { chatbotKeys } from "../keys";



export const useGetAILogs = (workspaceId: string, filter: Filter) => {
    const fetchAiLogs = async () => {
        const res = await AxiosPrivate.get(`/${workspaceId}/aimodels/ailogs`, {
            params: filter
        });
        const result: ResultResponse<AILogs[]> = res.data;
        return result;
    };

    return useQuery({
        queryKey: chatbotKeys.ailogs(filter),
        queryFn: fetchAiLogs
    })
}