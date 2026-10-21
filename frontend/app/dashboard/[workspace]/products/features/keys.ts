import { Filter } from "@/lib/types";


export const productKeys = {
    all: ['products'],
    products: (filter: Filter) => [...productKeys.all, filter]
}