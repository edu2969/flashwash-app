import { FaCar } from "react-icons/fa";
import { Vehiculo, VehiculoId } from "./types";
import { Dispatch, SetStateAction } from "react";

export default function SelectorTipoVehiculo({
    vehiculoSeleccionado,
    onSelected,
    vehiculos
}: {
    vehiculoSeleccionado: VehiculoId | null;
    onSelected: Dispatch<SetStateAction<VehiculoId | null>>;
    vehiculos: Vehiculo[];
}) {
    return <div className="text-neutral-900">
        <div className="flex items-center gap-3 bg-[#1F2C4D] text-white p-4 rounded-3xl rounded-b-none">
            <FaCar className="text-cyan-400 text-4xl" />

            <h2
                className={`bebas text-4xl tracking-wide`}
            >
                Categoría Vehículo
            </h2>
        </div>

        <div className="grid md:grid-cols-3">
            {vehiculos.map(
                (vehiculo, index) => {
                    const selected =
                        vehiculoSeleccionado ===
                        vehiculo.id;

                    const isLast = index === vehiculos.length - 1;

                    return (
                        <button
                            key={vehiculo.id}
                            onClick={() =>
                                onSelected(vehiculo.id)
                            }
                            className={`w-full flex overflow-hidden border transition-all duration-300 hover:scale-[1.02] border-t-0 
                    ${selected
                                    ? "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.45)]"
                                    : "border-neutral-700 grayscale-50"
                                }
                                ${isLast && "rounded-b-3xl"}
                  `}
                        >
                            <div className="w-4/12 text-neutral-950 pl-2">
                                <img
                                    src={
                                        selected
                                            ? vehiculo.imageOn
                                            : vehiculo.imageOff
                                    }
                                    alt={
                                        vehiculo.nombre
                                    }
                                    className="h-18 object-contain mx-auto"
                                />
                            </div>

                            <div className={`${selected ? 'font-bold' : 'font-normal'} w-4/12 flex p-2 text-left text-neutral-900`}>
                                <div>
                                    <h3
                                        className={`bebas text-xl`}
                                    >
                                        {
                                            vehiculo.nombre
                                        }
                                    </h3>

                                    <p className="text-sm text-neutral-400 min-h-10">
                                        {
                                            vehiculo.descripcion
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="w-4/12">
                            <div
                                    className={`${selected ? 'text-cyan-500' : 'text-neutral-400'} w-full bebas text-4xl mt-4 text-right pr-2`}
                                >
                                    $
                                    {vehiculo.precio.toLocaleString(
                                        "es-CL"
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                }
            )}
        </div>
    </div>
}