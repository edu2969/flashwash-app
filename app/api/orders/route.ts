import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { registrarOrdenBI } from "@/lib/bi";

// Patente chilena (norma actual): solo consonantes, excluyendo M, N, Ñ y Q.
// Formato vigente: 4 consonantes + 2 dígitos (BBBB·NN) y nuevo formato 2025: 5 consonantes + 1 dígito.
const PATENTE_REGEX = /^[BCDFGHJKLPRSTVWXYZ]{4}\d{2}$|^[BCDFGHJKLPRSTVWXYZ]{5}\d$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const patente =
      typeof body.patente === "string"
        ? body.patente.trim().toUpperCase()
        : "";

    if (patente !== "" && !PATENTE_REGEX.test(patente)) {
      return NextResponse.json(
        { error: "Patente inválida" },
        { status: 400 }
      );
    }

    if (!body.vehiculo) {
      return NextResponse.json(
        { error: "Debe seleccionar un tipo de vehículo" },
        { status: 400 }
      );
    }

    // El terminal envía vehiculo como { id, precio }; toleramos también un string.
    const vehiculoId =
      typeof body.vehiculo === "string"
        ? body.vehiculo
        : typeof body.vehiculo?.id === "string"
        ? body.vehiculo.id
        : "";

    const db = await connectDB();

    const order = {
      patente,
      vehiculo: body.vehiculo,
      servicios: Array.isArray(body.servicios) ? body.servicios : [],
      premium: Boolean(body.premium),
      total: Number(body.total) || 0,
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    // Actualiza las colecciones de BI (biorders / bidays) que alimentan el dashboard.
    await registrarOrdenBI(db, result.insertedId, {
      patente: order.patente,
      vehiculoId,
      total: order.total,
      premium: order.premium,
      serviciosCount: order.servicios.length,
      createdAt: order.createdAt,
    });

    return NextResponse.json(
      {
        message: "Orden creada exitosamente",
        orderId: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return NextResponse.json(
      { error: "Error al crear la orden" },
      { status: 500 }
    );
  }
}
