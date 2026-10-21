import { useQuery } from "@tanstack/react-query"
import { chatbotKeys } from "../keys"
import { AIModel, ResultResponse } from "@/lib/types";
import { AxiosPrivate } from "@/lib/axios-service";


export const useGetModels = () => {
    const fetchModels = async () => {
        const res = await AxiosPrivate.get(`/aimodels/active`);
        const result: ResultResponse<AIModel[]> = res.data;
        return result;
    };
    return useQuery({
        queryKey: chatbotKeys.models(),
        queryFn: fetchModels
    })
}