//
// ======================================================
// TIPOS Y HELPERS DEL DASHBOARD
// ======================================================
//
// Tipos compartidos entre el mock, el
// endpoint de BI y el componente del
// dashboard. No contiene datos: así el
// dashboard real no arrastra la generación
// del mock.
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
// DIA DE SEMANA
// ======================================================
//
// Orden lunes -> domingo.
//

export const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

// Devuelve el índice del día de semana
// (0 = Lunes ... 6 = Domingo) a partir de
// una fecha "YYYY-MM-DD". Se usa UTC para
// que sea determinístico e independiente
// de la zona horaria.
export function indiceDiaSemana(
  date: string
): number {
  const [y, m, d] = date
    .split("-")
    .map(Number);

  const js = new Date(
    Date.UTC(y, m - 1, d)
  ).getUTCDay(); // 0 = Domingo

  return (js + 6) % 7; // 0 = Lunes
}
