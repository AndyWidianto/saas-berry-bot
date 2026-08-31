import React, { useState } from 'react';
import {
  Send,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Key,
  Globe,
  ShieldAlert,
  ArrowUpRight,
  MessageSquare,
  Cpu,
  Server,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Btn } from './Button';
import { Card } from './Cards';
import { Badge } from './Bagde';
import { Integrations } from '@/lib/types';
import { baseUrlMessageGateway } from '@/lib/shared/shared';


interface TelegramIntegrationModalProps {
  isOpen: boolean;
  device: Integrations | null;
  onClose: () => void;
  onSubmit: ({ secretToken, botToken }: { secretToken: string, botToken: string }) => Promise<void>;
}

export default function TelegramIntegrationModal({ isOpen, onClose, onSubmit, device }: TelegramIntegrationModalProps) {
  const [botToken, setBotToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(`${device?.settings?.webhookUrl ?? baseUrlMessageGateway}/telegram/${device?.instanceName}`);
  const [secretToken, setSecretToken] = useState('');
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const steps = [
    // {
    //   step: '01',
    //   title: 'Terima Webhook (IN)',
    //   icon: MessageSquare,
    //   desc: 'Telegram mengirim HTTP POST ke server Anda berisi pesan user. Server Anda membalas status 200 OK.',
    // },
    // {
    //   step: '02',
    //   title: 'Proses Logika',
    //   icon: Cpu,
    //   desc: 'Server Anda mengolah data (query DB, panggil AI, atau eksekusi fungsi bisnis) secara terpisah.',
    // },
    // {
    //   step: '03',
    //   title: 'Kirim Balasan (OUT)',
    //   icon: Server,
    //   desc: 'Server Anda melakukan HTTP POST ke api.telegram.org/bot<token>/sendMessage untuk membalas.',
    // },
  ];

  const handleTestConnection = () => {
    setStatus('testing');
    setTimeout(() => {
      if (botToken.length > 10) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    }, 1200);
  };

  const handleOnSubmit = async () => {
    await onSubmit({ secretToken, botToken });
  }

  const handleCopyWebhook = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin URL:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Card */}
      <Card className="relative w-full max-w-2xl bg-background border border-border shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Integrasi Telegram (Async Pattern)</h2>
              <p className="text-xs text-muted-foreground">Konfigurasi penerimaan webhook & pengiriman pesan terpisah</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6">

          {/* Status Indicator Bar */}
          <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border border-border/50">
            <span className="text-xs font-medium text-muted-foreground">Status Koneksi API:</span>
            <div>
              {status === 'connected' && (
                <Badge variant="success" className="text-[10px] px-2.5 py-1 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                </Badge>
              )}
              {status === 'disconnected' && (
                <Badge variant="destructive" className="text-[10px] px-2.5 py-1 flex items-center gap-1.5 bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  <XCircle className="w-3.5 h-3.5" /> Belum Terhubung
                </Badge>
              )}
              {status === 'testing' && (
                <Badge variant="outline" className="text-[10px] px-2.5 py-1 flex items-center gap-1.5 border-primary/30 text-primary">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Memeriksa...
                </Badge>
              )}
            </div>
          </div>

          {/* Visual Workflow Steps */}
          {/* <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Alur Kerja Interaksi Pesan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((s, index) => {
                const Icon = s.icon;
                return (
                  <div 
                    key={s.step} 
                    className="relative p-3.5 bg-muted/20 border border-border/60 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                          {s.step}
                        </span>
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <h4 className="text-xs font-semibold text-foreground mb-1">{s.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/40">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div> */}

          {/* Form Configuration */}
          <div className="space-y-4">
            {/* Bot Token Input */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Bot Token <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Token unik dari <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">@BotFather</a> untuk autentikasi API pengiriman.
              </p>
            </div>

            {/* Webhook Target URL Input + Copy Action */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Webhook Endpoint URL (Penerima Pesan Masuk)
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.domainanda.com/v1/telegram/webhook"
                  className="w-full pl-9 pr-24 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="absolute right-1.5 px-2.5 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                URL HTTPS milik server Anda yang bertugas menerima payload dari Telegram. Salin URL ini ke Telegram Bot configuration Anda.
              </p>
            </div>

            {/* Secret Token Input */}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Secret Token (Header Verification)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={secretToken}
                  onChange={(e) => setSecretToken(e.target.value)}
                  placeholder="X-Telegram-Bot-Api-Secret-Token"
                  className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 p-4 border-t border-border bg-muted/20">
          <Btn
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            disabled={!botToken || status === 'testing'}
            className="w-full sm:w-auto justify-center text-xs"
          >
            {status === 'testing' ? 'Memeriksa...' : 'Uji Koneksi'}
          </Btn>

          <Btn
            variant="primary"
            size="sm"
            icon={ArrowUpRight}
            onClick={handleOnSubmit}
            className="w-full sm:w-auto justify-center text-xs"
          >
            Simpan & Aktifkan Webhook
          </Btn>
        </div>

      </Card>
    </div>
  );
}