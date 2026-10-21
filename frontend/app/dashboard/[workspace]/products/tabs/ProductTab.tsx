"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Package,
} from "lucide-react";
import { Btn } from "@/app/components/Button";
import { Card } from "@/app/components/Cards";
import { CreateProductModal } from "../_components/ModalProduct";
import useProduct from "../_hook/products";


export const ProductList = ({ workspaceId }: { workspaceId: string }) => {
  const {
    setIsOpen,
    isOpen,
    search,
    setSearch,
    setSelectedStatus,
    selectedStatus,
    formatRupiah,
    products,
    handleSubmit,
    handleUpdate,
    onClose,
    selectedProduct,
    page,
    setPage,
    totalPage,
  } = useProduct(workspaceId);
  const status = [
    { id: "1", label: "All", name: "All" },
    { id: "4", label: "Low Stock", name: "LOW_STOCK" },
    { id: "123", label: "Out of Stock", name: "OUT_OF_STOCK" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <CreateProductModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        product={selectedProduct ?? undefined}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Produk</h1>
          <p className="text-sm text-muted-foreground">
            Kelola katalog produk, stok, dan harga inventaris toko.
          </p>
        </div>
        <Btn
          variant="primary"
          icon={Plus}
          className="flex items-center gap-2 self-start sm:self-auto"
          onClick={() => setIsOpen(true)}
        >
          Tambah Produk
        </Btn>
      </div>

      {/* Main Table Container using Card */}
      <Card className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3 justify-between items-center bg-muted/30">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Cari nama atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {status.map((sta) => (
              <Btn
                key={sta.id}
                variant={selectedStatus === sta.name ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedStatus(sta.name)}
                className="text-xs"
              >
                {sta.name === "All" ? "Semua" : sta.label}
              </Btn>
            ))}
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Produk</th>
                {/* <th className="py-3 px-4">SKU</th> */}
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga</th>
                <th className="py-3 px-4 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    Tidak ada data produk yang sesuai.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  // Ambil gambar dari thumbnail terlebih dahulu, jika null gunakan imageUrl
                  const displayImage = product.imageUrl;

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      {/* Image, Name, and Best Seller Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover border border-border bg-muted flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md border border-border bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                              <Package className="h-5 w-5" />
                            </div>
                          )}

                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground line-clamp-1 max-w-[200px]" title={product.name}>
                                {product.name}
                              </span>
                              {product.isBestSeller && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Star className="h-2.5 w-2.5 fill-current" />
                                  Best
                                </span>
                              )}
                            </div>
                            {product.description && (
                              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {product.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      {/* <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {product.sku || "-"}
                      </td> */}

                      {/* Category */}
                      <td className="py-3 px-4 text-muted-foreground">
                        {product.category || "-"}
                      </td>

                      {/* Price (Konversi string ke number untuk formatRupiah) */}
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        {formatRupiah(Number(product.price) || 0)}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${product.stock <= 5 ? "text-amber-500" : "text-foreground"}`}>
                          {product.stock}
                        </span>
                      </td>

                      {/* Status (Berdasarkan boolean isActive) */}
                      <td className="py-3 px-4 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Btn
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            className="p-1.5 h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleUpdate(product)}
                          />
                          <Btn
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="p-1.5 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => { }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
          <div>
            Menampilkan <span className="font-medium text-foreground">{products.length}</span> dari{" "}
            <span className="font-medium text-foreground">{products.length}</span> produk
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" onClick={() => setPage(prev => Math.max(1, prev - 1))}>
              Sebelumnya
            </Btn>
            <Btn variant="outline" size="sm" onClick={() => setPage(prev => Math.min(totalPage, prev + 1))}>
              Selanjutnya
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
};