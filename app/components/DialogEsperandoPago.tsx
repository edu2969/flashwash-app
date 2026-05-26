"use client";

import { FaCreditCard } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";

interface DialogEsperandoPagoProps {
  open: boolean;
  total: number;
  onClose: () => void;
}

export default function DialogEsperandoPago({
  open,
  total,
  onClose
}: DialogEsperandoPagoProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-4xl
          border
          border-cyan-400/30
          bg-[#0B1220]
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
              h-28
              w-28
              items-center
              justify-center
              rounded-full
              border-4
              border-cyan-400/40
              bg-cyan-400/10
              shadow-[0_0_35px_rgba(34,211,238,0.45)]
            "
          >
            <FaCreditCard className="text-6xl text-cyan-300" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <ImSpinner2 className="animate-spin text-3xl text-cyan-400" />

            <h2 className="bebas text-5xl tracking-wide text-white">
              Esperando Pago
            </h2>
          </div>

          <p className="mt-3 text-sm text-neutral-400">
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
              p-6
              text-center
            "
          >
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
              Total a pagar
            </p>

            <div className="mt-3 bebas text-7xl leading-none text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]">
              ${total.toLocaleString("es-CL")}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative pb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2"
          onClick={() => { onClose() }}>
            <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />

            <span className="text-sm font-medium text-cyan-200">
              Pago realizado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}