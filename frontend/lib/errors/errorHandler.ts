import axios from "axios";
import { toast } from "sonner";


export default function errorHandler(err: any) {
    if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Gagal menambahkan knoledge";
        toast.error(message);
    }
    console.error("Fetch error: ", err);
}