"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "14px",
          border: "1px solid hsl(var(--border))",
          background: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.16)",
        },
      }}
    />
  );
}
