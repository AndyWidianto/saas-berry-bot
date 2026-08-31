"use client";

import { Check, CheckCircle, CheckCircle2, Copy, Key, PlugZap, Plus, RefreshCw, Search, SettingsIcon, Trash2, XCircle } from "lucide-react";
import { PageHeader } from "../../../components/PageHeader";
import { Card } from "../../../components/Cards";
import { Badge } from "../../../components/Bagde";
import { Btn } from "../../../components/Button";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import cn from "../../../components/ClassName";
import WhatsAppConfigDrawer from "@/app/components/WhatsappConfig";
import { WABaileysConnectModal } from "@/app/components/ConnectModal";
import useAxios from "@/lib/axios-service";
import { useParams, useRouter } from "next/navigation";
import * as icons from "simple-icons";
import { ApiKeyDataResponse, CreateApiKeyResponse, CreateIntegration, Integrations, PlatformIntegration, StatusIntegration, WhatsappBayliesSetting } from "@/lib/types";
import axios from "axios";
import CreateApiKeyModal from "@/app/components/CreateApiKeyModal";
import { IntegrationCardSkeleton } from "@/app/components/Skeletons";
import { useSocket } from "@/lib/context/SocketContext";
import TelegramConfig from "@/app/components/TelegramConfig";
import { baseUrlMessageGateway } from "@/lib/shared/shared";




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
  const { socket, isConnected } = useSocket();
  const params = useParams();
  const workspace = params?.workspace as string;

  // States
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const [integration, setIntegration] = useState<Integrations | null>(null);
  const [isLoadingQrcode, setIsLoadingQrcode] = useState(true);
  const [qrCodeString, setQrcodeString] = useState("");
  const [openModalApiKey, setOpenModalApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apikeys, setApikeys] = useState<ApiKeyDataResponse[]>([]);
  const [copiedKeyId, setCopiedKeyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [isConfigOpens, setIsConfigOpens] = useState({
    whatsappNonOfficial: false,
    telegram: false,
    email: false,
  })

  const router = useRouter();

  const [devices, setDevices] = useState<Integrations[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationState[]>([
    {
      id: "WHATSAPP_BAYLIES",
      name: "WhatsApp (Unofficial)",
      desc: "Send and receive messages via WhatsApp (Unofficial) integration.",
      status: "DISCONNECTED",
      available: false,
      icon: icons.siWhatsapp,
      category: "Messaging",
      setting: {
        event: ["messages.upsert", "messages.update", "presence.update"],
        autoRead: false,
        rejectCalls: true,
      },
    },
    // {
    //   id: "TELEGRAM",
    //   name: "Telegram",
    //   desc: "Send and receive messages via bot API with Telegram integration.",
    //   status: "DISCONNECTED",
    //   available: false,
    //   icon: icons.siTelegram,
    //   category: "Messaging",
    //   setting: {
    //     botToken: "",
    //     secretToken: "",
    //     webhookUrl: `${baseUrlMessageGateway}`
    //   },
    // },
    // {
    //   id: "EMAIL",
    //   name: "Email (SMTP/IMAP)",
    //   desc: "Integrate your business email for unified inbox and automated responses.",
    //   status: "DISCONNECTED",
    //   icon: icons.siGmail,
    //   available: false,
    //   category: "Email",
    //   setting: {},
    // },
  ]);

  // Dynamic Categories
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(integrations.map((i) => i.category)))];
  }, [integrations]);

  // Filtered Available Integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchesCategory = cat === "All" || item.category === cat;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [integrations, cat, searchQuery]);

  // Handlers
  const openConfigure = (dev: Integrations) => {
    setIntegrationId(dev.id);
    setIntegration(dev);
    setIsConfigOpens(prev => ({
      ...prev,
      ...(dev.platform === "TELEGRAM" ? {
        telegram: true
      } : dev.platform === "WHATSAPP_BAYLIES" ? {
        whatsappNonOfficial: true,
      } : dev.platform === "EMAIL" ? {
        email: true,
      } : {})
    }))
  };

  const getQrcodeWhatsapp = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspace}/integrations/whatsapp/qrcode`);
      const data = res.data?.data;
      setQrcodeString(data?.code || "");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal mengambil QR Code.");
      }
      console.error("Fetch QR error: ", err);
    }
  };

  const handleTestConnect = async (platform: PlatformIntegration) => {
    try {
      const integrationConnect = devices.find((c) => c.platform === platform);
      if (integrationConnect) {
        const dataToSend = {
          type: "text",
          instanceName: integrationConnect.instanceName,
          target: "085183229055",
          message: "Testing Integration Connection",
        };
        await AxiosPrivate.post(`/${workspace}/messages/sendMessage`, dataToSend);
        toast.success("Pesan uji coba berhasil terkirim!");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal menguji koneksi.");
      }
    }
  };

  const openConnect = async (dev: Integrations) => {
    setIntegrationId(null);
    setIsLoadingQrcode(true);
    setIntegration(dev);
    console.log(dev);

    try {
      if (dev.platform === "WHATSAPP_BAYLIES") {
        setIsConfigOpens(prev => ({
          ...prev,
          whatsappNonOfficial: true
        }))
        await getQrcodeWhatsapp();
      }
      if (dev.platform === "TELEGRAM") {
        setIsConfigOpens(prev => ({
          ...prev,
          telegram: true
        }))
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Terjadi kesalahan.");
      }
    } finally {
      setIsLoadingQrcode(false);
    }
  };

  const close = () => {
    setIntegration(null);
    setIntegrationId(null);
    setIsConfigOpens({
      email: false,
      whatsappNonOfficial: false,
      telegram: false
    })
  };

  const createIntegration = async (intg: IntegrationState) => {
    try {
      const data: CreateIntegration = {
        email: "",
        name: intg.name,
        number: "",
        platform: intg.id,
        settings: intg.setting,
      };
      if (intg.id === "WHATSAPP_BAYLIES") {
        data.settings = {
          event: ["messages.upsert", "messages.update", "presence.update"],
          rejectCalls: true,
          autoRead: true,
        } as WhatsappBayliesSetting
      }
      const dataTemporary: Integrations = {
        ...data,
        id: "temporary",
        status: "CONNECTING",
        instanceName: "",
        workspaceId: workspace,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setDevices(prev => [...prev, dataTemporary])
      const res = await AxiosPrivate.post(`${workspace}/integrations`, data);
      toast.success("Integrasi berhasil ditambahkan!");
      fetchIntegrations();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal membuat integrasi.");
      }
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm("Apakah anda yakin ingin menghapus koneksi ini?")) return;
    try {
      await AxiosPrivate.delete(`${workspace}/integrations/whatsapp/unofficial/${id}`);
      toast.success("Integrasi berhasil dihapus!");
      setDevices(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal mmenghapus Integrasi.");
      }
      console.error("Fetch error: ", err);
    }
  };

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await AxiosPrivate.get(`${workspace}/integrations`);
      const dataIntegration: Integrations[] = res.data?.data || [];

      setIntegrations((prev) =>
        prev.map((p) => {
          const platformActive = dataIntegration.find((di) => di.platform === p.id);
          return {
            ...p,
            available: !!platformActive,
            status: platformActive ? platformActive.status : "DISCONNECTED",
          };
        })
      );
      setDevices(dataIntegration);
    } catch (err) {
      console.error("Fetch integrations error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettingConfig = async (setting: Record<string, any>) => {
    if (!integration) return;
    try {
      const res = await AxiosPrivate.patch(`/${workspace}/integrations/${integration.platform}`, {
        settings: setting,
      });
      toast.success(res.data?.message || "Konfigurasi diperbarui.");
      fetchIntegrations();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal memperbarui konfigurasi.");
      }
    }
  };

  const createSecretKey = async (data: { name: string }) => {
    try {
      const res = await AxiosPrivate.post(`/${workspace}/apikey`, data);
      toast.success(res.data?.message || "API Key dibuat!");
      fetchSecretKey();
      return res.data as CreateApiKeyResponse;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.message || "Gagal membuat API Key.");
      }
      throw new Error("Terjadi kesalahan.");
    }
  };

  const fetchSecretKey = async () => {
    try {
      const res = await AxiosPrivate.get(`/${workspace}/apikey`);
      setApikeys(res.data?.data || []);
    } catch (err) {
      console.error("Fetch API key error: ", err);
    }
  };

  const handleCopySecretPrefix = (data: ApiKeyDataResponse) => {
    if (data.keyPrefix) {
      navigator.clipboard.writeText(data.keyPrefix);
      setCopiedKeyId(data.id);
      toast.success("API Key Prefix tersalin!");
      setTimeout(() => setCopiedKeyId(""), 2000);
    }
  };

  const handleDeleteSecretKey = async (data: ApiKeyDataResponse) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus API key "${data.name}"?`)) return;
    try {
      const res = await AxiosPrivate.delete(`/${workspace}/apikey/${data.id}`);
      setApikeys((prev) => prev.filter((p) => p.id !== data.id));
      toast.success(res.data?.message || "API Key dihapus.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal menghapus API key.");
      }
    }
  };

  const handleSubmitTelegram = async (data: any) => {

  }

  useEffect(() => {
    if (workspace) {
      fetchIntegrations();
      fetchSecretKey();
    }
  }, [workspace]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: { instanceName: string; status: StatusIntegration }) => {
      // Update list devices
      setDevices(prev =>
        prev.map(device =>
          device.instanceName === data.instanceName
            ? { ...device, status: data.status }
            : device
        )
      );

      if (data.instanceName === integration?.instanceName) {
        close();
      }
    };

    socket.on("integration.update", handleUpdate);

    return () => {
      socket.off("integration.update", handleUpdate);
    };
  }, [socket, integration]);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Modals & Drawers */}
      {integration && integration.status === "CONNECTED" && (
        <WhatsAppConfigDrawer
          close={close}
          updateConfig={updateSettingConfig}
          integration={integration}
          setting={integration.settings as WhatsappBayliesSetting}
          deleteDevice={deleteIntegration}
        />
      )}
      <CreateApiKeyModal
        isOpen={openModalApiKey}
        onClose={() => setOpenModalApiKey(false)}
        onSubmit={createSecretKey}
      />
      <WABaileysConnectModal
        isOpen={isConfigOpens.whatsappNonOfficial}
        onClose={close}
        qrCodeString={qrCodeString}
        isLoading={isLoadingQrcode}
      />
      {/* {integration && <TelegramConfig
        isOpen={isConfigOpens.telegram}
        onClose={() => close()}
        device={integration}
        onSubmit={handleSubmitTelegram}
      />} */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Integrations"
          subtitle="Hubungkan perangkat, platform perpesanan, dan kelola API Key workspace Anda."
        />
        <Btn
          variant="outline"
          size="sm"
          onClick={() => {
            fetchIntegrations();
            fetchSecretKey();
          }}
          className="self-start sm:self-auto gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Btn>
      </div>

      {/* Stats Bar & Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>{devices.filter((i) => i.status === "CONNECTED").length} Terhubung</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/60 text-muted-foreground px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border/40">
            <XCircle className="w-4 h-4" />
            <span>{integrations.length} Tersedia</span>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {categories.map((c: any) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                cat === c
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Connected Devices */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            Connected Devices
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              {devices.length}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground">
            Perangkat dan instance aktif yang terhubung dengan workspace Anda.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
              <IntegrationCardSkeleton key={i} />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <Card className="p-8 text-center border-dashed bg-muted/20 rounded-2xl">
            <p className="text-sm text-muted-foreground">Belum ada device yang terhubung.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {devices.map((dev) => (
              <Card
                key={dev.id}
                className="p-5 hover:shadow-md transition-all border-border/80 rounded-2xl flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-muted/60 rounded-xl border border-border/40">
                    <IconSVG platform={dev.platform} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {dev.platform === "WHATSAPP_BAYLIES"
                          ? "WhatsApp (Unofficial)"
                          : dev.name}
                      </h3>
                      <Badge
                        variant={dev.status === "CONNECTED" ? "default" : "secondary"}
                        className={cn(
                          "capitalize text-[10px]",
                          dev.status === "CONNECTED" &&
                          "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                        )}
                      >
                        {dev.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate mb-4">
                      {dev.number
                        ? `No: ${dev.number}`
                        : dev.platform === "WHATSAPP_BAYLIES"
                          ? "Instance Ready"
                          : dev.platform}
                    </p>
                  </div>
                </div>

                <div aria-disabled={dev.id.includes("temporary")} className="flex items-center gap-2 pt-3 border-t border-border/40">
                  {dev.status !== "CONNECTED" ? (
                    <Btn
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 rounded-xl"
                      onClick={() => openConnect(dev)}
                    >
                      <PlugZap className="w-3.5 h-3.5" />
                      Hubungkan
                    </Btn>
                  ) : (
                    dev.platform === "WHATSAPP_BAYLIES" ? <>
                      <Btn
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 rounded-xl"
                        onClick={() => openConfigure(dev)}
                      >
                        <SettingsIcon className="w-3.5 h-3.5" />
                        Konfigurasi
                      </Btn>
                      <Btn
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleTestConnect(dev.platform)}
                      >
                        Tes Pesan
                      </Btn>
                    </> : <Btn
                      variant="ghost"
                      size="sm"
                      className="w-full gap-2 rounded-xl"
                      onClick={() => openConnect(dev)}
                    ></Btn>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Available Integrations */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Available Integrations</h2>
            <p className="text-xs text-muted-foreground">
              Pilih integrasi atau platform yang ingin Anda aktifkan.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Cari integrasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-card"
            />
          </div>
        </div>

        {filteredIntegrations.length === 0 ? (
          <Card className="p-8 text-center border-dashed bg-muted/20 rounded-2xl">
            <p className="text-sm text-muted-foreground">Integrasi tidak ditemukan.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredIntegrations.map((intg) => {
              const platforms = devices.map(d => d.platform);
              const isReady = platforms.includes(intg.id);
              if (isReady) return null
              return (
                <Card
                  key={intg.id}
                  className="p-5 hover:shadow-md transition-all border-border/80 rounded-2xl flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-background border border-border/60 shadow-sm">
                      {intg.icon && (
                        <svg
                          role="img"
                          viewBox="0 0 24 24"
                          className="w-6 h-6 transition-transform duration-300 hover:scale-110"
                          fill={`#${intg.icon.hex}`}
                        >
                          <title>{intg.icon.title || intg.name}</title>
                          <path d={intg.icon.path} />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {intg.name}
                        </h3>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {intg.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {intg.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40">
                    <Btn
                      variant="secondary"
                      size="sm"
                      className="w-full gap-2 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
                      onClick={() => createIntegration(intg)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Device
                    </Btn>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Section 3: API Keys */}
      <Card className="p-6 rounded-2xl border-border/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              API Keys
            </h3>
            <p className="text-xs text-muted-foreground">
              Kelola kredensial API untuk mengintegrasikan layanan eksternal ke workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <Btn
              variant="secondary"
              size="sm"
              onClick={() => router.push("/docs")}
              className="gap-2 rounded-xl self-start sm:self-auto"
            >
              Docs
            </Btn>
            <Btn
              variant="primary"
              size="sm"
              onClick={() => setOpenModalApiKey(true)}
              className="gap-2 rounded-xl self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Key
            </Btn>
          </div>
        </div>

        {apikeys.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Belum ada API Key yang dibuat.
          </div>
        ) : (
          <div className="space-y-2.5">
            {apikeys.map((k) => {
              const isExpired = k.expiresAt ? new Date(k.expiresAt) < new Date() : false;
              return (
                <div
                  key={k.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/40 border border-border/50 rounded-xl transition-all hover:bg-muted/70 ${isExpired ? 'opacity-60 bg-destructive/5 border-destructive/20' : ''
                    }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-background rounded-lg border border-border/60 shrink-0 mt-0.5 sm:mt-0">
                      <Key className={`w-4 h-4 ${isExpired ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate">
                          {k.name}
                        </span>
                        {isExpired ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            Expired
                          </span>
                        ) : k.expiresAt ? (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            • Exp: {formatDateToIndonesian(k.expiresAt)}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-[11px] text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded border border-border/60">
                          {k.keyPrefix}••••••••
                        </code>
                      </div>

                      {/* List Permissions / Tags */}
                      {k.permissions && k.permissions.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          {k.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sisi Kanan: Metadata Waktu & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="text-left sm:text-right text-[11px] text-muted-foreground">
                      <div>
                        {k.lastUsedAt ? (
                          <span>Terakhir dipakai: {formatDateToIndonesian(k.lastUsedAt)}</span>
                        ) : (
                          <span className="italic text-muted-foreground/60">Belum pernah digunakan</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground/50">
                        Dibuat: {formatDateToIndonesian(k.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border-l border-border/60 pl-2">
                      <button
                        onClick={() => handleCopySecretPrefix(k)}
                        className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                        title="Salin Prefix"
                      >
                        {copiedKeyId === k.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteSecretKey(k)}
                        className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-destructive transition-colors"
                        title="Hapus Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function IconSVG({ platform }: { platform: PlatformIntegration }) {
  let icon = icons.siWhatsapp;
  switch (platform) {
    case "TELEGRAM":
      icon = icons.siTelegram;
      break;
    case "WHATSAPP_BAYLIES":
      icon = icons.siWhatsapp;
      break;
    case "EMAIL":
      icon = icons.siGmail;
      break;
  }
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
