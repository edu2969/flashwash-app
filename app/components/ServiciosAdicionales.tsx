import { FaCar } from "react-icons/fa";
import { Servicio } from "./types";

export default function ServiciosAdicionales({
    adicionales,
    serviciosSeleccionados,
    toggleServicio
}: {
    adicionales: Servicio[];
    serviciosSeleccionados: string[];
    toggleServicio: (id: string) => void;
}) {
    return <div className="text-neutral-900 border border-[#1F2C4D]/30 rounded-3xl shadow-2xl ">
              <h2
                className={`flex bebas text-4xl bg-[#1F2C4D] text-white rounded-t-3xl p-4`}
              >
                <FaCar className="text-cyan-400 text-4xl mr-4" />
                Servicios adicionales
              </h2>
    
              <div>
                {adicionales.map(
                  (servicio, index) => {
                    const checked =
                      serviciosSeleccionados.includes(
                        servicio.id
                      );

                      const isLast = index === adicionales.length - 1;
    
                    return (
                      <label
                        key={servicio.id}
                        className={`flex items-center justify-between border px-4 py-1 cursor-pointer transition-all border-t-none 
                        ${
                          checked
                            ? "border-cyan-400 bg-[#1F2C4D]/10"
                            : "border-neutral-700 text-neutral-950"
                        }
                        ${isLast ? 'rounded-2xl rounded-t-none' : ''}
                      `}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleServicio(
                                servicio.id
                              )
                            }
                            className="w-8 h-8 accent-cyan-400"
                          />
    
                          <div>
                            <div
                              className={`oswald text-lg`}
                            >
                              {
                                servicio.nombre
                              }
                            </div>
    
                            <div className="text-sm text-neutral-400">
                              {
                                servicio.detalle
                              }
                            </div>
                          </div>
                        </div>
    
                        <div
                          className={`bebas text-3xl ${checked ? 'text-cyan-400' : 'text-neutral-400'}`}
                        >
                          $
                          {servicio.precio.toLocaleString(
                            "es-CL"
                          )}
                        </div>
                      </label>
                    );
                  }
                )}
              </div>
            </div>
}