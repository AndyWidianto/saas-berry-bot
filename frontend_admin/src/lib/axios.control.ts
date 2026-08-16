import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

interface UseAxiosReturn {
    AxiosPrivate: AxiosInstance;
    AxiosPublic: AxiosInstance;
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const AxiosPrivate = axios.create({
    baseURL: BASE_URL,
    timeout: 300000, // 5 menit
    headers: { "Content-Type": "application/json" }
});

export const AxiosPublic = axios.create({
    baseURL: BASE_URL,
    timeout: 300000,
    headers: { "Content-Type": "application/json" }
});

export default function useAxios(): UseAxiosReturn {
    const { accessToken, setAccessToken, logout } = useAuthStore();

    useEffect(() => {
        const requestIntercept = AxiosPrivate.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (accessToken && config.headers) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        const responseIntercept = AxiosPrivate.interceptors.response.use(
            (response) => response, 
            async (error: AxiosError) => {
                const prevRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
                
                if (error.response?.status === 401 && !prevRequest._retry) {
                    console.log("Refresh Token berjalan");
                    prevRequest._retry = true; 

                    try {
                        const response = await AxiosPublic.post("/refreshToken", {}, {
                            withCredentials: true
                        });

                        console.log("Token baru didapat:", response.data);
                        const { accessToken: newAccessToken } = response.data;
                        
                        // Update state global
                        setAccessToken(newAccessToken);

                        // Update default header instance
                        AxiosPrivate.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

                        // Paksa timpa header request yang gagal saat ini
                        if (prevRequest.headers) {
                            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        }
                        
                        // Tembak ulang request yang gagal dengan method .request()
                        return AxiosPrivate.request(prevRequest);

                    } catch (refreshError) {
                        logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            AxiosPrivate.interceptors.request.eject(requestIntercept);
            AxiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [accessToken, setAccessToken, logout]);

    return {
        AxiosPrivate,
        AxiosPublic
    };
}