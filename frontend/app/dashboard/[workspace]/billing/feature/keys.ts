import { Filter } from "@/lib/types";



export const billingKeys = {
    all: ["billings"],
    invoices: () => [...billingKeys.all, "invoices"],
    addInvoice: (filter: Filter) => [...billingKeys.invoices(), filter],
    ledgers: (filter: Filter) => [...billingKeys.all, "ledgers", filter],
}