"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CollapsibleCardProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function CollapsibleCard({
  title,
  description,
  defaultOpen = true,
  children,
  className,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm text-slate-900 dark:text-white">{title}</CardTitle>
            {description ? (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </CardHeader>
      {open ? <CardContent className="pt-0">{children}</CardContent> : null}
    </Card>
  );
}
