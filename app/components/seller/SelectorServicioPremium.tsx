import { FaCheck, FaCheckCircle, FaStar } from "react-icons/fa";

export default function SelectorServicioPremium({
    premium,
    setPremium,
}: {
    premium: boolean;
    setPremium: (value: boolean) => void;
}) {
    return <button
          onClick={() =>
            setPremium(!premium)
          }
          className={`w-full shrink-0 rounded-xl px-5 py-3 transition-all duration-300 shadow-md
          ${
            premium
              ? "bg-[#1F2C4D] border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.5)] text-white"
              : "text-neutral-900 border-neutral-700"
          }
        `}
        >
          <div className="flex items-center justify-between">
            <FaStar size={20} className={`${premium ? 'bg-[#1F2C4D]' : 'bg-[#FCF5EB]'} h-16 w-16 shrink-0 rounded-md p-2 text-[#F6AA0A]`} />
            <div className="flex text-left">
              <div className="bebas text-4xl font-bold leading-tight">Servicio<br/>Premium</div>
              <div className="mt-5 ml-4 mr-6 text-2xl text-neutral-400">
                Cerámico
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`bebas whitespace-nowrap text-5xl font-bold ${
                  premium
                    ? "text-[#F6AA0A]"
                    : "text-neutral-400"
                }`}>$2.000</div>
            </div>
          </div>
        </button>
}