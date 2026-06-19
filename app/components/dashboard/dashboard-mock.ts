import {
  DashboardDayData,
  DashboardHourData,
  indiceDiaSemana,
} from "./dashboard-types";

//
// ======================================================
// RANDOM DETERMINISTICO
// ======================================================
//

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value =
      (value * 9301 + 49297) %
      233280;

    return value / 233280;
  };
}

const random = seededRandom(777);

function rand(
  min: number,
  max: number
) {
  return Math.floor(
    random() * (max - min + 1) + min
  );
}

//
// ======================================================
// DIA DE SEMANA
// ======================================================
//

// Factor de demanda por día de semana.
// El fin de semana se atienden más autos
// que a mitad de semana. Índice 0 = Lunes.
const FACTOR_DIA = [
  0.6, // Lunes
  0.7, // Martes
  0.85, // Miércoles
  1.0, // Jueves
  1.4, // Viernes
  1.9, // Sábado
  1.3, // Domingo
];

//
// ======================================================
// CONFIG
// ======================================================
//

const HORARIOS = [
  "09-10",
  "10-11",
  "11-12",
  "12-13",
  "13-14",
  "14-15",
  "15-16",
  "16-17",
  "17-18",
  "18-19",
];

const PRECIOS = {
  sedan: 12000,
  suv: 18000,
  grande: 25000,
};

//
// ======================================================
// FECHA FIJA
// ======================================================
//
// IMPORTANTE:
// NO usar new Date() dinámico
//

const START_DATE =
  "2025-01-01";

const END_DATE =
  "2025-04-30";

//
// ======================================================
// GENERAR HORAS
// ======================================================
//

function generarHoras(
  factor: number
): DashboardHourData[] {
  return HORARIOS.map((hour) => {
    const sedan = Math.round(
      rand(0, 8) * factor
    );

    const suv = Math.round(
      rand(0, 6) * factor
    );

    const grande = Math.round(
      rand(0, 4) * factor
    );

    return {
      hour,

      sedan,

      suv,

      grande,

      total:
        sedan + suv + grande,
    };
  });
}

//
// ======================================================
// GENERAR DIA
// ======================================================
//

function generarDia(
  date: string
): DashboardDayData {
  const factor =
    FACTOR_DIA[
      indiceDiaSemana(date)
    ];

  const hours = generarHoras(factor);

  const sedan =
    hours.reduce(
      (acc, x) => acc + x.sedan,
      0
    );

  const suv =
    hours.reduce(
      (acc, x) => acc + x.suv,
      0
    );

  const grande =
    hours.reduce(
      (acc, x) => acc + x.grande,
      0
    );

  const total =
    sedan + suv + grande;

  return {
    date,

    cantidad: {
      sedan,
      suv,
      grande,
      total,
    },

    ingresos: {
      sedan:
        sedan * PRECIOS.sedan,

      suv:
        suv * PRECIOS.suv,

      grande:
        grande * PRECIOS.grande,

      total:
        sedan * PRECIOS.sedan +
        suv * PRECIOS.suv +
        grande * PRECIOS.grande,
    },

    hours,
  };
}

//
// ======================================================
// GENERADOR PRINCIPAL
// ======================================================
//

export function generarDatosDashboard(): DashboardDayData[] {
  const result: DashboardDayData[] = [];

  const current =
    new Date(START_DATE);

  const end =
    new Date(END_DATE);

  while (current <= end) {
    const date = current
      .toISOString()
      .split("T")[0];

    result.push(
      generarDia(date)
    );

    current.setDate(
      current.getDate() + 1
    );
  }

  return result;
}

//
// ======================================================
// EXPORT ESTATICO
// ======================================================
//
// MUY IMPORTANTE:
// se genera UNA SOLA VEZ
//

export const dashboardMockData =
  generarDatosDashboard();