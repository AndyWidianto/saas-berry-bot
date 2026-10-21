import useAxios from "@/lib/axios-service";
import { CreateProductFormData, Filter, Product, ResponseApi, ResponseUpload } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCreateProduct, useGetProducts, useUpdateProduct } from "../features/hooks/useProduct";


export default function useProduct(workspaceId: string) {
    const { AxiosPrivate } = useAxios();

    // Data States
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Pagination & Filter States
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(2);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [nextId, setNextId] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("All");


    const [history, setHistory] = useState([
        {
            page: 1,
            cursor: ""
        }
    ]);

    // Modal States
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);



    const filter = useMemo((): Filter => {
        return {
            cursor: nextId || "",
            limit: limit,
            search: search
        };
    }, [nextId, limit, search]);

    const { data: resultProducts, isLoading } = useGetProducts(workspaceId, filter);
    const { mutateAsync: createProduct } = useCreateProduct(filter);
    const { mutateAsync: updateProduct } = useUpdateProduct(workspaceId, filter);

    const products = resultProducts?.data ?? [];

    // Helper Format Rupiah
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(number);
    };


    // Create Product
    const handleCreateProduct = async (data: CreateProductFormData) => {
        setErrorMessage(null);

        try {
            await createProduct({
                workspaceId,
                data
            })
            onClose();
        } catch (err: any) {
            console.error("Create error: ", err);
            setErrorMessage(err?.response?.data?.message || "Gagal menambahkan produk baru.");
        }
    };

    // Update Product
    const handleUpdateProduct = async (id: string, data: CreateProductFormData) => {
        setErrorMessage(null);

        try {
            await updateProduct({
                id,
                data
            })
            onClose();
        } catch (err: any) {
            console.error("Update error: ", err);
            setErrorMessage(err?.response?.data?.message || "Gagal meng-update produk.");
        }
    };

    // Form Submit Handler
    const handleSubmit = async (data: CreateProductFormData) => {
        if (selectedProduct) {
            await handleUpdateProduct(selectedProduct.id, data);
        } else {
            await handleCreateProduct(data);
        }
    };

    // Open Modal untuk Edit
    const handleUpdate = (product: Product) => {
        setSelectedProduct(product);
        setErrorMessage(null);
        setIsOpen(true);
    };

    // Open Modal untuk Create
    const handleCreateNew = () => {
        setSelectedProduct(null);
        setErrorMessage(null);
        setIsOpen(true);
    };

    // Close Modal Handler
    const onClose = () => {
        setSelectedProduct(null);
        setErrorMessage(null);
        setIsOpen(false);
    };

    // Trigger Re-fetch ketika filter/page berubah
    useEffect(() => {
        if (!resultProducts) return;
        setTotalPage(resultProducts.totalPage || 1);
    }, [resultProducts]);

    // Reset page ke 1 jika user melakukan pencarian baru
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setPage(1);
    };

    const handleNextPage = () => {
        if (!resultProducts) return;
        setNextId(resultProducts.nextId);
    }

    useEffect(() => {
        let existingHistory = history.find(h => h.page === page);
        if (!existingHistory) {
            if (!resultProducts) return;
            const newHistory = {
                page,
                cursor: resultProducts.nextId
            }
            setHistory(prev => [...prev, newHistory]);
            existingHistory = newHistory;
        }

        setNextId(existingHistory.cursor);
    }, [page]);

    return {
        // Data & States
        products,
        isLoading,
        errorMessage,
        formatRupiah,

        // Pagination & Filter
        page,
        setPage,
        limit,
        setLimit,
        totalPage,
        nextId,
        search,
        setSearch: handleSearchChange,
        selectedStatus,
        setSelectedStatus: handleStatusChange,
        isOpen,
        setIsOpen,
        selectedProduct,
        handleCreateNew,
        handleUpdate,
        handleSubmit,
        onClose,
        handleNextPage
    };
}