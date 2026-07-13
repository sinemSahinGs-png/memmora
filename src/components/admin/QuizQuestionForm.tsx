"use client";

import { useState } from "react";
import { GoldButton } from "../GoldButton";
import type { QuizQuestionInput, QuizOptionLetter } from "@/lib/supabase/quiz";

interface QuizQuestionFormProps {
  initial: QuizQuestionInput;
  onSave: (input: QuizQuestionInput) => Promise<void>;
  onCancel: () => void;
}

const OPTIONS: QuizOptionLetter[] = ["A", "B", "C", "D"];

export function QuizQuestionForm({ initial, onSave, onCancel }: QuizQuestionFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.questionText.trim() || !form.optionA.trim() || !form.optionB.trim()) {
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Soru metni">
        <textarea
          className="memory-input min-h-[80px]"
          value={form.questionText}
          onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))}
          required
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Seçenek A">
          <input
            className="memory-input memory-input-compact"
            value={form.optionA}
            onChange={(e) => setForm((f) => ({ ...f, optionA: e.target.value }))}
            required
          />
        </Field>
        <Field label="Seçenek B">
          <input
            className="memory-input memory-input-compact"
            value={form.optionB}
            onChange={(e) => setForm((f) => ({ ...f, optionB: e.target.value }))}
            required
          />
        </Field>
        <Field label="Seçenek C (opsiyonel)">
          <input
            className="memory-input memory-input-compact"
            value={form.optionC}
            onChange={(e) => setForm((f) => ({ ...f, optionC: e.target.value }))}
          />
        </Field>
        <Field label="Seçenek D (opsiyonel)">
          <input
            className="memory-input memory-input-compact"
            value={form.optionD}
            onChange={(e) => setForm((f) => ({ ...f, optionD: e.target.value }))}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Doğru cevap">
          <select
            className="memory-input memory-input-compact"
            value={form.correctOption}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                correctOption: e.target.value as QuizOptionLetter,
              }))
            }
          >
            {OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sıra">
          <input
            type="number"
            min={0}
            className="memory-input memory-input-compact"
            value={form.sortOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
            }
          />
        </Field>
        <Field label="Durum">
          <label className="flex items-center gap-2 pt-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
            />
            Aktif
          </label>
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <GoldButton type="submit" variant="primary" className="!text-[10px]" disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </GoldButton>
        <GoldButton type="button" variant="secondary" className="!text-[10px]" onClick={onCancel}>
          Vazgeç
        </GoldButton>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}
