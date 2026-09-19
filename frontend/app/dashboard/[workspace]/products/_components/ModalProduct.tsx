"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Upload, PackagePlus, Image as ImageIcon, Trash2, AlertCircle } from "lucide-react";
import { Card } from "@/app/components/Cards";
import { Btn } from "@/app/components/Button";
import { CreateProductFormData, Product } from "@/lib/types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductFormData) => Promise<void>;
  product?: Product;
}

export const CreateProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  product
}: ProductModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<CreateProductFormData>({
    name: "",
    category: "",
    description: "",
    benefits: "",
    price: 0,
    isBestSeller: false,
    stock: 0,
    isActive: true,
    file: null,
  });

  // Preview Gambar Sementara
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name ?? "",
          category: product.category ?? "",
          description: product.description ?? "",
          benefits: product.benefits ?? "",
          price: Number(product.price ?? 0),
          isBestSeller: product.isBestSeller ?? false,
          stock: product.stock ?? 0,
          isActive: product.isActive ?? true,
          file: null, // Reset input file saat edit
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? 0 : parseFloat(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler Pilih File Gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));

      // Buat URL preview lokal
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler Hapus File Gambar
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      benefits: "",
      price: 0,
      isBestSeller: false,
      stock: 0,
      isActive: true,
      file: null,
    })
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {product ? 'Update' : 'Tambah'} Produk Baru
            </h2>
          </div>
          <Btn
            variant="ghost"
            size="sm"
            icon={X}
            onClick={handleClose}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
          />
        </div>

        {/* Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">

          {/* Alert Error Message Global */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Upload File Gambar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Gambar Produk
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/10 hover:bg-muted/30"
              >
                <div className="p-3 bg-muted rounded-full text-muted-foreground">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Klik untuk unggah gambar produk
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PNG, JPG, WEBP hingga 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20 p-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg border border-border bg-background"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {formData.file?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.file?.size ? (formData.file.size / (1024 * 1024)).toFixed(2) : 0} MB
                    </p>
                  </div>
                </div>
                <Btn
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-destructive hover:bg-destructive/10"
                />
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Informasi Utama */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Informasi Dasar
            </h3>

            {/* Nama Produk & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nama Produk <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Sepatu Lari Ultra"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">SKU</label>
                <input
                  type="text"
                  name="sku"
                  placeholder="SP-LARI-01"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                />
              </div> */}
            </div>

            {/* Kategori, Harga & Stok */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Kategori</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Pakaian / Elektronik"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Harga (IDR) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Stok</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Deskripsi <span className="text-destructive">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Jelaskan detail mengenai produk ini..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>

            {/* Manfaat / Benefits */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Manfaat / Keunggulan</label>
              <textarea
                name="benefits"
                rows={2}
                placeholder="Contoh: Bahan bernapas, tahan air, garansi 1 tahun..."
                value={formData.benefits}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* Opsi & Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pengaturan Tambahan
            </h3>

            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                />
                Status Aktif
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                />
                Tandai sebagai Best Seller
              </label>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/20">
          <Btn variant="outline" onClick={handleClose} disabled={isLoading}>
            Batal
          </Btn>
          <Btn
            variant="primary"
            type="button"
            disabled={isLoading}
            onClick={() => {
              const form = document.getElementById("product-form") as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            {isLoading ? "Menyimpan..." : "Simpan Produk"}
          </Btn>
        </div>
      </Card>
    </div>
  );
};