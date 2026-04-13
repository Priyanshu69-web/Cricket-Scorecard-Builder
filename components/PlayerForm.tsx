"use client";

type PlayerFormProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function PlayerForm({ label, value, onChange }: PlayerFormProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
        placeholder="One player per line"
      />
      <p className="mt-2 text-xs text-slate-500">Enter 11 players, one per line.</p>
    </div>
  );
}
