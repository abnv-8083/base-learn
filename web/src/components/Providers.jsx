"use client";

import { Toaster } from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import { SocketProvider } from "@/context/SocketContext";

export function Providers({ children }) {
  return (
    <SocketProvider>
      {children}
      <ConfirmModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          },
          success: { iconTheme: { primary: "var(--color-success)", secondary: "#fff" } },
          error: { iconTheme: { primary: "var(--color-error)", secondary: "#fff" } },
        }}
      />
    </SocketProvider>
  );
}
