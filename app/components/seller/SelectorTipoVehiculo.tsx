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

    return <div className="text-neutral-900 shadow-md rounded-lg">
        <div className="flex items-center gap-3 bg-[#015796] text-white px-4 py-2 rounded-xl rounded-b-none">
            <div className="w-10 h-10">
                <FaCar className="text-[#F6AA0A] text-4xl" />
            </div>
            <div className={`flex bebas w-full`} >
                <span className="text-2xl tracking-wide ml-3 font-bold">PATENTE: </span>
                <input
                    type="text"
                    value={patente}
                    onChange={(e) => setPatente(e.currentTarget.value.toUpperCase())}
                    maxLength={6}
                    placeholder="BBBB12"
                    className={`w-full bg-white border-2 rounded-md ml-2 text-neutral-900 uppercase px-2 ${
                        patenteInvalida ? "border-red-500" : "border-gray-300"
                    }`}
                />
            </div>
        </div>

        <div className="grid md:grid-cols-3">
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
                            className={`flex overflow-hidden transition-all duration-300 m-1 border-2 rounded-lg
                    ${selected
                                    ? "bg-[#FCF5EB] border-[#F6AA0A]"
                                    : "border-neutral-300"
                                }
                  `}
                        >
                            <div className="w-4/12 text-neutral-950 pl-2">
                                <img
                                    src={vehiculo.image}
                                    alt={vehiculo.nombre}
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

                                    <p className="text-xs text-neutral-800 min-h-10">
                                        {
                                            vehiculo.descripcion
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="w-4/12 relative right-8">                                
                                    {selected ? <FaCheckCircle className={`absolute text-[#F6AA0A] text-3xl mr-0 -right-6 top-2`} />
                                    : <FaRegCircle className={`absolute text-gray-200 text-3xl mr-0 -right-6 top-2`}/>}
                                    <div
                                        className={`${selected ? 'text-[#F6AA0A]' : 'text-neutral-700'} absolute right-0 top-4 bebas text-3xl mt-4 text-right pr-2 font-bold`}
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