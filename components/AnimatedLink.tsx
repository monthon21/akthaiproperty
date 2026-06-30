"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";

interface AnimatedLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export default function AnimatedLink({ href, className, children }: AnimatedLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className={`cursor-pointer ${className || ""}`}
    >
      {children}
      {isNavigating && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-sm">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </Link>
  );
}
