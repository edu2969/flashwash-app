"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { FaCarSide, FaClock, FaCheck } from "react-icons/fa";
import { 
    TbWashDryShade, 
    TbWheel 
} from "react-icons/tb";
import { 
    RiShieldStarFill 
} from "react-icons/ri";
import { FaDroplet } from "react-icons/fa6";
import { 
    GiCarDoor, 
    GiCarWheel 
} from "react-icons/gi";

//
// ======================================================
// TIPOS
// ======================================================
//

interface ServicioSeleccionado {
    id: string;
    precio: number;
    completado?: boolean;
}

interface ServicioBase {
    id: string;
    nombre: string;
    detalle: string;
    precio: number;
    durationMins: number;
    icon: React.ReactNode;
}

interface OrdenFromDB {
    id: string;
    patente: string;
    vehiculoId: string;
    total: number;
    duracionMins: number;
    createdAt: number;
    servicios: ServicioSeleccionado[];
    premium: boolean;
    endAt: number;
}

interface OrdenProcesada {
    id: string;
    patente: string;
    vehiculoId: string;
    premium: boolean;
    total: number;
    duracionMins: number;
    createdAt: number;
    endAt: number;
    servicios: ServicioBase[];
    serviciosCompletados: string[];
}

// Cuántas filas caben en la pantalla antes de resumir el resto.
const MAX_VISIBLE = 7;

const VEHICULO_LABEL: Record<string, string> = {
    grande: "Grande",
    suv: "SUV",
    auto: "Sedan",
};

const VEHICULO_IMAGE: Record<string, string> = {
    grande: "/grande.png",
    suv: "/suv.png",
    auto: "/sedan.png",
};

export const ORDERS_QUERY_KEY = ["orders", "pending"] as const;

// Servicios adicionales disponibles (base de datos de servicios)
// Íconos a 28px: legibles en tablet sin desbalancear el checkbox de 48px.
const SERVICIOS_DB: Record<string, ServicioBase> = {
    pisos: {
        id: "pisos",
        nombre: "Lavado de pisos gomas",
        detalle: "4 gomas",
        precio: 1000,
        durationMins: 2,
        icon: <TbWashDryShade />
    },
    embarrado: {
        id: "embarrado",
        nombre: "Vehículo embarrado",
        detalle: "General",
        precio: 3000,
        durationMins: 4,
        icon: <RiShieldStarFill />
    },
    "pick-up": {
        id: "pick-up",
        nombre: "Hidrolavado pick-up",
        detalle: "Parte trasera camionetas",
        precio: 2500,
        durationMins: 6,
        icon: <FaDroplet />
    },
    puertas: {
        id: "puertas",
        nombre: "Marcos puertas",
        detalle: "4 puertas",
        precio: 4000,
        durationMins: 5,
        icon: <GiCarDoor />
    },
    llantas: {
        id: "llantas",
        nombre: "Guardafango / llantas",
        detalle: "Llantas",
        precio: 3000,
        durationMins: 2,
        icon: <TbWheel />
    },
    neumaticos: {
        id: "neumaticos",
        nombre: "Renovador de neumáticos",
        detalle: "4 neumáticos",
        precio: 2500,
        durationMins: 4,
        icon: <GiCarWheel />
    },
};

const patenteSecreta = (patente: string) => {
    if (patente.length <= 3) return patente; // muy corta para ocultar algo con sentido

    const primero = patente.slice(0, 1);
    const ultimos = patente.slice(-2);
    const ocultos = "*".repeat(patente.length - 3);

    return `${primero}${ocultos}${ultimos}`;
};

