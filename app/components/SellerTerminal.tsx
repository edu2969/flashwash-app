"use client";

import { useMemo, useState } from "react";


import Header from "./Header";
import { Servicio, Vehiculo, VehiculoId } from "./types";
import SelectorTipoVehiculo from "./SelectorTipoVehiculo";
import ServiciosAdicionales from "./ServiciosAdicionales";
import SelectorServicioPremium from "./SelectorServicioPremium";
import DialogEsperandoPago from "./DialogEsperandoPago";

//
// ======================================================
// DATA
// ======================================================
//

const vehiculos: Vehiculo[] = [
    {
        id: "auto",
        nombre: "Autos",
        descripcion:
            "Sedán, City Car, Jeep 2 puertas",
        precio: 6000,

        imageOn: "/sedan_on.png",
        imageOff: "/sedan_off.png",
    },

    {
        id: "suv",
        nombre: "Grande",
        descripcion:
            "Camionetas, SUV grande",
        precio: 9000,

        imageOn: "/suv_on.png",
        imageOff: "/suv_off.png",
    },

    {
        id: "grande",
        nombre: "Extra Grande",
        descripcion:
            "Camionetas americanas Z2",
        precio: 12000,

        imageOn: "/grande_on.png",
        imageOff: "/grande_off.png",
    },
];

const adicionales: Servicio[] = [
    {
        id: "pisos",
        nombre:
            "Lavado de pisos gomas",
        detalle: "4 gomas",
        precio: 1000,
    },

    {
        id: "embarrado",
        nombre:
            "Vehículo embarrado",
        detalle: "General",
        precio: 3000,
    },

    {
        id: "pick-up",
        nombre:
            "Hidrolavado pick-up",
        detalle:
            "Parte trasera camionetas",
        precio: 2500,
    },

    {
        id: "puertas",
        nombre:
            "Limpieza marcos puertas",
        detalle: "4 puertas",
        precio: 4000,
    },

    {
        id: "llantas",
        nombre:
            "Limpieza guardafango y llantas",
        detalle: "Llantas",
        precio: 3000,
    },

    {
        id: "neumaticos",
        nombre:
            "Renovador de neumáticos",
        detalle: "4 neumáticos",
        precio: 2500,
    },
];

//
// ======================================================
// COMPONENT
// ======================================================
//

export default function SellerTerminal() {
    const [
        vehiculoSeleccionado,
        setVehiculoSeleccionado,
    ] = useState<VehiculoId | null>(
        null
    );

    const [showConfirmar, setShowConfirmar] = useState(false);

    const [
        serviciosSeleccionados,
        setServiciosSeleccionados,
    ] = useState<string[]>([]);

    const [
        premium,
        setPremium,
    ] = useState(false);

    //
    // ======================================================
    // HANDLERS
    // ======================================================
    //

    const toggleServicio = (
        id: string
    ) => {
        setServiciosSeleccionados(
            (prev) => {
                if (prev.includes(id)) {
                    return prev.filter(
                        (x) => x !== id
                    );
                }

                return [...prev, id];
            }
        );
    };

    //
    // ======================================================
    // TOTAL
    // ======================================================
    //

    const total = useMemo(() => {
        let total = 0;

        const vehiculo =
            vehiculos.find(
                (x) =>
                    x.id ===
                    vehiculoSeleccionado
            );

        if (vehiculo) {
            total += vehiculo.precio;
        }

        for (const servicioId of serviciosSeleccionados) {
            const servicio =
                adicionales.find(
                    (x) =>
                        x.id === servicioId
                );

            if (servicio) {
                total += servicio.precio;
            }
        }

        if (premium) {
            total += 2000;
        }

        return total;
    }, [
        vehiculoSeleccionado,
        serviciosSeleccionados,
        premium,
    ]);

    //
    // ======================================================
    // UI
    // ======================================================
    //

    return (
        <div className="h-screen text-neutral-950 bg-white overflow-hidden">
            <div className="h-screen overflow-y-scroll mx-auto space-y-4 p-2 pb-32">
                {/* HEADER */}



                {/* VEHICULOS */}

                <SelectorTipoVehiculo
                    vehiculos={vehiculos}
                    vehiculoSeleccionado={vehiculoSeleccionado}
                    onSelected={setVehiculoSeleccionado}
                />

                {/* ADICIONALES */}

                <ServiciosAdicionales
                    serviciosSeleccionados={serviciosSeleccionados}
                    toggleServicio={toggleServicio}
                    adicionales={adicionales} />

                {/* PREMIUM */}

                <SelectorServicioPremium
                    premium={premium}
                    setPremium={setPremium}
                />




            </div>
            {/* TOTAL */}
            <div className="fixed bottom-0 w-full py-2 px-4 bg-[#1F2C4D] text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-neutral-100 text-sm uppercase tracking-widest">
                            Total
                        </div>

                        <div
                            className={`bebas text-7xl leading-none`}
                        >
                            $
                            {total.toLocaleString(
                                "es-CL"
                            )}
                        </div>
                    </div>

                    <button className={`bg-white hover:bg-cyan-400 text-[#1F2C4D] text-2xl font-bold px-8 py-4 rounded-2xl transition-all ${!vehiculoSeleccionado && 'opacity-20'}`}
                        disabled={!vehiculoSeleccionado}
                        onClick={() => setShowConfirmar(true)}>
                        Reservar
                    </button>
                    <DialogEsperandoPago open={showConfirmar} total={total}
                        onClose={() => {
                            setPremium(false);
                            setServiciosSeleccionados([]);
                            setVehiculoSeleccionado(null);
                            setShowConfirmar(false)
                        }
                        } />
                </div>
            </div>
        </div>
    );
}