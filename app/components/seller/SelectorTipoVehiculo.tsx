import { FaCar, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { Vehiculo, VehiculoId } from "../types";
import { Dispatch, SetStateAction } from "react";

export default function SelectorTipoVehiculo({
    vehiculoSeleccionado,
    onSelected,
    patente,
    setPatente,
    patenteValida,
    vehiculos
}: {
    vehiculoSeleccionado: VehiculoId | null;
    onSelected: Dispatch<SetStateAction<VehiculoId | null>>;
    patente: string;
    setPatente: Dispatch<SetStateAction<string>>;
    patenteValida: boolean;
    vehiculos: Vehiculo[];
}) {
    // Marco rojo cuando hay texto ingresado y no cumple el formato de patente chilena
    const patenteInvalida = patente.length > 0 && !patenteValida;

    return <div className="shrink-0 rounded-lg text-neutral-900 shadow-md">
        <div className="flex items-center gap-3 rounded-b-none rounded-xl bg-[#015796] px-5 py-2 text-white">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                <FaCar className="text-5xl text-[#F6AA0A]" />
            </div>
            <div className={`flex bebas w-full`} >
                <span className="mx-3 self-center text-4xl font-bold tracking-wide">PATENTE</span>
                <input
                    type="text"
                    value={patente}
                    onChange={(e) => setPatente(e.currentTarget.value.toUpperCase())}
                    maxLength={6}
                    placeholder="BBBB12"
                    className={`ml-2 w-full rounded-md border-2 bg-white px-3 py-2 text-3xl text-neutral-900 uppercase ${patenteInvalida ? "border-red-500" : "border-gray-300"}`}
                />
            </div>
        </div>

        <div className="w-full space-y-1">
            {vehiculos.map(
                (vehiculo) => {
                    const selected =
                        vehiculoSeleccionado ===
                        vehiculo.id;

                    return (
                        <button
                            key={vehiculo.id}
                            onClick={() =>
                                onSelected(vehiculo.id)
                            }
                            className={`h-[clamp(6.25rem,8.2dvh,7.25rem)] w-full rounded-lg border-2 transition-all duration-300
                    ${selected
                                    ? "bg-[#FCF5EB] border-[#F6AA0A]"
                                    : "border-neutral-300"
                                }
                  `}
                        >
                            <div className="w-full flex">
                                <div className="flex w-4/12 items-center pl-2 text-neutral-950">
                                    <img
                                        src={vehiculo.image}
                                        alt={vehiculo.nombre}
                                        className="h-24 max-w-full object-contain mx-auto"
                                    />
                                </div>

                                <div className={`${selected ? 'font-bold' : 'font-normal'} flex w-4/12 items-center p-2 text-left text-neutral-900`}>
                                    <div className="min-w-0">
                                        <h3
                                            className="bebas text-4xl leading-none"
                                        >
                                            {
                                                vehiculo.nombre
                                            }
                                        </h3>

                                        <p className="mt-1 text-xl leading-tight text-neutral-800">
                                            {
                                                vehiculo.descripcion
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="relative w-4/12">
                                    {selected ? <FaCheckCircle className="absolute right-2 top-2 text-4xl text-[#F6AA0A]" />
                                        : <FaRegCircle className="absolute right-2 top-2 text-4xl text-gray-200" />}
                                    <div
                                        className={`${selected ? 'text-[#F6AA0A]' : 'text-neutral-700'} absolute inset-x-0 bottom-2 bebas pr-2 text-right text-5xl font-bold leading-none`}
                                    >
                                        $
                                        {vehiculo.precio.toLocaleString(
                                            "es-CL"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                }
            )}
        </div>
    </div>
}