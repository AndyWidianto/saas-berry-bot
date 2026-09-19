import React, { useRef, useState } from 'react';
import {
  Key,
  Users,
  QrCode,
  Building2,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  Info,
  Upload,
  Truck,
  Loader2
} from 'lucide-react';
import { BankItem, CustomerFieldItem, DeliveryMode, SettingItem, Workspace } from '@/lib/types';
import { useWorkspaceStore } from '@/lib/store/workspaceStore';
import axios from 'axios';
import useAxios from '@/lib/axios-service';
import { toast } from 'sonner';
import { ResponseUpload } from '@/lib/types/workspace';


export default function DynamicSettings({ workspaceId }: { workspaceId: string }) {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const { AxiosPrivate } = useAxios();
  // State 1: Key-Value Settings
  const [settings, setSettings] = useState<SettingItem[]>([
    { id: 1, key: 'API_BASE_URL', value: 'https://api.toko.com/v1', isSecret: false },
    { id: 2, key: 'RAJAONGKIR_API_KEY', value: '8a9b7c6d5e4f3a2b1c', isSecret: true },
    { id: 3, key: 'MAX_ORDER_LIMIT', value: '50', isSecret: false },
  ]);

  // State 2: Custom Customer Fields
  const [customerFields, setCustomerFields] = useState<CustomerFieldItem[]>(workspace?.productSettings?.fields ?? []);

  // State 3: Payment Settings (QRIS & Bank)
  const [qrisImageUrl, setQrisImageUrl] = useState(workspace?.productSettings?.paymentMethod?.qris?.imageUrl ?? "");
  const [qrisName, setQrisName] = useState(workspace?.productSettings?.paymentMethod?.qris?.name ?? "");
  const [qrisFilename, setQrisFileName] = useState(workspace?.productSettings?.paymentMethod?.qris?.filename ?? "");
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [bankList, setBankList] = useState<BankItem[]>(workspace?.productSettings?.paymentMethod.bankItems ?? []);

  const [isSaved, setIsSaved] = useState(false);

  const [shippingMode, setShippingMode] = useState<'rajaongkir' | 'manual'>(workspace?.productSettings?.deliveryMethod?.mode === "RAJAONGKIR" ? "rajaongkir" : "manual");

  // State RajaOngkir
  const [rajaOngkirKey, setRajaOngkirKey] = useState('');
  const [showRajaOngkirKey, setShowRajaOngkirKey] = useState(false);
  const [originCity, setOriginCity] = useState('');

  // State Manual Rate
  const [manualType, setManualType] = useState<'flat' | 'district'>(workspace?.productSettings?.deliveryMethod?.mode === "MANUAL_CALCULATE_LATER" ? "flat" : "district");
  const [flatRate, setFlatRate] = useState(workspace?.productSettings?.deliveryMethod?.manualConfig?.flatRateAmount.toString() || '');


  const uploadFileRef = useRef<HTMLInputElement | null>(null);

  // --- Handlers: Customer Fields ---
  const handleAddCustomerField = () => {
    setCustomerFields([
      ...customerFields,
      { id: Date.now(), label: '', name: 'Custom', required: false }
    ]);
  };

  const handleRemoveCustomerField = (id: number) => {
    setCustomerFields(customerFields.filter(item => item.id !== id));
  };

  const handleCustomerFieldChange = (
    id: number,
    field: keyof CustomerFieldItem,
    value: string | boolean
  ) => {
    setCustomerFields(customerFields.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // --- Handlers: Payment Banks ---
  const handleAddBank = () => {
    setBankList([
      ...bankList,
      { id: Date.now(), bankName: '', accountNumber: '', accountHolder: '' }
    ]);
  };

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  }

  const handleRemoveBank = (id: number) => {
    setBankList(bankList.filter(b => b.id !== id));
  };

  const handleBankChange = (id: number, field: keyof BankItem, value: string) => {
    setBankList(bankList.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // --- Handler Global: Reset & Save ---
  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mengembalikan ke pengaturan awal?")) {
      setSettings([
        { id: 1, key: 'API_BASE_URL', value: 'https://api.toko.com/v1', isSecret: false },
        { id: 2, key: 'RAJAONGKIR_API_KEY', value: '8a9b7c6d5e4f3a2b1c', isSecret: true },
        { id: 3, key: 'MAX_ORDER_LIMIT', value: '50', isSecret: false },
      ]);
      setCustomerFields([
        { id: 1, label: 'Nama Pelanggan', name: "name", required: true },
        { id: 2, label: 'Nomor WhatsApp', name: "phone", required: true },
        { id: 3, label: 'Alamat Pengiriman', name: "address", required: true },
      ]);
      setQrisImageUrl('');
      setQrisName('');
      setBankList([]);
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) return;
    setLoadingUpload(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await AxiosPrivate.post(`/workspaces/${workspaceId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const result = res.data as ResponseUpload;
      console.log(result);
      setQrisImageUrl(result.url);
      setQrisFileName(result.thumbnail);
    } catch (err) {
      console.error("Fetch error: ", err);
      throw err;
    } finally {
      setLoadingUpload(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const modeDelivery = shippingMode === "manual" ? manualType === "district" ? "MANUAL_FLAT" : "MANUAL_CALCULATE_LATER" : "RAJAONGKIR";
      const res = await AxiosPrivate.patch(`/workspaces/${workspaceId}`, {
        isProductActive: true,
        productSettings: {
          fields: customerFields,
          paymentMethod: {
            qris: {
              name: qrisName,
              imageUrl: qrisImageUrl,
              filename: qrisFilename,
            },
            bankItems: bankList,
          },
          deliveryMethod: {
            mode: modeDelivery,
            ...(modeDelivery === "MANUAL_CALCULATE_LATER" && {
              manualConfig: {
                flatRateAmount: Number(flatRate),
                notes: ""
              }
            }),
            ...(modeDelivery === "RAJAONGKIR" && {
              rajaOngkirConfig: {
                apiKey: rajaOngkirKey,
                originCityName: originCity,
                originAreaId: originCity,
              }
            })
          }
        },
      } as Partial<Workspace>,);
      const result = res.data;
      setWorkspace(result.data);
    } catch (err) {
      console.error("Fetch error: ", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message ?? "Gagal mengaktifkan fitur product";
        toast.error(message);
      }
    } finally {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };




  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Header Setting */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pengaturan Workspace</h1>
              <p className="text-sm text-gray-500">Kelola form pelanggan, pembayaran QRIS/Bank, dan variabel konfigurasi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset ke Awal"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">

          {/* SECTION 1: CUSTOM CUSTOMER FIELDS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-800">Field Pengisian Informasi Pelanggan</h2>
              </div>
              <button
                type="button"
                onClick={handleAddCustomerField}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Field Pelanggan
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Tentukan field informasi apa saja yang harus diisi oleh pelanggan saat membuat orderan.
            </p>

            <div className="space-y-3">
              {customerFields.map((field) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
                >
                  {/* Select Icon */}
                  <div className="shrink-0">
                    <input
                      type="text"
                      placeholder="Label Field (misal: Nomor Meja)"
                      value={field.name}
                      onChange={(e) => handleCustomerFieldChange(field.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Input Label Field */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Label Field (misal: Nomor Meja)"
                      value={field.label}
                      onChange={(e) => handleCustomerFieldChange(field.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Checkbox Required & Delete */}
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleCustomerFieldChange(field.id, 'required', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Wajib Diisi
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveCustomerField(field.id)}
                      className="p-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                      title="Hapus Field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 2: METODE PEMBAYARAN MANUAL (QRIS & BANK TRANSFER) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-800">Metode Pembayaran QRIS & Transfer Bank</h2>
            </div>

            {/* QRIS Config */}
            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4 mb-6">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">QR Code QRIS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama NMID / Merchant</label>
                  <input
                    type="text"
                    placeholder="Contoh: TOKO BUDI SANTOSO"
                    value={qrisName}
                    onChange={(e) => setQrisName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">URL Gambar QRIS</label>
                  <div className="flex gap-2">
                    <input type="file" name="upload file" ref={uploadFileRef} id="" accept='image/*' onChange={handleChangeFile} hidden />
                    <input
                      type="text"
                      placeholder="https://.../qris.png"
                      value={qrisImageUrl}
                      onChange={(e) => setQrisImageUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
                      onClick={() => uploadFileRef.current?.click()}
                    >
                      {loadingUpload ? <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Loading
                      </> : <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </>}
                    </button>
                  </div>
                </div>
              </div>

              {qrisImageUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 w-fit">
                  <img
                    src={qrisImageUrl}
                    alt="Preview QRIS"
                    className="w-12 h-12 object-cover rounded-md border"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{qrisName || "Nama Merchant"}</p>
                    <p className="text-[11px] text-green-600 font-medium">✓ Siap ditampilkan ke pembeli</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer Config */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Rekening Bank</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddBank}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Bank
                </button>
              </div>

              {bankList.map((bank) => (
                <div
                  key={bank.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-100 items-center"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Bank (BCA/Mandiri)"
                      value={bank.bankName}
                      onChange={(e) => handleBankChange(bank.id, 'bankName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold uppercase text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Nomor Rekening"
                      value={bank.accountNumber}
                      onChange={(e) => handleBankChange(bank.id, 'accountNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Atas Nama"
                      value={bank.accountHolder}
                      onChange={(e) => handleBankChange(bank.id, 'accountHolder', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveBank(bank.id)}
                      className="p-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 1: PILIHAN METODE PENGIRIMAN */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-800">Metode Pengiriman (Ongkir)</h2>
            </div>

            {/* Radio Cards Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: RajaOngkir */}
              {/* <label
                onClick={() => setShippingMode('rajaongkir')}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMode === 'rajaongkir'
                  ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="shippingMode"
                  value="rajaongkir"
                  checked={shippingMode === 'rajaongkir'}
                  onChange={() => setShippingMode('rajaongkir')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">Otomatis via RajaOngkir</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Kalkulasi otomatis berdasarkan berat produk & lokasi kurir ekspedisi.
                  </p>
                </div>
              </label> */}

              {/* Option B: Manual */}
              <label
                onClick={() => setShippingMode('manual')}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMode === 'manual'
                  ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  name="shippingMode"
                  value="manual"
                  checked={shippingMode === 'manual'}
                  onChange={() => setShippingMode('manual')}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">Tarif Manual / Flat Rate</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Tentukan ongkir tetap (flat rate) atau dihitung manual oleh penjual.
                  </p>
                </div>
              </label>
            </div>

            {/* CONFIG DYNAMIC DARI METODE TERPILIH */}
            {shippingMode === 'manual' ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 mt-4">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Konfigurasi Tarif Manual</h3>

                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="manualType"
                      checked={manualType === 'flat'}
                      onChange={() => setManualType('flat')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Flat Rate (Sama Rata)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="manualType"
                      checked={manualType === 'district'}
                      onChange={() => setManualType('district')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Dikonfirmasi Manual oleh Penjual
                  </label>
                </div>

                {manualType === 'flat' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Biaya Ongkir Flat (Rp)</label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-semibold">Rp</span>
                      <input
                        type="number"
                        placeholder="10000"
                        value={flatRate}
                        onChange={(e) => setFlatRate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 bg-amber-50 p-2.5 border border-amber-200 rounded-lg">
                    📌 Ongkir akan diset `Rp 0` saat checkout. Penjual wajib menentukan biaya ongkir secara manual setelah orderan masuk.
                  </p>
                )}
              </div>
            ) : (
              <></>
              // <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 mt-4">
              //   <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Konfigurasi RajaOngkir</h3>
              //   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              //     <div>
              //       <label className="block text-xs font-semibold text-gray-700 mb-1">RajaOngkir API Key</label>
              //       <div className="relative flex items-center">
              //         <input
              //           type={showRajaOngkirKey ? "text" : "password"}
              //           placeholder="Masukkan API Key RajaOngkir"
              //           value={rajaOngkirKey}
              //           onChange={(e) => setRajaOngkirKey(e.target.value)}
              //           className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              //         />
              //         <button
              //           type="button"
              //           onClick={() => setShowRajaOngkirKey(!showRajaOngkirKey)}
              //           className="absolute right-2.5 text-gray-400 hover:text-gray-600"
              //         >
              //           {showRajaOngkirKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              //         </button>
              //       </div>
              //     </div>

              //     <div>
              //       <label className="block text-xs font-semibold text-gray-700 mb-1">Kota / Kecamatan Asal (Origin)</label>
              //       <div className="relative">
              //         <input
              //           type="text"
              //           placeholder="ID Kota / Nama Kota Asal Toko"
              //           value={originCity}
              //           onChange={(e) => setOriginCity(e.target.value)}
              //           className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              //         />
              //       </div>
              //     </div>
              //   </div>
              // </div>
            )}
          </div>

          {/* SECTION 2: CUSTOM KEY & VALUE (Eksisting) */}
          {/* <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-800">Custom Key & Value</h2>
              </div>
              <button
                type="button"
                onClick={handleAddSetting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Key
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Gunakan <ShieldCheck className="w-3.5 h-3.5 inline text-blue-600" /> <b>Sensitif/Secret</b> untuk menyembunyikan token, password, atau API key dari tampilan biasa.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {settings.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-sm">Belum ada variabel tersimpan.</p>
                </div>
              ) : (
                settings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="KEY_NAME"
                        value={item.key}
                        onChange={(e) => handleSettingChange(item.id, 'key', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <span className="hidden sm:inline text-gray-400 font-bold">=</span>

                    <div className="flex-1 relative flex items-center">
                      <input
                        type={item.isSecret && !showSecrets[item.id] ? "password" : "text"}
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => handleSettingChange(item.id, 'value', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {item.isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(item.id)}
                          className="absolute right-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1 shrink-0 mt-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => handleSettingChange(item.id, 'isSecret', !item.isSecret)}
                        className={`p-2 rounded-lg border text-xs transition-colors ${item.isSecret
                          ? 'bg-amber-50 border-amber-200 text-amber-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                          }`}
                        title={item.isSecret ? "Mode Sensitif Aktif" : "Tandai sebagai data sensitif"}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.value)}
                        className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Salin Value"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveSetting(item.id)}
                        className="p-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                        title="Hapus Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div> */}

          <hr className="border-gray-100" />

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Workspace ID: <code className="font-mono">{workspaceId}</code>
            </span>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaved ? "Tersimpan!" : "Simpan Perubahan"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}