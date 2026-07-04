"use client";

import { useState } from "react";

interface ShareButtonProps {
  href: string;
  title: string;
  translations?: {
    shareLink: string;
    copied: string;
  };
}

export default function ShareButton({
  href,
  title,
  translations = {
    shareLink: "Share link",
    copied: "Copied!"
  }
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ensure we are in a browser context
    if (typeof window === "undefined") return;

    const shareUrl = window.location.origin + href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or sharing failed, fallback to copy to clipboard
        console.log("Web Share API failed, falling back to copy to clipboard:", err);
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="relative group/share pointer-events-auto">
      <button
        onClick={handleShare}
        className={`w-10 h-10 flex items-center justify-center rounded-sm transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 delay-100 shadow-lg cursor-pointer ${
          copied 
            ? "bg-emerald-600 text-white" 
            : "bg-white/10 hover:bg-accent hover:text-primary-dark text-white"
        }`}
        aria-label={translations.shareLink}
      >
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4.5 h-4.5 scale-105 transition-transform duration-200"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4.5 h-4.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
          </svg>
        )}
      </button>
      
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/95 text-white text-[9px] font-medium font-alt rounded border border-white/10 opacity-0 pointer-events-none group-hover/share:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl z-30">
        {copied ? translations.copied : translations.shareLink}
      </span>
    </div>
  );
}
