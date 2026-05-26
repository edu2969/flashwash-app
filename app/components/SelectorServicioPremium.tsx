import { FaCheckCircle } from "react-icons/fa";

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
          className={`w-full rounded-3xl p-6 border transition-all duration-300
          ${
            premium
              ? "bg-[#1F2C4D] border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.5)] text-white"
              : "text-neutral-900 border-neutral-700"
          }
        `}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div
                className={`bebas text-5xl`}
              >
                Servicio Premium
              </div>

              <div className="text-neutral-400">
                Cerámico
              </div>
            </div>

            <div className="flex items-center gap-4">
              {premium && (
                <FaCheckCircle className="text-cyan-400 text-3xl" />
              )}

              <div
                className={`bebas text-6xl ${
                  premium
                    ? "text-cyan-400"
                    : "text-neutral-400"
                }`}
              >
                $2.000
              </div>
            </div>
          </div>
        </button>
}