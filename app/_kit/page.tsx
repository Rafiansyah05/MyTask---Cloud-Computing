"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { StatusLabel } from "@/components/ui/StatusLabel";
import { PriorityIndicator } from "@/components/ui/PriorityIndicator";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { ToastBanner } from "@/components/ui/Toast";
import { SkeletonCard, SkeletonLine, SkeletonRow } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageHeader } from "@/components/ui/PageHeader";

export default function UIKitPage() {
  const [segment, setSegment] = useState<"Todo" | "In Progress" | "Done">(
    "In Progress"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="MyTask Design Kit (Sementara)"
        description="Halaman verifikasi token editorial, tipografi, dan seluruh komponen UI Fase 1."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            onClick={() => setModalOpen(true)}
          >
            Buka Modal
          </Button>
        }
      />

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="font-serif text-title text-ink-900">1. Skala Tipografi</h2>
        <Card className="space-y-3">
          <div className="font-serif text-display-xl text-ink-900">
            Display XL — Instrument Serif (40px)
          </div>
          <div className="font-serif text-display-lg text-ink-900">
            Display LG — Judul Halaman (32px)
          </div>
          <div className="font-serif text-title text-ink-900">
            Title — Judul Seksi Editorial (22px)
          </div>
          <div className="text-body text-ink-700">
            Body — Geist 15px untuk teks utama, paragraf, dan deskripsi tugas yang nyaman dibaca.
          </div>
          <div className="text-small text-ink-500">
            Small — Geist 13px untuk label kontrol, keterangan sekunder, dan metadata.
          </div>
          <div className="font-mono text-micro text-ink-500">
            MICRO MONO — CAK3EAB3 · 2026-11-25 · 3/5 SUBTUGAS (12px)
          </div>
        </Card>
      </section>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="font-serif text-title text-ink-900">2. Palet Warna</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: "Paper", cls: "bg-paper border border-line" },
            { name: "Surface Raised", cls: "bg-surface-raised border border-line" },
            { name: "Ink 900", cls: "bg-ink-900 text-surface" },
            { name: "Ink 500", cls: "bg-ink-500 text-surface" },
            { name: "Accent", cls: "bg-accent text-surface" },
            { name: "Accent Soft", cls: "bg-accent-soft text-accent-hover border border-accent/20" },
            { name: "Success", cls: "bg-success text-surface" },
            { name: "Warning", cls: "bg-warning text-surface" },
            { name: "Danger", cls: "bg-danger text-surface" },
          ].map((c) => (
            <div key={c.name} className="space-y-1.5">
              <div className={`h-12 rounded-control ${c.cls}`} />
              <div className="text-micro font-mono text-ink-700">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="font-serif text-title text-ink-900">3. Tombol & IconButton</h2>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              Danger (Confirm)
            </Button>
            <Button variant="primary" loading>
              Menyimpan
            </Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-line">
            <Button size="sm" variant="secondary">
              Small
            </Button>
            <Button size="md" variant="secondary">
              Medium
            </Button>
            <Button size="lg" variant="secondary">
              Large
            </Button>
            <IconButton aria-label="Lihat detail" variant="secondary">
              <Eye className="w-4 h-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton aria-label="Edit item" variant="ghost">
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton aria-label="Hapus item" variant="danger">
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </IconButton>
          </div>
        </Card>
      </section>

      {/* Form Fields */}
      <section className="space-y-4">
        <h2 className="font-serif text-title text-ink-900">4. Form Fields</h2>
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Kode Mata Kuliah" required hint="Harus unik, contoh: CAK3EAB3">
            <Input placeholder="CAK3EAB3" />
          </Field>
          <Field label="Prioritas Tugas" error="Silakan pilih tingkat prioritas.">
            <Select defaultValue="High">
              <option value="High">Tinggi</option>
              <option value="Medium">Sedang</option>
              <option value="Low">Rendah</option>
            </Select>
          </Field>
          <Field label="Catatan Tugas" className="md:col-span-2">
            <Textarea placeholder="Tulis rincian tugas..." />
          </Field>
        </Card>
      </section>

      {/* Indicators, Segmented, Dropdown, Progress */}
      <section className="space-y-4">
        <h2 className="font-serif text-title text-ink-900">
          5. Status, Prioritas, Segmented, Dropdown & Progress
        </h2>
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-6">
            <StatusLabel status="Todo" />
            <StatusLabel status="In Progress" />
            <StatusLabel status="Done" />
            <span className="text-ink-300">|</span>
            <PriorityIndicator priority="High" showPrefix />
            <PriorityIndicator priority="Medium" showPrefix />
            <PriorityIndicator priority="Low" showPrefix />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
            <SegmentedControl
              aria-label="Status pengerjaan"
              value={segment}
              onChange={setSegment}
              options={[
                { value: "Todo", label: "Belum Dikerjakan", count: 2 },
                { value: "In Progress", label: "Sedang Dikerjakan", count: 1 },
                { value: "Done", label: "Selesai", count: 3 },
              ]}
            />
            <DropdownMenu
              aria-label="Menu contoh"
              items={[
                {
                  label: "Detail",
                  icon: <BookOpen className="w-4 h-4" strokeWidth={1.5} />,
                  onClick: () => {},
                },
                {
                  label: "Ubah",
                  icon: <Pencil className="w-4 h-4" strokeWidth={1.5} />,
                  onClick: () => {},
                },
                {
                  label: "Hapus",
                  icon: <Trash2 className="w-4 h-4" strokeWidth={1.5} />,
                  variant: "danger",
                  dividerBefore: true,
                  onClick: () => setConfirmOpen(true),
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line">
            <ProgressBar percentage={null} totalSubtasks={0} />
            <ProgressBar percentage={60} totalSubtasks={5} completedSubtasks={3} />
            <ProgressBar percentage={100} totalSubtasks={4} completedSubtasks={4} />
          </div>
        </Card>
      </section>

      {/* Toasts, Skeleton, EmptyState */}
      <section className="space-y-4">
        <h2 className="font-serif text-title text-ink-900">
          6. Toast, Skeleton & Empty State
        </h2>
        <div className="space-y-3">
          <ToastBanner type="success" message="Tugas berhasil diperbarui." />
          <ToastBanner
            type="error"
            title="Gagal Menyimpan"
            message="Kode mata kuliah sudah terdaftar."
          />
          <ToastBanner
            type="warning"
            message="Terdapat 2 tugas yang mendekati tenggat."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonRow className="md:col-span-2" />
        </div>
        <SkeletonLine className="h-3 w-48" />
        <EmptyState
          title="Belum ada tugas tercatat"
          description="Tambahkan tugas perkuliahan pertama Anda untuk mulai melacak subtugas dan tenggat."
          actionText="Tambah Tugas"
          onAction={() => setModalOpen(true)}
        />
      </section>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Contoh Modal Editorial"
      >
        <div className="space-y-4">
          <p className="text-body text-ink-700">
            Modal ini memiliki focus trap, tombol Escape untuk menutup, dan mengembalikan fokus ke pemicu.
          </p>
          <Field label="Judul Contoh">
            <Input placeholder="Ketik sesuatu..." />
          </Field>
          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Simpan
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        title="Hapus Item Contoh"
        message="Tindakan ini akan menghapus item beserta seluruh data terkait secara permanen."
      />
    </div>
  );
}

