"use client";

import { useMemo, useState } from "react";


import Header from "../Header";
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

        image: "/sedan.png"
    },

    {
        id: "suv",
        nombre: "Grande",
        descripcion:
            "Camionetas, SUV grande",
        precio: 9000,

        image: "/suv.png"
    },

    {
        id: "grande",
        nombre: "Extra",
        descripcion:
            "Camionetas americanas Z2",
        precio: 12000,

        image: "/grande.png"
    },
];

const adicionales: Servicio[] = [
    {
        id: "pisos",
        nombre: "Lavado de pisos gomas",
        detalle: "4 gomas",
        precio: 1000,
        icon: <TbWashDryShade />
    },

    {
        id: "embarrado",
        nombre: "Vehículo embarrado",
        detalle: "General",
        precio: 3000,
        icon: <RiShieldStarFill />
    },

    {
        id: "pick-up",
        nombre: "Hidrolavado pick-up",
        detalle: "Parte trasera camionetas",
        precio: 2500,
        icon: <FaDroplet />
    },

    {
        id: "puertas",
        nombre:
            "Marcos puertas",
        detalle: "4 puertas",
        precio: 4000,
        icon: <GiCarDoor />
    },

    {
        id: "llantas",
        nombre:
            "Guardafango / llantas",
        detalle: "Llantas",
        precio: 3000,
        icon: <TbWheel />
    },

    {
        id: "neumaticos",
        nombre:
            "Renovador de neumáticos",
        detalle: "4 neumáticos",
        precio: 2500,
        icon: <GiCarWheel />
    },
];

// Patente chilena (norma actual): solo consonantes, excluyendo M, N, Ñ y Q.
// Formato vigente: 4 consonantes + 2 dígitos (BBBB·NN) y nuevo formato 2025: 5 consonantes + 1 dígito.
const PATENTE_REGEX = /^[BCDFGHJKLPRSTVWXYZ]{4}\d{2}$|^[BCDFGHJKLPRSTVWXYZ]{5}\d$/;

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
            total += 2000;
        }

        return total;
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
        <div className="h-screen text-neutral-950 bg-[#FCFCFC] overflow-hidden">
            <div className="h-screen overflow-hidden mx-auto space-y-2 p-2 pb-32">                
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
            <div className="w-full fixed bottom-0 py-2 px-2 text-white">
                <div className="w-full flex items-center justify-between bg-[#1F2C4D] px-6 py-4 rounded-xl">
                    <div className="w-1/2 border-r border-[#F6AA0A]">
                        <div className="text-neutral-100 text-sm uppercase tracking-widest">
                            Total
                        </div>

                        <div className={`bebas text-3xl leading-none text-[#F6AA0A] font-bold`}>
                            $ {total.toLocaleString("es-CL")}
                        </div>
                    </div>

                    <button className={`w-1/2 flex ml-4 bg-[#F6AA0A] text-[#1F2C4D] text-xl font-bold px-6 py-4 rounded-2xl transition-all ${(!vehiculoSeleccionado || (!patenteValida && patente.length > 0)) && 'opacity-20'}`}
                        disabled={!vehiculoSeleccionado || (!patenteValida && patente.length > 0)}
                        onClick={() => setShowConfirmar(true)}>
                            <FaCalendarAlt size={18} className="relative top-1" />
                            <p className="ml-4">Reservar</p>
                    </button>
                    <DialogEsperandoPago open={showConfirmar} total={total}
                        onClose={confirmarOrden} />
                </div>
            </div>
        </div>
    );
}