"use client";

import dynamic from "next/dynamic";

// El carrousel es una pantalla de kiosko (videos, timers, datos en vivo):
// no aporta nada renderizarlo en el servidor y, al cargarlo solo en el
// cliente, evitamos cualquier desajuste de hidratación.
const CarListCarrousel = dynamic(() => import("./CarListCarrousel"), {
  ssr: false,
});

export default function CarListCarrouselClient() {
  return <CarListCarrousel />;
}
