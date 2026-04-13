"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayerProfile } from "@/types/cricket";
import AvatarBadge from "@/components/AvatarBadge";

type PlayerPickerProps = {
  title: string;
  players: PlayerProfile[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreatePlayer: (payload: {
    name: string;
    role: PlayerProfile["role"];
    battingStyle: PlayerProfile["battingStyle"];
    bowlingStyle: string;
    imageUrl: string;
  }) => Promise<void>;
};

export default function PlayerPicker({
  title,
  players,
  selectedIds,
  onChange,
  onCreatePlayer,
}: PlayerPickerProps) {
  const [search, setSearch] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [role, setRole] = useState<PlayerProfile["role"]>("Batsman");
  const [battingStyle, setBattingStyle] = useState<PlayerProfile["battingStyle"]>("Right");
  const [bowlingStyle, setBowlingStyle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return players;
    return players.filter((player) => {
      return (
        player.name.toLowerCase().includes(query) ||
        player.role.toLowerCase().includes(query)
      );
    });
  }, [players, search]);

  function togglePlayer(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    if (selectedIds.length >= 11) {
      return;
    }
    onChange([...selectedIds, id]);
  }

  async function handleCreate() {
    const name = search.trim();
    if (!name) return;
    await onCreatePlayer({
      name,
      role,
      battingStyle,
      bowlingStyle,
      imageUrl,
    });
    setCreateMode(false);
    setBowlingStyle("");
    setImageUrl("");
  }

  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        <p className="text-xs text-slate-500">{selectedIds.length}/11</p>
      </div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search players by name or role"
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">Mobile tip: tap section title to collapse cards.</p>
        {filtered.length === 0 && search.trim() ? (
          <Button
            type="button"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => setCreateMode((value) => !value)}
          >
            {createMode ? "Cancel" : `Create "${search.trim()}"`}
          </Button>
        ) : null}
      </div>
      {createMode ? (
        <div className="mt-2 grid gap-2 rounded-md border border-slate-200 p-2 text-xs dark:border-slate-700">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlayerProfile["role"])}
            className="h-8 rounded-md border border-slate-300 px-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option>Batsman</option>
            <option>Bowler</option>
            <option>All-rounder</option>
            <option>Wicketkeeper</option>
          </select>
          <select
            value={battingStyle}
            onChange={(e) => setBattingStyle(e.target.value as PlayerProfile["battingStyle"])}
            className="h-8 rounded-md border border-slate-300 px-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option>Right</option>
            <option>Left</option>
          </select>
          <Input
            value={bowlingStyle}
            onChange={(e) => setBowlingStyle(e.target.value)}
            placeholder="Bowling style (optional)"
            className="h-8 text-xs"
          />
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Profile image URL (optional)"
            className="h-8 text-xs"
          />
          <Button type="button" onClick={handleCreate} className="h-8 text-xs">
            Add player
          </Button>
        </div>
      ) : null}
      <div className="mt-2 h-44 overflow-auto rounded-md border border-slate-200 dark:border-slate-700">
        {filtered.map((player) => {
          const checked = selectedIds.includes(player._id);
          return (
            <label
              key={player._id}
              className="flex cursor-pointer items-center justify-between border-b border-slate-100 px-2 py-1.5 text-xs sm:text-sm last:border-b-0 dark:border-slate-800"
            >
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <AvatarBadge name={player.name} imageUrl={player.imageUrl} className="h-6 w-6" />
                <span>
                  {player.name} <span className="text-xs text-slate-500">({player.role})</span>
                </span>
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePlayer(player._id)}
                className="h-4 w-4"
              />
            </label>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Pick 11 players. Manual squad text is used if fewer are selected.
      </p>
    </div>
  );
}
