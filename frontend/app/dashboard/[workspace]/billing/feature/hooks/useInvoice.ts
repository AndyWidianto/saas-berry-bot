import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { billingKeys } from "../keys"
import { CreditLedger, Filter, Invoice, ResultResponse } from "@/lib/types"
import { AxiosPrivate } from "@/lib/axios-service";



export const useGetInvoices = (workspaceId: string, filter: Filter) => {
    const fetchInvoices = async () => {
        const res = await AxiosPrivate.get(`/${workspaceId}/invoices`, {
            params: filter
        });
        const result: ResultResponse<Invoice[]> = res.data;
        return result
    };

    return useQuery({
        queryKey: billingKeys.addInvoice(filter),
        queryFn: fetchInvoices
    })
}


export const useAddInvoice = (workspaceId: string) => {

    const queryClient = useQueryClient();
    // Instant Top Up Midtrans
    const handleCheckout = async (nominal: number) => {
        const res = await AxiosPrivate.post(`/${workspaceId}/topup`, { nominal });
        const result = res.data;

        // if (typeof window !== "undefined" && window.snap) {
        //     window.snap.pay(result.token, {
        //         onSuccess: function () {
        //             toast.success("Pembayaran berhasil!");
        //             fetchBalance(null);
        //             fetchInvoices(1, null);
        //         },
        //         onPending: function () {
        //             toast.info("Menunggu pembayaran diselesaikan.");
        //             fetchInvoices(1, null);
        //         },
        //         onError: function () {
        //             toast.error("Pembayaran gagal!");
        //         },
        //         onClose: function () {
        //             toast.warning("Popup pembayaran ditutup.");
        //         }
        //     });
        // }
        window.open(result.redirect, '_blank');
    };
    return useMutation({
        mutationFn: ({ nominal }: { nominal: number }) => handleCheckout(nominal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billingKeys.invoices() })
        }
    })
}


export const useGetLedgers = (workspaceId: string, filter: Filter) => {
    const fetchLedgers = async () => {
        const res = await AxiosPrivate.get(`/${workspaceId}/creditledger`, {
            params: filter
        });
        const result: ResultResponse<CreditLedger[]> = res.data;
        return result;
    };
    return useQuery({
        queryKey: billingKeys.ledgers(filter),
        queryFn: fetchLedgers
    })
}