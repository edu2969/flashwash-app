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
            <FaStar size={24} className={`${premium ? 'bg-[#1F2C4D]' : 'bg-[#FCF5EB]'} w-24 h-24 text-[#F6AA0A] p-2 rounded-md`} />
            <div className="flex text-left">
              <div className={`bebas text-6xl font-bold`}>Servicio<br/>Premium</div>
              <div className="text-neutral-400 text-5xl mt-18 ml-6 mr-14">
                Cerámico
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`bebas text-7xl font-bold ${
                  premium
                    ? "text-[#F6AA0A]"
                    : "text-neutral-400"
                }`}>$2.000</div>
            </div>
          </div>
        </button>
}