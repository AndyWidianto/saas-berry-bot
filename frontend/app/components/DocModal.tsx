import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';

interface Step {
    stepNumber: number;
    badge: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
}

const steps: Step[] = [
    {
        stepNumber: 1,
        badge: "Langkah 1 dari 3",
        title: "Membuat Workspace Baru",
        description: "Klik menu dropdown di bagian atas Dashboard, lalu pilih '+ Buat Workspace Baru' untuk menyiapkan area kerja project Anda.",
        image: "/docs/1.png",
        imageAlt: "Tampilan pembuatan workspace baru"
    },
    {
        stepNumber: 2,
        badge: "Langkah 2 dari 3",
        title: "Konfigurasi Model AI",
        description: "Masuk ke menu 'AI Chatbot', pilih tab 'Settings & Token AI', lalu tentukan model AI yang ingin Anda gunakan.",
        image: "/docs/2.png",
        imageAlt: "Tampilan pengaturan AI Chatbot"
    },
    {
        stepNumber: 3,
        badge: "Langkah 3 dari 3",
        title: "Integrasi Perangkat (WhatsApp)",
        description: "Masuk ke menu 'Integrations', klik tombol '+ Tambah Device' pada opsi WhatsApp, lalu lakukan koneksi (Connect).",
        image: "/docs/3.png",
        imageAlt: "Tampilan integrasi WhatsApp device"
    }
];

export default function StepGuideModal() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);

    useEffect(() => {
        // Cek status penyelesaian di localStorage
        const isCompleted = localStorage.getItem('hasCompletedOnboardingGuide');
        if (!isCompleted) {
            setIsOpen(true);
        }
    }, []);

    const handleFinish = () => {
        setIsOpen(false);
        // Simpan status agar modal tidak pernah muncul lagi
        localStorage.setItem('hasCompletedOnboardingGuide', 'true');
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleFinish();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    if (!isOpen) return null;

    const activeData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
            {/* Container utama dibuat max-w-2xl agar screenshot UI terasa lega */}
            <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

                {/* Tombol Close */}
                <button
                    onClick={handleFinish}
                    className="absolute right-3 top-3 z-10 rounded-full bg-slate-100 p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                    title="Lewati panduan"
                >
                    <X size={18} />
                </button>

                {/* Bagian Atas: Teks & Informasi Langkah */}
                <div className="flex w-full flex-col justify-between p-6 pb-2">
                    <div>
                        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {activeData.badge}
                        </span>

                        <h3 className="mt-3 text-xl font-bold text-slate-900">
                            {activeData.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {activeData.description}
                        </p>
                    </div>

                    {/* Stepper Dots */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex space-x-1.5">
                            {steps.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentStep(idx)}
                                    className={`h-2 rounded-full transition-all ${currentStep === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                            {currentStep + 1} dari {steps.length}
                        </span>
                    </div>
                </div>

                {/* Bagian Tengah: Visual Gambar UI (Tampilan Utuh) */}
                <div className="px-6 py-2">
                    <div className="relative flex min-h-[220px] max-h-[360px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <img
                            src={activeData.image}
                            alt={activeData.imageAlt}
                            className="h-auto max-h-[350px] w-full object-contain"
                        />

                        {/* Navigasi Panah Kiri */}
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white border border-slate-100"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}

                        {/* Navigasi Panah Kanan */}
                        {!isLastStep && (
                            <button
                                onClick={nextStep}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg backdrop-blur-sm transition hover:bg-white border border-slate-100"
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bagian Bawah: Tombol Aksi */}
                <div className="mt-2 border-t border-slate-100 bg-slate-50 p-4">
                    <div className="flex space-x-3">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="w-1/3 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                Kembali
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition ${currentStep > 0 ? 'w-2/3' : 'w-full'
                                } ${isLastStep
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isLastStep ? (
                                <>
                                    <CheckCircle2 size={16} /> Saya Mengerti
                                </>
                            ) : (
                                'Langkah Selanjutnya'
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}