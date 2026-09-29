"use client";

import { useMemo, useState } from "react";


import { Servicio, Vehiculo, VehiculoId } from "../types";
import SelectorTipoVehiculo from "./SelectorTipoVehiculo";
import ServiciosAdicionales from "./ServiciosAdicionales";
import SelectorServicioPremium from "./SelectorServicioPremium";
import DialogEsperandoPago from "./DialogEsperandoPago";
import { TbWashDryShade, TbWheel } from "react-icons/tb";
import { RiShieldStarFill } from "react-icons/ri";
import { FaDroplet } from "react-icons/fa6";
import { GiCarDoor, GiCarWheel } from "react-icons/gi";
import { FaCalendarAlt } from "react-icons/fa";

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
        durationMins: 4,
        image: "/sedan.png"
    },

    {
        id: "suv",
        nombre: "Grande",
        descripcion:
            "Camionetas, SUV grande",
        precio: 9000,
        durationMins: 5,
        image: "/suv.png"
    },

    {
        id: "grande",
        nombre: "Extra",
        descripcion:
            "Camionetas americanas Z2",
        precio: 12000,
        durationMins: 6,
        image: "/grande.png"
    },
];

const adicionales: Servicio[] = [
    {
        id: "pisos",
        nombre: "Lavado de pisos gomas",
        detalle: "4 gomas",
        precio: 1000,
        durationMins: 2,
        icon: <TbWashDryShade />
    },

    {
        id: "embarrado",
        nombre: "Vehículo embarrado",
        detalle: "General",
        precio: 3000,
        durationMins: 4,
        icon: <RiShieldStarFill />
    },

    {
        id: "pick-up",
        nombre: "Hidrolavado pick-up",
        detalle: "Parte trasera camionetas",
        precio: 2500,
        durationMins: 6,
        icon: <FaDroplet />
    },

    {
        id: "puertas",
        nombre:
            "Marcos puertas",
        detalle: "4 puertas",
        precio: 4000,
        durationMins: 5,
        icon: <GiCarDoor />
    },

    {
        id: "llantas",
        nombre:
            "Guardafango / llantas",
        detalle: "Llantas",
        precio: 3000,
        durationMins: 2,
        icon: <TbWheel />
    },

    {
        id: "neumaticos",
        nombre:
            "Renovador de neumáticos",
        detalle: "4 neumáticos",
        precio: 2500,
        durationMins: 4,
        icon: <GiCarWheel />
    },
];

// Patente chilena (norma actual): solo consonantes, excluyendo M, N, Ñ y Q.
// Formato vigente: 4 consonantes + 2 dígitos (BBBB·NN) y nuevo formato 2025: 5 consonantes + 1 dígito.
const PATENTE_REGEX = /^[BCDFGHJKLPRSTVWXYZ]{4}\d{2}$|^[BCDFGHJKLPRSTVWXYZ]{5}\d$/;

const PREMIUM_PRECIO = 2000;
const PREMIUM_DURATION_MINS = 5;

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
    const [patente, setPatente] = useState<string>("");

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
            total += PREMIUM_PRECIO;
        }

        return total;
    }, [
        vehiculoSeleccionado,
        serviciosSeleccionados,
        premium,
    ]);

    //
    // ======================================================
    // DURACIÓN TOTAL
    // ======================================================
    //

    const duracionTotal = useMemo(() => {
        let mins = 0;

        const vehiculo = vehiculos.find(
            (x) => x.id === vehiculoSeleccionado
        );

        if (vehiculo) {
            mins += vehiculo.durationMins;
        }

        for (const servicioId of serviciosSeleccionados) {
            const servicio = adicionales.find(
                (x) => x.id === servicioId
            );

            if (servicio) {
                mins += servicio.durationMins;
            }
        }

        if (premium) {
            mins += PREMIUM_DURATION_MINS;
        }

        return mins;
    }, [
        vehiculoSeleccionado,
        serviciosSeleccionados,
        premium,
    ]);

    const patenteValida = PATENTE_REGEX.test(patente);

    //
    // ======================================================
    // CONFIRMAR ORDEN
    // ======================================================
    //

    const resetTerminal = () => {
        setPremium(false);
        setServiciosSeleccionados([]);
        setVehiculoSeleccionado(null);
        setPatente("");
        setShowConfirmar(false);
    };

    const confirmarOrden = async () => {
        const vehiculo = vehiculos.find(
            (x) => x.id === vehiculoSeleccionado
        );

        const servicios = serviciosSeleccionados
            .map((id) => adicionales.find((x) => x.id === id))
            .filter((x): x is Servicio => Boolean(x))
            .map(({ id, precio }) => ({ id, precio }));

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patente,
                    vehiculo: vehiculo
                        ? {
                              id: vehiculo.id,
                              precio: vehiculo.precio,
                          }
                        : null,
                    servicios,
                    premium,
                    total,
                    duracionMins: duracionTotal,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                console.error("Error al crear la orden:", data);
                return;
            }
        } catch (error) {
            console.error("Error al crear la orden:", error);
            return;
        }

        resetTerminal();
    };

    //
    // ======================================================
    // UI
    // ======================================================
    //

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#FCFCFC] text-neutral-950">
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-2">
                {/* VEHICULOS */}

                <SelectorTipoVehiculo
                    vehiculos={vehiculos}
                    vehiculoSeleccionado={vehiculoSeleccionado}
                    onSelected={setVehiculoSeleccionado}
                    patente={patente}
                    setPatente={setPatente}
                    patenteValida={patenteValida}
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
            <div className="shrink-0 px-2 pb-2 text-white">
                <div className="flex w-full items-center justify-between rounded-xl bg-[#1F2C4D] px-5 py-3">
                    <div className="w-1/2 border-r border-[#F6AA0A]">
                        <div className="text-xl uppercase tracking-widest text-neutral-100">
                            Total
                        </div>

                        <div className="bebas text-5xl font-bold leading-none text-[#F6AA0A]">
                            $ {total.toLocaleString("es-CL")}
                        </div>

                        <div className={`mt-1 text-lg ${duracionTotal > 0 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            ≈ {duracionTotal > 0 ? duracionTotal + ' min' : 'Nada seleccionado'}
                        </div>                        
                    </div>

                    <button className={`ml-4 flex w-1/2 items-center justify-center gap-3 rounded-xl bg-[#F6AA0A] px-4 py-3 text-xl font-bold text-[#1F2C4D] transition-all ${(!vehiculoSeleccionado || !patenteValida) && 'opacity-20'}`}
                        disabled={!vehiculoSeleccionado || !patenteValida}
                        onClick={() => setShowConfirmar(true)}>
                            <FaCalendarAlt size={48} />
                            <p className="text-4xl">Reservar</p>
                    </button>
                    <DialogEsperandoPago open={showConfirmar} total={total}
                        onClose={confirmarOrden} />
                </div>
            </div>
        </div>
    );
}