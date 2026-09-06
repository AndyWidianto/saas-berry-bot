import useAxios from "@/lib/axios.control";
import { GETResponse, Workspace } from "@/lib/types";
import { useEffect, useState } from "react";



export default function useWorkspaceHook() {
    const { AxiosPrivate } = useAxios();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);


    const fetchWorkspaces = async () => {
        try {
            const res = await AxiosPrivate.get("/v1/admin/workspaces");;
            const result = res.data as GETResponse;
            console.log(result);
            setWorkspaces(prev => [...prev, ...result.data]);
        } catch (errr) {
            console.error("error fetch: ", errr);
        }
    }

    useEffect(() => {
        fetchWorkspaces();
    }, []);
    return {
        workspaces,
        setWorkspaces
    }
}