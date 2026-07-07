"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareButton({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.saythiswith.me/science#${id}`;

  async function share() {
    const payload = {
      title,
      text: "Check out this concept from the Say This With Me mindset engine:",
      url,
    };
    if (navigator.share) {
      await navigator.share(payload).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
    >
      {copied ? <Check className="size-4" aria-hidden /> : <Share2 className="size-4" aria-hidden />}
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
