import useAxios from "@/lib/axios-service";
import { CreateProductFormData, Product, ResponseApi, ResponseUpload } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";


export default function useProduct(workspaceId: string) {
    const { AxiosPrivate } = useAxios();

    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Pagination & Filter States
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [nextId, setNextId] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("All");

    // Modal States
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Helper Format Rupiah
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(number);
    };

    // Fetch Products dari Backend dengan Query Params
    const fetchProducts = useCallback(async () => {
        if (!workspaceId) return;

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const params: Record<string, any> = {
                cursor: nextId ?? undefined,
                limit,
            };

            if (search.trim()) params.search = search.trim();
            if (selectedStatus !== "All") params.stockStatus = selectedStatus;

            const res = await AxiosPrivate.get(`${workspaceId}/products`, { params });
            const result = res.data as ResponseApi;

            setProducts(result.data || []);
            setTotalPage(result.totalPage || 1);
            setNextId(result.nextId);
        } catch (err: any) {
            console.error("Fetch error: ", err);
            setErrorMessage(err?.response?.data?.message || "Gagal mengambil data produk.");
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId, page, limit, search, selectedStatus, AxiosPrivate]);

    // Handle Upload Gambar ke R2 / Cloud Storage
    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const resUpload = await AxiosPrivate.post(`workspaces/${workspaceId}/upload`, formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return resUpload.data as ResponseUpload;
    };

    // Create Product
    const createProduct = async (data: CreateProductFormData) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            let upload: ResponseUpload | null = null;
            if (data.file) {
                upload = await uploadImage(data.file);
            }

            // Bersihkan objek dari field 'file'
            const { file, ...cleanData } = data;

            const dataToSend = {
                ...cleanData,
                imageUrl: upload?.url || null,
                thumbnail: upload?.thumbnail || null, // Diperbaiki dari typo 'thubmnail'
            };

            const res = await AxiosPrivate.post(`${workspaceId}/products`, dataToSend);
            const newProduct = res.data?.data || res.data;

            // Update state secara lokal atau re-fetch
            setProducts((prev) => [newProduct, ...prev]);
            onClose();
        } catch (err: any) {
            console.error("Create error: ", err);
            setErrorMessage(err?.response?.data?.message || "Gagal menambahkan produk baru.");
        } finally {
            setIsLoading(false);
        }
    };

    // Update Product
    const updateProduct = async (id: string, data: CreateProductFormData) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            let upload: ResponseUpload | null = null;
            if (data.file) {
                upload = await uploadImage(data.file);
            }

            const { file, ...cleanData } = data;

            const dataToSend = {
                ...cleanData,
                ...(upload && {
                    imageUrl: upload.url,
                    thumbnail: upload.thumbnail, // Diperbaiki dari typo 'thubmnail'
                }),
            };

            const res = await AxiosPrivate.patch(`${workspaceId}/products/${id}`, dataToSend);
            const updatedProduct = res.data?.data || res.data;

            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
            );
            onClose();
        } catch (err: any) {
            console.error("Update error: ", err);
            setErrorMessage(err?.response?.data?.message || "Gagal meng-update produk.");
        } finally {
            setIsLoading(false);
        }
    };

    // Form Submit Handler
    const handleSubmit = async (data: CreateProductFormData) => {
        if (selectedProduct) {
            await updateProduct(selectedProduct.id, data);
        } else {
            await createProduct(data);
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
        fetchProducts();
    }, [fetchProducts]);

    // Reset page ke 1 jika user melakukan pencarian baru
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setPage(1);
    };

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
        refetch: fetchProducts,
    };
}