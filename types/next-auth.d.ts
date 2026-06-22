import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMINISTRADOR" | "OPERADOR" | "MARKETING";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMINISTRADOR" | "OPERADOR" | "MARKETING";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMINISTRADOR" | "OPERADOR" | "MARKETING";
  }
}