import useAxios from "@/lib/axios.control";
import { GETResponse, User } from "@/lib/types";
import { useEffect, useState } from "react";


export default function useUserHook() {
    const { AxiosPrivate } = useAxios();
    const [users, setUsers] = useState<User[]>([]);
    const [nextId, setNextId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await AxiosPrivate.get("/v1/admin/users");
            const result = res.data as GETResponse;
            console.log(result);
            setUsers(prev => [...prev, ...result.data]);
        } catch (err) {
            console.error("Fetch error : ", err);
        }
    }

    const createUser = async (data: Partial<User>) => {
        try {
            const res = await AxiosPrivate.post("/v1/admin/users", data);
            const result = res.data;
            console.log(result);
            setUsers(prev => [result.data, ...prev]);
        } catch (err) {
            console.error("Fetch error: ", err);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        setUsers,
        nextId,
        setNextId,
        isOpen, 
        setIsOpen,
        createUser
    }
}