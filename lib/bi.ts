import { Db, ObjectId } from "mongodb";

//
// ======================================================
// BI (Business Intelligence)
// ======================================================
//
// Cada vez que se ingresa una orden se
// actualizan dos colecciones que alimentan
// el dashboard (para que deje de ser mock):
//
//   biorders -> una fila normalizada por
//               orden (idempotente por
//               orderId), pensada para
//               análisis / drill-down.
//
//   bidays   -> un documento agregado por
//               día con los contadores e
//               ingresos por tipo de
//               vehículo y por franja
//               horaria. Es lo que lee el
//               dashboard.
//

export type Categoria =
  | "sedan"
  | "suv"
  | "grande";

// El terminal usa el id "auto" para el
// sedán; el dashboard trabaja con "sedan".
const CATEGORIA_POR_VEHICULO: Record<
  string,
  Categoria
> = {
  auto: "sedan",
  sedan: "sedan",
  suv: "suv",
  grande: "grande",
};

// Zona horaria del negocio. La fecha y la
// franja horaria del agregado se calculan
// en esta zona para que "el día" coincida
// con el día local y no con UTC.
const TZ =
  process.env.BI_TIMEZONE ||
  "America/Santiago";

export interface OrderBI {
  patente: string;
  vehiculoId: string; // "auto" | "suv" | "grande"
  total: number;
  premium: boolean;
  serviciosCount: number;
  createdAt: Date;
}

// Devuelve la fecha "YYYY-MM-DD" y la hora
// (0..23) según la zona horaria del negocio.
function partesFechaLocal(d: Date) {
  const partes = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }
  ).formatToParts(d);

  const map = Object.fromEntries(
    partes.map((p) => [p.type, p.value])
  );

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    hour: Number(map.hour),
  };
}

// 0 = Lunes ... 6 = Domingo. Mismo criterio
// (UTC sobre el string) que usa el dashboard.
function indiceDiaSemana(
  date: string
): number {
  const [y, m, d] = date
    .split("-")
    .map(Number);

  const js = new Date(
    Date.UTC(y, m - 1, d)
  ).getUTCDay();

  return (js + 6) % 7;
}

// Franja horaria con el mismo formato que el
// dashboard: "09-10", "18-19", etc.
function bucketHora(hour: number): string {
  const pad = (n: number) =>
    String(n).padStart(2, "0");

  return `${pad(hour)}-${pad(
    hour + 1
  )}`;
}

//
// ======================================================
// REGISTRAR ORDEN EN BI
// ======================================================
//

export async function registrarOrdenBI(
  db: Db,
  orderId: ObjectId,
  order: OrderBI
) {
  const categoria =
    CATEGORIA_POR_VEHICULO[
      order.vehiculoId
    ] ?? "sedan";

  const { date, hour } =
    partesFechaLocal(order.createdAt);

  const hora = bucketHora(hour);

  const diaSemana =
    indiceDiaSemana(date);

  const ingreso = Number.isFinite(
    order.total
  )
    ? order.total
    : 0;

  //
  // biorders: fila normalizada por orden.
  // Upsert por orderId -> idempotente, no
  // duplica si se reprocesa la misma orden.
  //

  await db
    .collection("biorders")
    .updateOne(
      { orderId },
      {
        $set: {
          orderId,
          patente: order.patente,
          categoria,
          vehiculoId: order.vehiculoId,
          premium: order.premium,
          serviciosCount:
            order.serviciosCount,
          ingreso,
          date,
          hora,
          diaSemana,
          createdAt: order.createdAt,
        },
      },
      { upsert: true }
    );

  //
  // bidays: agregado diario. $inc crea los
  // campos anidados si no existen, de modo
  // que la operación es atómica.
  //

  await db
    .collection("bidays")
    .updateOne(
      { date },
      {
        $setOnInsert: {
          date,
          diaSemana,
        },
        $inc: {
          [`cantidad.${categoria}`]: 1,
          "cantidad.total": 1,
          [`ingresos.${categoria}`]:
            ingreso,
          "ingresos.total": ingreso,
          [`horas.${hora}.${categoria}`]: 1,
          [`horas.${hora}.total`]: 1,
        },
      },
      { upsert: true }
    );

  return {
    date,
    categoria,
    hora,
    diaSemana,
  };
}
