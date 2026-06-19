//
// ======================================================
// TIPOS
// ======================================================
//

import { ReactElement } from "react";
import { IconType } from "react-icons";

export type VehiculoId =
  | "auto"
  | "suv"
  | "grande";

export interface Vehiculo {
  id: VehiculoId;
  nombre: string;
  descripcion: string;
  precio: number;
  image: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  detalle: string;
  precio: number;
  icon?: ReactElement;
}