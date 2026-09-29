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
  return <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl text-neutral-900 shadow-md">
    <div className="flex shrink-0 items-center rounded-t-xl bg-[#015796] px-4 py-2 text-center text-white">
      <BsStars className="text-3xl" />
      <span className="ml-4 text-4xl font-bold">ADICIONALES</span>
    </div>
    <div className="flex min-h-0 flex-1 flex-col">
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
              className={`flex min-h-0 flex-1 items-center justify-between border-2 px-4 py-2 cursor-pointer transition-all
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
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${checked ? 'bg-[#0870C6]' : 'border-2 border-gray-300'}`}>
                  {checked && <FaCheck size={28} className="text-[#ADCCE6]" />}
                </div>
                {servicio.icon && <div className={`shrink-0 text-4xl ${checked ? 'text-[#0870C6]' : 'text-gray-300'}`}>{servicio.icon}</div>}
                <div className="min-w-0">
                  <div className="oswald truncate text-2xl leading-tight">{servicio.nombre}</div>
                  <div className="truncate text-lg text-neutral-400">{servicio.detalle}</div>
                </div>
              </div>

              <div className={`bebas shrink-0 whitespace-nowrap pl-2 text-4xl font-bold ${checked ? 'text-[#0870C6]' : 'text-neutral-400'}`}>
                $ {servicio.precio.toLocaleString("es-CL")}
              </div>
            </div>
          );
        }
      )}
    </div>
  </div>
}