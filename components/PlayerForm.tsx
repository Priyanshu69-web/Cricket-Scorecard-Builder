"use client";

type PlayerFormProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export default function PlayerForm({ label, value, onChange }: PlayerFormProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400"
        placeholder="One player per line"
      />
      <p className="mt-2 text-xs text-slate-500">Enter 11 players, one per line.</p>
    </div>
  );
}
