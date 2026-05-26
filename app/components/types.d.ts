//
// ======================================================
// TIPOS
// ======================================================
//

export type VehiculoId =
  | "auto"
  | "suv"
  | "grande";

export interface Vehiculo {
  id: VehiculoId;
  nombre: string;
  descripcion: string;
  precio: number;

  imageOn: string;
  imageOff: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  detalle: string;
  precio: number;
}