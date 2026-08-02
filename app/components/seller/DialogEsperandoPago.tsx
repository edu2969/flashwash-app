"use client";

import { useState } from "react";
import { FaCreditCard } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

interface DialogEsperandoPagoProps {
  open: boolean;
  total: number;
  onClose: () => Promise<void> | void;
}

export default function DialogEsperandoPago({
  open,
  total,
  onClose,
}: DialogEsperandoPagoProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-2 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 w-1/2">
      <div
        className="
          relative
          w-full
          max-w-3xl
          overflow-hidden
          rounded-4xl
          border
          border-cyan-400/30
          bg-[#0B1220]
          px-10
          shadow-[0_0_50px_rgba(34,211,238,0.25)]
        "
      >
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_60%)] pointer-events-none" />

        {/* Header */}
        <div className="relative px-6 pt-8 text-center">
          <div
            className="
              mx-auto
              flex
              h-56
              w-56
              items-center
              justify-center
              rounded-full
              border-4
              border-cyan-400/40
              bg-cyan-400/10
              shadow-[0_0_35px_rgba(34,211,238,0.45)]
            "
          >
            <FaCreditCard className="text-9xl text-cyan-300" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <ImSpinner2 className="animate-spin text-8xl text-cyan-400" />

            <h2 className="bebas text-6xl tracking-wide text-white text-nowrap ml-6">
              Esperando Pago
            </h2>
          </div>

          <p className="mt-5 text-5xl py-2 text-neutral-400">
            Solicite al cliente realizar el pago en la máquina lectora.
          </p>
        </div>

        {/* Total */}
        <div className="relative px-6 py-8">
          <div
            className="
              rounded-3xl
              border
              border-cyan-400/20
              bg-[#111A2D]
              p-10
              text-center
            "
          >
            <p className="text-5xl uppercase tracking-[0.25em] text-neutral-400">
              Total a pagar
            </p>

            <div className="mt-3 bebas text-9xl leading-none text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]">
              ${total.toLocaleString("es-CL")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative pb-8 flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`
              inline-flex items-center gap-3 rounded-full
              border border-cyan-400/20
              bg-cyan-400/10
              p-8
              transition-all duration-200
              ${
                loading
                  ? "cursor-not-allowed opacity-70"
                  : "hover:bg-cyan-400/20 hover:scale-105"
              }
            `}
          >
            {loading ? (
              <>
                <ImSpinner2 className="animate-spin text-7xl text-cyan-300" />
                <span className="text-5xl text-cyan-200">
                  Confirmando...
                </span>
              </>
            ) : (
              <>
                <span className="h-9 w-9 animate-pulse rounded-full bg-cyan-400" />
                <span className="text-5xl font-semibold text-cyan-200">
                  Confirmar pago
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}