import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { productKeys } from "../keys"
import { CreateProductFormData, Filter, Product, ResponseUpload, ResultResponse } from "@/lib/types"
import { AxiosPrivate } from "@/lib/axios-service"


export const useGetProducts = (workspaceId: string, filter: Filter) => {
    const fetchProducts = async () => {
        const res = await AxiosPrivate.get(`${workspaceId}/products`, { params: filter });
        const result: ResultResponse<Product[]> = res.data;
        return result
    }
    return useQuery({
        queryKey: productKeys.products(filter),
        queryFn: fetchProducts
    })
}

export const uploadImage = async (workspaceId: string, file: File) => {
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

export const useCreateProduct = (filter: Filter) => {
    const queryClient = useQueryClient();

    const createProduct = async (workspaceId: string, data: CreateProductFormData) => {
        let upload: ResponseUpload | null = null;
        if (data.file) {
            upload = await uploadImage(workspaceId, data.file);
        }

        // Bersihkan objek dari field 'file'
        const { file, ...cleanData } = data;

        const dataToSend = {
            ...cleanData,
            imageUrl: upload?.url || null,
            thumbnail: upload?.thumbnail || null, // Diperbaiki dari typo 'thubmnail'
        };

        const res = await AxiosPrivate.post(`${workspaceId}/products`, dataToSend);
        const newProduct: ResultResponse<Product[]> = res.data;
        return newProduct;
    };

    return useMutation({
        mutationFn: ({ workspaceId, data }: { workspaceId: string, data: CreateProductFormData }) => createProduct(workspaceId, data),
        onSuccess: (_, data) => {
            queryClient.invalidateQueries({ queryKey: productKeys.products(filter) })
        }
    })
}

export const useUpdateProduct = (workspaceId: string, filter: Filter) => {

    const queryClient = useQueryClient();
    const updateProduct = async (id: string, data: Partial<CreateProductFormData>) => {
        let upload: ResponseUpload | null = null;
        if (data.file) {
            upload = await uploadImage(workspaceId, data.file);
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
        const result: ResultResponse<Product[]> = res.data;
        return result;
    };

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<CreateProductFormData> }) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.products(filter) })
        }
    })
}