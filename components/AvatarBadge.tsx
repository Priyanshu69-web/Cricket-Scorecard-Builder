"use client";

import Image from "next/image";

type AvatarBadgeProps = {
  name: string;
  imageUrl?: string;
  className?: string;
};

export default function AvatarBadge({ name, imageUrl, className }: AvatarBadgeProps) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={32}
        height={32}
        unoptimized
        className={`h-8 w-8 rounded-full object-cover ${className || ""}`}
      />
    );
  }

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 ${className || ""}`}
    >
      {initial}
    </div>
  );
}
