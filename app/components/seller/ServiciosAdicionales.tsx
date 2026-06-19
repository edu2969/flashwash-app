import { FaCar, FaCheck } from "react-icons/fa";
import { Servicio } from "../types";
import { BsStars } from "react-icons/bs";
import { MdCheckBox } from "react-icons/md";

export default function ServiciosAdicionales({
  adicionales,
  serviciosSeleccionados,
  toggleServicio
}: {
  adicionales: Servicio[];
  serviciosSeleccionados: string[];
  toggleServicio: (id: string) => void;
}) {
  return <div className="text-neutral-900 shadow-md rounded-xl">
    <div className={`flex text-center text-2xl bg-[#015796] text-white px-4 py-2.5 rounded-t-xl`}>
      <BsStars className="text-white text-2xl" />
      <span className="ml-8 font-bold">ADICIONALES</span>
    </div>
    <div>
      {adicionales.map(
        (servicio, index) => {
          const checked =
            serviciosSeleccionados.includes(
              servicio.id
            );

          const isLast = index === adicionales.length - 1;

          return (
            <div
              key={servicio.id}
              className={`flex items-center justify-between border px-4 py-1 cursor-pointer transition-all
                        ${checked
                  ? "border-[#ADCCE6] bg-[#E8F0F5]"
                  : "border-gray-200 text-neutral-950"
                }
                ${isLast && "rounded-b-xl"}
                      `}
                      onClick={() => {
                        toggleServicio(servicio.id);
                      }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-md p-2 ${checked ? 'bg-[#0870C6]' : 'border-2 border-gray-300'}`}>
                  {checked && <FaCheck size={16} className="text-[#ADCCE6]" />}
                </div>
                {servicio.icon && <div className={`text-3xl ${checked ? 'text-[#0870C6]' : 'text-gray-300'}`}>{servicio.icon}</div>}
                <div>
                  <div className={`oswald text-sm`}>{servicio.nombre}</div>
                  <div className="text-xs text-neutral-400">{servicio.detalle}</div>
                </div>
              </div>

              <div className={`bebas text-2xl font-bold ${checked ? 'text-[#0870C6]' : 'text-neutral-400'}`}>
                $ {servicio.precio.toLocaleString("es-CL")}
              </div>
            </div>
          );
        }
      )}
    </div>
  </div>
}