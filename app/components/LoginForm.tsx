"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useForm } from 'react-hook-form';

interface LoginProps {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginProps>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginProps) => {
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result?.error ?? "Error al autenticar");
      return;
    }

    const session = await getSession();
    console.log("SESSION?", session);
    const role = session?.user.role;
    console.log("ROLE", role);
    if (role === "OPERADOR") {
      router.push("/seller");
    } else if(role === "ADMINISTRADOR") {
      router.push("/dashboard");
    } else if(role === "MARKETING") {
      router.push("/marketing")
    } else {
      setError("Sin perfil");
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-[#F7FAFC] via-white to-[#EAF4FA] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* CARD */}

        <div className="bg-white rounded-4xl shadow-[0_20px_60px_rgba(7,30,51,0.12)] border border-[#D9E8F2] overflow-hidden">
          {/* TOP */}

          <div className="h-3 w-full bg-linear-to-r from-[#0890C9] via-[#0BA9E8] to-[#F5BD3C]" />

          <div className="px-8 py-10">
            {/* LOGO */}

            <div className="flex justify-center">
              <Image
                src="/logo_full.png"
                alt="Logo"
                width={240}
                height={80}
                priority
                className="h-auto w-auto max-w-55 md:max-w-65"
              />
            </div>

            {/* TITLE */}

            <div className="mt-8 text-center">
              <p className="text-[#5B7186] mt-2 text-sm md:text-base">
                Plataforma de acceso
              </p>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-10 space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label className="text-sm font-semibold text-[#071E33] block mb-2">
                  Correo Electrónico
                </label>

                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0890C9] text-lg" />

                  <input
                    type="email"
                    {...register('email', { required: true })}
                    placeholder="correo@empresa.cl"
                    className="w-full h-14 rounded-2xl border border-[#D6E6EF] bg-[#F8FCFF] pl-12 pr-4 text-[#071E33] placeholder:text-[#8AA1B3] outline-none transition-all focus:border-[#0890C9] focus:ring-4 focus:ring-[#0890C9]/15"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="text-sm font-semibold text-[#071E33] block mb-2">
                  Contraseña
                </label>

                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0890C9] text-lg" />

                  <input
                    type="password"
                    {...register('password', { required: true })}
                    placeholder="••••••••"
                    className="w-full h-14 rounded-2xl border border-[#D6E6EF] bg-[#F8FCFF] pl-12 pr-4 text-[#071E33] placeholder:text-[#8AA1B3] outline-none transition-all focus:border-[#0890C9] focus:ring-4 focus:ring-[#0890C9]/15"
                    required
                  />
                </div>
              </div>

              {/* FORGOT */}

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-[#0890C9] hover:text-[#071E33] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-14 rounded-2xl bg-[#071E33] hover:bg-[#0890C9] transition-all duration-300 flex items-center justify-center gap-3 text-white font-bold text-lg shadow-[0_10px_25px_rgba(8,144,201,0.25)] disabled:opacity-70"
              >
                {loading
                  ? "Ingresando..."
                  : "Ingresar"}

                {!loading && (
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>
          </div>

          {/* BOTTOM */}

          <div className="px-8 py-2 bg-[#F8FBFD] border-t border-[#E3EEF5] text-center">
            <p className="text-sm text-[#6B8295]">
              {error !== null ? <span className="text-orange-600">{error}</span> : <>Powered by yGa</>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}