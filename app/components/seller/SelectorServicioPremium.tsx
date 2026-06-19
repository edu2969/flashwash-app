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
          className={`w-full rounded-xl p-6 transition-all duration-300 shadow-md
          ${
            premium
              ? "bg-[#1F2C4D] border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.5)] text-white"
              : "text-neutral-900 border-neutral-700"
          }
        `}
        >
          <div className="flex items-center justify-between">
            <FaStar size={24} className="w-10 h-10 bg-[#FCF5EB] text-[#F6AA0A] p-2 rounded-md" />
            <div className="text-left">
              <div className={`bebas text-xl font-bold`}>Servicio Premium</div>
              <div className="text-neutral-400">
                Cerámico
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`bebas text-2xl font-bold ${
                  premium
                    ? "text-[#F6AA0A]"
                    : "text-neutral-400"
                }`}>$2.000</div>
            </div>
          </div>
        </button>
}