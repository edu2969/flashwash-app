import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

//
// GET /api/bi/days?from=YYYY-MM-DD&to=YYYY-MM-DD
//
// Devuelve la serie diaria agregada desde la
// colección "bidays" para el intervalo pedido,
// con la forma DashboardDayData que consume el
// dashboard (cantidad, ingresos y hours).
//

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface Bucket {
  sedan?: number;
  suv?: number;
  grande?: number;
  total?: number;
}

// Normaliza un bucket de categorías rellenando
// con 0 las que no estén presentes en el doc.
function normCat(c?: Bucket) {
  return {
    sedan: c?.sedan ?? 0,
    suv: c?.suv ?? 0,
    grande: c?.grande ?? 0,
    total: c?.total ?? 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    if (!DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
      return NextResponse.json(
        {
          error:
            "Los parámetros 'from' y 'to' deben tener formato YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const docs = await db
      .collection("bidays")
      .find({ date: { $gte: from, $lte: to } })
      .sort({ date: 1 })
      .toArray();

    // bidays guarda las horas como mapa { "09-10": {...} }
    // para poder usar $inc atómico; el dashboard las espera
    // como arreglo ordenado, así que aquí convertimos.
    const days = docs.map((d) => {
      const horas = (d.horas ?? {}) as Record<string, Bucket>;

      const hours = Object.keys(horas)
        .sort()
        .map((hour) => ({
          hour,
          ...normCat(horas[hour]),
        }));

      return {
        date: d.date as string,
        cantidad: normCat(d.cantidad as Bucket | undefined),
        ingresos: normCat(d.ingresos as Bucket | undefined),
        hours,
      };
    });

    return NextResponse.json({ days });
  } catch (error) {
    console.error("Error al obtener BI por día:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos del dashboard" },
      { status: 500 }
    );
  }
}
