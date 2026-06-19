import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMINISTRADOR" | "OPERADOR";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMINISTRADOR" | "OPERADOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMINISTRADOR" | "OPERADOR";
  }
}