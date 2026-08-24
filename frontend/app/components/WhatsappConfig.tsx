'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Integrations, WhatsappBayliesSetting } from '@/lib/types';
import {
    X,
    Globe,
    Activity,
    Settings2,
    Check,
    AlertTriangle,
    Save,
    PhoneOff,
    CheckCheck,
    LogOut
} from 'lucide-react';
import { Card } from './Cards';
import { Btn } from './Button';

interface WhatsappConfigProps {
    close: () => void;
    updateConfig: (setting: WhatsappBayliesSetting) => void;
    setting: WhatsappBayliesSetting;
    integration?: Integrations;
    deleteDevice: (id: string) => Promise<void>;
}
export default function WhatsAppConfigDrawer({ close, updateConfig, setting, integration, deleteDevice }: WhatsappConfigProps) {
    const [autoRead, setAutoRead] = useState(setting?.autoRead ?? false);
    const [rejectCalls, setRejectCalls] = useState(setting?.rejectCalls ?? false);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [eventActive, setEventActive] = useState<string[]>(setting?.event || []);

    // Handling tombol Escape untuk menutup drawer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [close]);

    const updateEvent = (event: string) => {
        setEventActive(prev =>
            prev.includes(event) ? prev.filter(p => p !== event) : [...prev, event]
        );
    };

    if (!integration) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={close}
            />

            {/* Drawer Content */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-100 dark:border-slate-800"
            >
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                WhatsApp (Unofficial) Settings
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                                    {integration.number ? `+${integration.number.replace(/\D/g, '')}` : 'No Number'} • <span className="text-emerald-600 dark:text-emerald-400 font-medium capitalize">{integration.status || 'Active'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                    {/* Webhook Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Webhook & Subscriptions</span>
                        </div>
                        <Card className="p-4 space-y-4 border-slate-100 dark:border-slate-800 shadow-none bg-slate-50/40 dark:bg-slate-800/20">
                            {/* <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Webhook Endpoint
                                </label>
                                <input
                                    type="url"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                                    placeholder="https://api.domain.com/webhook/wa"
                                />
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                                    Payload JSON real-time akan dikirimkan ke URL ini.
                                </p>
                            </div> */}

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2.5">
                                    Events to Listen
                                </label>
                                <div className="space-y-2">
                                    {['messages.upsert', 'messages.update', 'presence.update'].map((event) => {
                                        const isActive = eventActive.includes(event);
                                        return (
                                            <div
                                                key={event}
                                                onClick={() => updateEvent(event)}
                                                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${isActive
                                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
                                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Activity className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                                                    <span className="font-mono">{event}</span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isActive
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-slate-300 dark:border-slate-700'
                                                    }`}>
                                                    {isActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Instance Behavior Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <Settings2 className="w-3.5 h-3.5" />
                            <span>Instance Behavior</span>
                        </div>
                        <Card className="p-4 space-y-4 border-slate-100 dark:border-slate-800 shadow-none divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Auto-Read */}
                            <div className="flex items-center justify-between pt-1 first:pt-0 gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <CheckCheck className="w-4 h-4 text-slate-400 shrink-0" />
                                        <h4 className="text-xs font-medium text-slate-900 dark:text-slate-200">Auto-Read Messages</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-6">
                                        Kirim centang biru otomatis saat pesan masuk.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAutoRead(!autoRead)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoRead ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${autoRead ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Reject Calls */}
                            <div className="flex items-center justify-between pt-3 gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <PhoneOff className="w-4 h-4 text-slate-400 shrink-0" />
                                        <h4 className="text-xs font-medium text-slate-900 dark:text-slate-200">Auto-Reject Calls</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-6">
                                        Tolak otomatis panggilan masuk ke nomor ini.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRejectCalls(!rejectCalls)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${rejectCalls ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${rejectCalls ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Danger Zone</span>
                        </div>
                        <Card className="p-4 border-rose-100 dark:border-rose-950/50 bg-rose-50/30 dark:bg-rose-950/10 shadow-none space-y-3">
                            <div>
                                <h4 className="text-xs font-medium text-rose-900 dark:text-rose-300">Disconnect Instance</h4>
                                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/70 mt-0.5 leading-relaxed">
                                    Menghapus sesi auth. Anda perlu scan ulang QR Code untuk menghubungkan kembali.
                                </p>
                            </div>
                            <Btn
                                variant="outline"
                                size="sm"
                                icon={LogOut}
                                onClick={() => deleteDevice?.(integration.id)}
                                className="w-full border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:text-rose-400 dark:hover:text-white transition-all text-xs justify-center"
                            >
                                Logout & Disconnect
                            </Btn>
                        </Card>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-end gap-2 shrink-0">
                    <Btn
                        variant="secondary"
                        size="sm"
                        onClick={close}
                        className="w-full sm:w-auto text-xs text-slate-600 dark:text-slate-400 justify-center"
                    >
                        Cancel
                    </Btn>
                    <Btn
                        variant="primary"
                        size="sm"
                        icon={Save}
                        onClick={() => updateConfig({
                            event: eventActive,
                            autoRead: autoRead,
                            rejectCalls: rejectCalls
                        })}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs justify-center"
                    >
                        Save Configuration
                    </Btn>
                </div>
            </motion.div>
        </div>
    );
}