async function fetchPendientes(): Promise<OrdenProcesada[]> {
    const res = await fetch("/api/todos");

    if (!res.ok) {
        throw new Error("No se pudieron cargar las órdenes");
    }

    const data = await res.json();

    const ordenes: OrdenFromDB[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
            ? data.orders
            : [];

    if (ordenes.length === 0 && !Array.isArray(data) && !Array.isArray(data?.orders)) {
        console.error("Formato de datos inesperado desde /api/todos:", data);
    }

    return ordenes.map((orden) => {
        const createdAt = new Date(orden.createdAt).getTime();
        const endAt = orden.endAt ?? createdAt + orden.duracionMins * 60 * 1000;

        const serviciosCompletados = (orden.servicios ?? [])
            .filter((s) => s.completado === true)
            .map((s) => s.id);

        const servicios = (orden.servicios ?? [])
            .map((s) => SERVICIOS_DB[s.id])
            .filter((s): s is ServicioBase => s !== undefined);

        return {
            id: orden.id,
            patente: patenteSecreta(orden.patente) || "Sin patente",
            vehiculoId: orden.vehiculoId,
            premium: orden.premium,
            total: orden.total,
            duracionMins: orden.duracionMins,
            createdAt,
            endAt,
            servicios,
            serviciosCompletados,
        };
    });
}

// Separa la hora del período (a. m. / p. m.) para poder pintarlos con tamaños distintos.
function formatHoraParts(ts: number) {
    const partes = new Intl.DateTimeFormat("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).formatToParts(ts);

    const hora = partes
        .filter((p) => p.type !== "dayPeriod")
        .map((p) => p.value)
        .join("")
        .trim();

    const periodo = partes.find((p) => p.type === "dayPeriod")?.value ?? "";

    return { hora, periodo };
}

function HoraConPeriodo({
    ts,
    horaClassName = "",
    periodoClassName = "",
}: {
    ts: number;
    horaClassName?: string;
    periodoClassName?: string;
}) {
    const { hora, periodo } = formatHoraParts(ts);

    return (
        <span className="inline-flex items-baseline gap-1.5">
            <span className={horaClassName}>{hora}</span>
            {periodo && <span className={periodoClassName}>{periodo}</span>}
        </span>
    );
}

//
// ======================================================
// COMPONENTE SERVICIO ITEM
// ======================================================
//

function ServicioItem({ 
    servicio, 
    completado, 
    onToggle,
    disabled
}: { 
    servicio: ServicioBase;
    completado: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            onClick={onToggle}
            disabled={disabled}
            className={`
                flex items-center justify-between gap-4 rounded-lg border-2 px-3 py-2.5 w-full text-left
                transition-all touch-manipulation
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
                ${completado 
                    ? 'border-[#ADCCE6] bg-[#E8F0F5]' 
                    : 'border-gray-200 hover:border-gray-300'
                }
            `}
        >
            <div className="flex items-center gap-4 min-w-0">
                {/* Checkbox 48x48: mínimo recomendado para target táctil cómodo */}
                <div className={`
                    w-12 h-12 rounded-md flex items-center justify-center shrink-0
                    ${completado ? 'bg-[#0870C6]' : 'border-2 border-gray-300'}
                `}>
                    {completado && <FaCheck size={22} className="text-[#ADCCE6]" />}
                </div>

                <div className={`text-4xl shrink-0 ${completado ? 'text-[#0870C6]' : 'text-gray-300'}`}>
                    {servicio.icon}
                </div>

                <div className="min-w-0">
                    <div className={`oswald text-2xl leading-tight truncate ${completado ? 'text-[#0870C6]' : 'text-neutral-800'}`}>
                        {servicio.nombre}
                    </div>
                    <div className="text-xl text-neutral-400 truncate">{servicio.detalle}</div>
                </div>
            </div>
            
        </button>
    );
}

//
// ======================================================
// COMPONENTE ORDEN EXPANDIDA
// ======================================================
//

function OrdenExpandida({ 
    orden, 
    onConfirmarOrden,
    isUpdating
}: { 
    orden: OrdenProcesada;
    onConfirmarOrden: (ordenId: string) => void;
    isUpdating: boolean;
}) {
    // Checklist en pantalla: el backend solo sabe completar la orden entera,
    // así que el progreso por servicio se lleva localmente hasta confirmar.
    const [checkedIds, setCheckedIds] = useState<Set<string>>(
        () => new Set(orden.serviciosCompletados)
    );
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Si cambia la orden que ocupa este puesto (se reordenó la cola), reiniciamos el checklist.
    useEffect(() => {
        setCheckedIds(new Set(orden.serviciosCompletados));
        setShowConfirmModal(false);
    }, [orden.id]);

    const toggleServicio = (servicioId: string) => {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            if (next.has(servicioId)) {
                next.delete(servicioId);
            } else {
                next.add(servicioId);
            }
            return next;
        });
    };

    const todosCompletados =
        orden.servicios.length === 0 ||
        orden.servicios.every((s) => checkedIds.has(s.id));

    return (
        <div className="bg-white border border-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.1)] rounded-xl p-4 space-y-3">
            {/* Header de la orden */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={VEHICULO_IMAGE[orden.vehiculoId] || "/auto.png"}
                        alt={VEHICULO_LABEL[orden.vehiculoId] ?? "Vehículo"}
                        className="h-28 object-contain mx-auto"
                    />
                    <div>
                        <div className="bebas text-4xl font-bold leading-none tracking-wide text-[#1F2C4D] flex items-center gap-3">
                            {orden.patente || "—"}
                            {orden.premium && (
                                <span className="bebas text-xl px-3 py-1 rounded-full bg-[#F6AA0A] text-[#1F2C4D] tracking-wide">
                                    PREMIUM
                                </span>
                            )}
                        </div>
                        <div className="text-2xl text-neutral-500">
                            {VEHICULO_LABEL[orden.vehiculoId] ?? "Vehículo"}
                            {orden.servicios.length === 0 && (
                                <span className="ml-2 text-sm text-neutral-400">
                                    (Sin servicios adicionales)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="bebas font-bold text-[#1F2C4D]">
                        <HoraConPeriodo
                            ts={orden.endAt}
                            horaClassName="text-5xl"
                            periodoClassName="text-lg text-neutral-400 normal-case tracking-normal"
                        />
                    </div>
                    <div className="text-lg mt-1 text-neutral-400 uppercase tracking-wider">
                        Término estimado
                    </div>
                </div>
            </div>

            {/* Barra de progreso - solo si hay servicios */}
            {orden.servicios.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex justify-between text-neutral-500 text-3xl">
                        <span>Progreso</span>
                        <span>{checkedIds.size}/{orden.servicios.length}</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-linear-to-r from-cyan-400 to-green-400 transition-all duration-500"
                            style={{ 
                                width: `${(checkedIds.size / orden.servicios.length) * 100}%` 
                            }}
                        />
                    </div>
                    {todosCompletados && (
                        <div className="text-2xl text-green-500 font-medium flex items-center gap-1.5">
                            <FaCheck size={14} />
                            ¡Todos los servicios completados!
                        </div>
                    )}
                </div>
            )}

            {/* Lista de servicios */}
            {orden.servicios.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                    {orden.servicios.map(servicio => (
                        <ServicioItem
                            key={servicio.id}
                            servicio={servicio}
                            completado={checkedIds.has(servicio.id)}
                            onToggle={() => toggleServicio(servicio.id)}
                            disabled={isUpdating}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-base text-neutral-400 text-center py-3">
                    No hay servicios adicionales para esta orden
                </div>
            )}

            {/* Botón de confirmación final */}
            <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!todosCompletados || isUpdating}
                className={`
                    w-full flex items-center justify-center gap-3 rounded-lg px-6 py-4 
                    bebas text-2xl tracking-wide transition-all touch-manipulation
                    ${todosCompletados && !isUpdating
                        ? 'bg-[#0870C6] text-white hover:bg-[#065a9e] active:scale-[0.98] cursor-pointer'
                        : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    }
                `}
            >
                <FaCheck size={20} />
                {isUpdating ? "Confirmando..." : "Confirmar servicio completo"}
            </button>

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 w-1/2 left-1/2">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xl w-full space-y-6">
                        <div className="bebas text-4xl text-[#1F2C4D] text-center leading-tight">
                            ¿Está seguro que todas las tareas fueron terminadas?
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 rounded-lg border-2 border-neutral-300 text-neutral-500 bebas text-3xl tracking-wide hover:bg-neutral-50 active:scale-[0.98] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    onConfirmarOrden(orden.id);
                                }}
                                className="flex-1 py-3 rounded-lg bg-[#0870C6] text-white bebas text-3xl tracking-wide hover:bg-[#065a9e] active:scale-[0.98] transition-all"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

//
// ======================================================
// COMPONENTE ORDEN COMPACTA
// ======================================================
//

function OrdenCompacta({ orden }: { orden: OrdenProcesada }) {
    return (
        <div className="flex items-center justify-between bg-white border border-neutral-200 shadow-sm rounded-xl px-6 py-4">
            <div className="flex items-center gap-4">
                <div className="w-52">
                <img
                    src={VEHICULO_IMAGE[orden.vehiculoId] || "/auto.png"}
                    alt={VEHICULO_LABEL[orden.vehiculoId] ?? "Vehículo"}
                    className="h-22 object-contain mx-auto"
                />
                </div>
                <div>
                        <div className="bebas text-3xl font-bold leading-none tracking-wide text-[#1F2C4D]">
                        {orden.patente || "—"}
                    </div>
                    <div className="text-base text-neutral-500">
                        {VEHICULO_LABEL[orden.vehiculoId] ?? "Vehículo"}
                        {orden.servicios.length > 0 && (
                            <span className="ml-2 text-3xl text-green-500">
                                ✓ {orden.serviciosCompletados?.length || 0}/{orden.servicios.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 text-[#1F2C4D]">                
                <div className="text-right leading-tight">
                    <div className="flex">
                        <FaClock size={32} className="text-[#1F2C4D]/40" />
                        <div className="bebas font-bold ml-3">
                            <HoraConPeriodo
                                ts={orden.endAt}
                                horaClassName="text-4xl"
                                periodoClassName="text-base text-neutral-400 normal-case tracking-normal"
                            />
                        </div>
                    </div>                    
                    <div className="text-xl mt-2 text-neutral-400 uppercase tracking-wider">
                        Término
                    </div>
                </div>
            </div>
        </div>
    );
}

//
// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
//

export default function TodoList() {
    const queryClient = useQueryClient();
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

    const { data = [] } = useQuery({
        queryKey: ORDERS_QUERY_KEY,
        queryFn: fetchPendientes,
        refetchInterval: 20_000,
    });

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1_000);
        return () => clearInterval(id);
    }, []);

    // Mutation para actualizar servicios completados
    const completarServicioMutation = useMutation({
        mutationFn: async ({ ordenId }: { ordenId: string; }) => {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderId: ordenId
                }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al actualizar servicio');
            }
            return res.json();
        },
        onMutate: ({ ordenId }) => {
            setUpdatingOrderId(ordenId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
        },
        onSettled: () => {
            setUpdatingOrderId(null);
        },
    });

    // Filtrar y ordenar pendientes (sin mutar el array del cache de react-query)
    const pendientes = useMemo(
        () => [...data].sort((a, b) => a.endAt - b.endAt),
        [data]
    );

    const visibles = pendientes.slice(0, MAX_VISIBLE);
    const restantes = pendientes.slice(MAX_VISIBLE);

    const sumaDuracionesRestantes = useMemo(
        () => restantes.reduce((acc, o) => acc + o.duracionMins, 0),
        [restantes]
    );
    const horaFinCola = now + sumaDuracionesRestantes * 60 * 1000;

    const handleConfirmarTerminoOrden = (ordenId: string) => {
        completarServicioMutation.mutate({ ordenId });
    }

    return (
        <div className="h-full w-full flex flex-col bg-[#FCFCFC] text-neutral-950 p-8">
            {/* HEADER */}
            <div className="flex items-center justify-between bg-[#1F2C4D] text-white px-8 py-6 rounded-xl shrink-0">
                <div className="bebas text-5xl font-bold tracking-widest text-[#F6AA0A]">
                    EN PROCESO
                </div>
                <div className="flex items-center gap-3 text-neutral-200">
                    <FaCarSide size={56} />
                    <span className="text-5xl font-bold">{pendientes.length}</span>
                </div>
            </div>

            {/* LISTA */}
            <div className="flex-1 mt-4 space-y-3 overflow-y-auto">
                {visibles.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                        <FaCarSide size={128} />
                        <p className="mt-4 text-5xl text-center">sin vehículos<br/>en proceso</p>
                    </div>
                )}

                {visibles.map((orden, index) => {
                    const isFirst = index === 0;
                    const isUpdating = updatingOrderId === orden.id;
                    
                    const allCompleted = orden.servicios.length > 0 && 
                        orden.servicios.every(s => 
                            (orden.serviciosCompletados || []).includes(s.id)
                        );

                    if (isFirst && !allCompleted) {
                        return (
                            <OrdenExpandida
                                key={orden.id}
                                orden={orden}
                                onConfirmarOrden={handleConfirmarTerminoOrden}
                                isUpdating={isUpdating}
                            />
                        );
                    }

                    return (
                        <OrdenCompacta key={orden.id} orden={orden} />
                    );
                })}
            </div>

            {/* RESTANTES */}
            {restantes.length > 0 && (
                <div className="mt-4 flex items-center justify-between bg-[#1F2C4D] text-white px-8 py-6 rounded-xl shrink-0">
                    <div className="text-4xl">
                        <span className="bebas text-6xl font-bold text-[#F6AA0A] mr-5">
                            +{restantes.length}
                        </span>
                        vehículos en espera
                    </div>
                    <div className="text-right leading-tight">
                        <div className="bebas font-bold text-[#F6AA0A]">
                            <HoraConPeriodo
                                ts={horaFinCola}
                                horaClassName="text-5xl"
                                periodoClassName="text-lg text-[#F6AA0A]/60 normal-case tracking-normal"
                            />
                        </div>
                        <div className="text-2xl text-neutral-300 uppercase tracking-wider">
                            Estimado fin de cola
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}