"use client";

import { Check, CheckCircle, Copy, Key, PlugZap, Plus, SettingsIcon, Trash2, XCircle } from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Cards";
import { Badge } from "../../../components/Bagde";
import { Btn } from "../../../components/Button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import cn from "../../../components/ClassName";
import WhatsAppConfigDrawer from "@/app/components/WhatsappConfig";
import { WABaileysConnectModal } from "@/app/components/ConnectModal";
import useAxios from "@/lib/axios-service";
import { useParams } from "next/navigation";
import * as icons from "simple-icons";
import { ApiKeyDataResponse, CreateApiKeyResponse, CreateIntegration, Integrations, PlatformIntegration, StatusIntegration, WhatsappBayliesSetting } from "@/lib/types";
import axios from "axios";
import CreateApiKeyModal from "@/app/components/CreateApiKeyModal";




interface IntegrationState {
  id: PlatformIntegration;
  name: string;
  desc: string;
  status: StatusIntegration;
  available: boolean;
  icon: icons.SimpleIcon;
  category: string;
  setting: Record<string, any>;
}

function formatDateToIndonesian(
  isoString: string,
  withTime: boolean = true
): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta", // Sesuaikan dengan WIB (WITA: Asia/Makassar, WIT: Asia/Jayapura)
    ...(withTime && {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
}
export default function IntegrationsPage() {
  const { AxiosPrivate } = useAxios();
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const [integration, setIntegration] = useState<Integrations | null>(null);
  const [isLoadingQrcode, setIsLoadingQrcode] = useState(true);
  const [qrCodeString, setQrcodeString] = useState("");
  const [openModalApiKey, setOpenModalApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apikeys, setApikeys] = useState<ApiKeyDataResponse[]>([]);
  const [copiedKeyId, setCopiedKeyId] = useState("");
  const { workspace } = useParams();

  const [devices, setDevices] = useState<Integrations[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationState[]>([
    {
      id: "WHATSAPP_BAYLIES", name: "WhatsApp Baileys", desc: "Send and receive messages via WhatsApp API", status: "DISCONNECTED", available: false, icon: icons.siWhatsapp, category: "Messaging", setting: {
        event: [
          "messages.upsert",
          "messages.update",
          "presence.update"
        ],
        autoRead: false,
        rejectCalls: true,
      },
    },
    { id: "EMAIL", name: "Email (SMTP/IMAP)", desc: "Integrate your business email for unified inbox", status: "DISCONNECTED", icon: icons.siGmail, available: false, category: "Email", setting: {} },
  ]);

  const categories = ["All", ...Array.from(new Set(integrations.map(i => i.category)))];
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? integrations : integrations.filter(i => i.category === cat);


  const openConfigure = (integration: Integrations) => {
    setIntegrationId(integration.id);
    setIntegration(integration)
  }

  const getQrcodeWhatsapp = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspace}/integrations/whatsapp/qrcode`);
      const result = res.data;
      const data = result.data;
      setQrcodeString(data.code);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesalahan mohon coba lagi";
        toast.error(message);
      }
      console.error("Fetch error: ", err);
    }
  }
  const handleTestConnect = async (platform: PlatformIntegration) => {
    try {
      const integrationConnect = devices.find(c => c.platform === platform);
      if (integrationConnect) {
        const dataToSend = {
          type: "text",
          instanceName: integrationConnect.instanceName,
          target: "085183229055",
          message: "Testing"
        }
        const res = await AxiosPrivate.post(`/${workspace}/messages/sendMessage`, dataToSend);
        const data = res.data;
        toast.success("Pesan berhasil terkirim!");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesalahan mohon coba lagi";
        toast.error(message);
      }
      console.error("Fetch error: ", err);
    }
  }
  const openConnect = async (integration: Integrations) => {
    setIntegrationId(null);
    setIsLoadingQrcode(true);
    setIntegration(integration);
    console.log(integration);
    try {
      if (integration.platform === "WHATSAPP_BAYLIES") {
        await getQrcodeWhatsapp();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesalahan mohon coba lagi";
        toast.error(message);
      }
      console.error("Fetch error: ", err);
    } finally {
      setIsLoadingQrcode(false);
    }
  }

  const close = () => {
    setIntegration(null);
    setIntegrationId(null);
  }

  const createIntegration = async (intg: IntegrationState) => {
    try {
      const data: CreateIntegration = {
        email: "",
        name: intg.name,
        number: "",
        platform: intg.id,
        settings: {
          event: [
            "messages.upsert",
            "messages.update",
            "presence.update",
          ],
          rejectCalls: true,
          autoRead: true,
        } as WhatsappBayliesSetting,
      }
      const res = await AxiosPrivate.post(`${workspace}/integrations`, data);
      const result = res.data;
      console.log(result);
    } catch (err) {
      console.error("Fetch error: ", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesahalan mohon coba lagi";
        toast.error(message);
      }
    }
  }

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await AxiosPrivate.get(`${workspace}/integrations`);
      const data = res.data;
      const dataIntegration: Integrations[] = data.data;
      setIntegrations(prev =>
        prev.map(p => {
          const platformActive = dataIntegration.find(di => di.platform === p.id);
          if (platformActive) {
            return {
              ...p,            // Shallow copy agar React tahu ada perubahan objek
              available: true, // Ubah statusnya
              status: platformActive.status
            };
          }
          return {
            ...p,
            available: false,
          };
        })
      );
      console.log(dataIntegration);
      setDevices(dataIntegration);
      console.log(data);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const updateSettingConfig = async (setting: Record<string, any>) => {
    if (!integration) return;
    try {
      const res = await AxiosPrivate.patch(`/${workspace}/integrations/${integration.platform}`, {
        settings: setting
      });
      const result = res.data;
      console.log(result);
      toast.success(result.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesalahan mohon coba lagi.";
        toast.error(message);
      }
    }
  }

  const createSecretKey = async (data: { name: string }) => {
    try {
      const res = await AxiosPrivate.post(`/${workspace}/apikey`, data);
      const result = res.data;
      console.log(result);
      toast.success(result.message);
      return result as CreateApiKeyResponse;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesalahan mohon coba lagi.";
        throw new Error(message);
      }
      throw new Error("Terjadi kesalahan mohon coba lagi.");
    }
  }

  const fetchSecretKey = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspace}/apikey`);
      const result = res.data;
      console.log(result);
      setApikeys(result.data);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const handleCopySecretPrefix = (data: ApiKeyDataResponse) => {
    if (data.keyPrefix) {
      navigator.clipboard.writeText(data.keyPrefix);
      setCopiedKeyId(data.id);
      setTimeout(() => setCopiedKeyId(""), 2000);
    }
  };

  const handleDeleteSecretKey = async (data: ApiKeyDataResponse) => {
    if (!confirm(`Apakah anda yakin ingin menghapus api key ${data.name}?`)) return;
    try {
      const res = await AxiosPrivate.delete(`/${workspace}/apikey/${data.id}`);
      const result = res.data;
      console.log(result);
      setApikeys(prev => prev.filter(p => p.id !== data.id));
      toast.success(result.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Terjadi kesalahan mohon coba lagi.";
        toast.error(message);
      }
    }
  }

  useEffect(() => {
    fetchIntegrations();
    fetchSecretKey();
  }, [workspace])

  return (
    <div className="h-full overflow-auto p-6">
      <CreateApiKeyModal isOpen={openModalApiKey} onClose={() => setOpenModalApiKey(false)} onSubmit={createSecretKey} />
      <PageHeader title="Integrations" subtitle="Connect your favorite tools and automate workflows" />
      {integration && integration.status === "CONNECTED" && <WhatsAppConfigDrawer close={close} updateConfig={(setting) => updateSettingConfig(setting)} integration={integration} setting={integration.settings as WhatsappBayliesSetting} />}
      {integration && integration.platform === "WHATSAPP_BAYLIES" && integration.status !== "CONNECTED" && <WABaileysConnectModal onClose={close} qrCodeString={qrCodeString} isLoading={isLoadingQrcode} />}
      {/* Stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-sm">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">{integrations.filter(i => i.status === "CONNECTED").length} Connected</span>
        </div>
        <div className="flex items-center gap-2 bg-muted text-muted-foreground px-3 py-1.5 rounded-lg text-sm">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">{integrations.filter(i => i.status === "DISCONNECTED").length} Available</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", cat === c ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground")}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Connected Devices</h2>
            <p className="text-xs text-muted-foreground">Perangkat dan instance WhatsApp yang saat ini aktif di workspace Anda.</p>
          </div>

          {devices.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-sm text-muted-foreground">Belum ada device yang terhubung.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {devices.map(dev => (
                <Card key={dev.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <IconSVG platform={dev.platform} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {dev.name}
                        </h3>
                        <Badge variant={dev.status === "CONNECTED" ? "success" : "default"} className="flex-shrink-0">
                          {dev.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {dev.number ? `No: ${dev.number}` : dev.platform}
                      </p>
                      {dev.status !== "CONNECTED" ? <div className="flex items-center gap-2">
                        <Btn variant="primary" size="sm" onClick={() => openConnect(dev)} icon={PlugZap}>
                          Connect
                        </Btn>
                      </div> : <div className="flex items-center gap-2">
                        <Btn variant="secondary" onClick={() => openConfigure(dev)} size="sm" icon={SettingsIcon}>
                          Configure
                        </Btn>
                        <Btn variant="ghost" size="sm" onClick={() => handleTestConnect(dev.platform)}>
                          Test
                        </Btn>
                      </div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Available Integrations</h2>
            <p className="text-xs text-muted-foreground">Pilih integrasi atau platform yang ingin Anda tambahkan ke workspace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {integrations.map(intg => (
              <Card key={intg.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 shadow-sm group/btn">
                    {intg.icon && (
                      <svg
                        role="img"
                        viewBox="0 0 24 24"
                        className="w-6 h-6 transition-transform duration-300 group-hover/btn:scale-110"
                        fill={`#${intg.icon.hex}`}
                      >
                        <title>{intg.icon.title || intg.name}</title>
                        <path d={intg.icon.path} />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-foreground truncate">{intg.name}</h3>
                      <Badge className="flex-shrink-0 text-[10px]">
                        {intg.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{intg.desc}</p>
                    <div className="flex items-center gap-2">
                      <Btn variant="primary" size="sm" onClick={() => createIntegration(intg)} icon={PlugZap}>
                        Tambahkan Device
                      </Btn>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* API Keys Section */}
      <Card className="p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm">API Keys</h3>
            <p className="text-xs text-muted-foreground">Manage your API credentials</p>
          </div>
          <Btn variant="primary" size="sm" onClick={() => setOpenModalApiKey(true)} icon={Plus}>Generate Key</Btn>
        </div>
        <div className="space-y-3">
          {apikeys.map(k => (
            <div key={k.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              <Key className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{k.name}</span>
                </div>
                <code className="text-[11px] text-muted-foreground font-mono">{k.keyPrefix}</code>
              </div>
              <div className="text-[11px] text-muted-foreground hidden sm:block">Last used: {formatDateToIndonesian(k.lastUsedAt || new Date().toISOString())}</div>
              <div className="flex gap-1">
                <button onClick={() => handleCopySecretPrefix(k)} className="w-7 h-7 rounded flex items-center justify-center hover:bg-background text-muted-foreground transition-colors">
                  {copiedKeyId === k.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button onClick={() => handleDeleteSecretKey(k)} className="w-7 h-7 rounded flex items-center justify-center hover:bg-background text-muted-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function IconSVG({ platform }: { platform: PlatformIntegration }) {
  const icon = platform === "WHATSAPP_BAYLIES" ? icons.siWhatsapp : icons.siGmail;
  return (<div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 shadow-sm group/btn">
    {icon && (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className="w-6 h-6 transition-transform duration-300 group-hover/btn:scale-110"
        fill={`#${icon.hex}`}
      >
        <title>{icon.title || ""}</title>
        <path d={icon.path} />
      </svg>
    )}
  </div>)
}
