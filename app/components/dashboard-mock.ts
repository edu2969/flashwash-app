//
// ======================================================
// TYPES
// ======================================================
//

export interface DashboardHourData {
  hour: string;

  sedan: number;

  suv: number;

  grande: number;

  total: number;
}

export interface DashboardDayData {
  date: string;

  cantidad: {
    sedan: number;
    suv: number;
    grande: number;
    total: number;
  };

  ingresos: {
    sedan: number;
    suv: number;
    grande: number;
    total: number;
  };

  hours: DashboardHourData[];
}

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

function generarHoras(): DashboardHourData[] {
  return HORARIOS.map((hour) => {
    const sedan = rand(0, 8);

    const suv = rand(0, 6);

    const grande = rand(0, 4);

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
  const hours = generarHoras();

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