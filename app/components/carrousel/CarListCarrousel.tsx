"use client";

import { useEffect, useRef, useState } from "react";
import CarList from "./CarList";

//
// ======================================================
// CONFIG
// ======================================================
//
// Carrousel vertical de 4 láminas. Cada video/pantalla dura 5s,
// el listado dura 15s; el listado se reconsulta cada 20s (ver CarList).
//
// Para simular un loop infinito se clona la primera lámina al final:
// el track sube de la lámina 4 (listado) al clon (índice REAL), y al
// terminar su tiempo hace un "snap" sin animación al índice 0 real.
// Como el clon y el índice 0 muestran el mismo video, el salto es invisible.

const DURATIONS = [5_000, 15_000, 5_000, 15_000];
const REAL = DURATIONS.length; // índice del clon (la 5ª posición)

// Frases que entran alternando izquierda / derecha sobre los videos.
const FRASES_VIDEO_1 = [
  "Tecnología",
  "Brillo",
  "Rapidez",
  "Usamos componentes de calidad",
];

const FRASES_VIDEO_2 = [
  "Cuidamos con tecnología tu automóvil",
  "Ahorra tiempo y más",
];

//
// ======================================================
// FRASES ANIMADAS
// ======================================================
//

function FrasesAnimadas({ frases }: { frases: string[] }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 text-center">
      {frases.map((frase, i) => (
        <div
          key={frase}
          className={`${i % 2 === 0 ? "fw-in-left" : "fw-in-right"} bebas text-white font-bold leading-none drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)] ${
            i === frases.length - 1
              ? "text-4xl md:text-5xl text-[#F6AA0A]"
              : "text-6xl md:text-7xl"
          }`}
          style={{ animationDelay: `${i * 700}ms` }}
        >
          {frase}
        </div>
      ))}
    </div>
  );
}

//
// ======================================================
// COMPONENT
// ======================================================
//

export default function CarListCarrousel() {
  // Posición del track: 0..3 láminas reales, 4 = clon de la primera.
  const [pos, setPos] = useState(0);
  // Habilita/desabilita la transición para poder hacer el snap invisible.
  const [anim, setAnim] = useState(true);
  // Contador monótono: fuerza re-montar las animaciones en cada vuelta.
  const [step, setStep] = useState(0);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const videoCloneRef = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  // Avance automático + reset del loop infinito.
  useEffect(() => {
    // Acabamos de hacer snap al inicio (sin animación): reactivamos la
    // transición y avanzamos a la segunda lámina en el siguiente frame.
    if (pos === 0 && !anim) {
      const raf = requestAnimationFrame(() => {
        setAnim(true);
        setStep((s) => s + 1);
        setPos(1);
      });
      return () => cancelAnimationFrame(raf);
    }

    const dur = pos === REAL ? DURATIONS[0] : DURATIONS[pos];

    const id = setTimeout(() => {
      if (pos === REAL) {
        // Snap invisible: del clon de vuelta a la primera lámina real.
        setAnim(false);
        setPos(0);
      } else {
        setStep((s) => s + 1);
        setPos((p) => p + 1);
      }
    }, dur);

    return () => clearTimeout(id);
  }, [pos, anim]);

  // Reinicia el video correspondiente al volver a su lámina.
  useEffect(() => {
    const ref =
      pos === 0 ? video1Ref : pos === 2 ? video2Ref : pos === REAL ? videoCloneRef : null;

    if (ref?.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  }, [pos]);

  const dotActivo = pos === REAL ? 0 : pos;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* TRACK VERTICAL */}
      <div
        className={`absolute inset-x-0 top-0 flex flex-col ${
          anim ? "transition-transform duration-700 ease-in-out" : ""
        }`}
        style={{ transform: `translateY(-${pos * 100}dvh)` }}
      >
        {/* 1 · VIDEO 01 (4:3 horizontal, cubre toda la pantalla) */}
        <section className="relative h-dvh w-full overflow-hidden bg-black">
          <video
            ref={video1Ref}
            src="/video_01.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
          {pos === 0 && anim && (
            <FrasesAnimadas key={`v1-${step}`} frases={FRASES_VIDEO_1} />
          )}
        </section>

        {/* 2 · PANTALLA / LISTADO DE PRECIOS */}
        <section className="relative h-dvh w-full overflow-hidden bg-[#FCFCFC]">
          {pos === 1 && (
            <h2
              key={`titulo-${step}`}
              className="fw-drop bebas absolute inset-x-0 top-8 z-10 text-center text-3xl md:text-4xl font-bold tracking-widest text-[#1F2C4D]"
            >
              LISTADO DE PRECIOS
            </h2>
          )}
          <div
            role="img"
            aria-label="Listado de precios"
            className="absolute inset-0 p-10 pt-24 bg-contain bg-center bg-no-repeat"
            style={{ 
              backgroundImage: "url('/pantalla_01.png')", 
              height: "90vh",
              top: "10vh"
            }}
          />
        </section>

        {/* 3 · VIDEO 02 (cubre toda la pantalla) */}
        <section className="relative h-dvh w-full overflow-hidden bg-black">
          <video
            ref={video2Ref}
            src="/video_02.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
          {pos === 2 && (
            <FrasesAnimadas key={`v2-${step}`} frases={FRASES_VIDEO_2} />
          )}
        </section>

        {/* 4 · LISTADO EN PROCESO */}
        <section className="h-dvh w-full">
          <CarList active={pos === 3} />
        </section>

        {/* 5 · CLON DEL VIDEO 01 (cierre del loop infinito) */}
        <section className="relative h-dvh w-full overflow-hidden bg-black">
          <video
            ref={videoCloneRef}
            src="/video_01.mp4"
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            autoPlay
            loop
          />
          {pos === REAL && (
            <FrasesAnimadas key={`vclon-${step}`} frases={FRASES_VIDEO_1} />
          )}
        </section>
      </div>

      {/* INDICADORES */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {DURATIONS.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === dotActivo ? "bg-[#F6AA0A] h-6" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
