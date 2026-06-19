"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as d3 from "d3";

import {
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  DashboardDayData,
  DIAS_SEMANA,
  indiceDiaSemana,
} from "./dashboard-types";
import Image from "next/image";

//
// ======================================================
// TYPES
// ======================================================
//

type ViewMode = "week" | "day";

interface Totales {
  sedan: number;
  suv: number;
  grande: number;
  total: number;
}

// Promedio de vehículos atendidos para un
// día de la semana (ej: el promedio de
// todos los lunes del intervalo).
interface PromedioDiaSemana {
  dia: string;
  sedan: number;
  suv: number;
  grande: number;
  total: number;
  muestras: number; // cuántas fechas se promediaron
}

//
// ======================================================
// HELPERS DE FECHA
// ======================================================
//

// Fecha local en formato "YYYY-MM-DD".
function isoDate(d: Date): string {
  const pad = (n: number) =>
    String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(
    d.getMonth() + 1
  )}-${pad(d.getDate())}`;
}

function diasAtras(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

//
// ======================================================
// COMPONENT
// ======================================================
//

export default function Dashboard() {
  const [viewMode, setViewMode] =
    useState<ViewMode>("week");

  //
  // FECHAS
  //
  // Por defecto: últimos 7 días hasta hoy.
  //

  const [fechaInicio, setFechaInicio] =
    useState(
      () => isoDate(diasAtras(6))
    );

  const [fechaFin, setFechaFin] =
    useState(() => isoDate(new Date()));

  //
  // DATA (real, desde /api/bi/days)
  //

  const [filteredData, setFilteredData] =
    useState<DashboardDayData[]>([]);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      fechaInicio > fechaFin
    ) {
      setFilteredData([]);
      setError(
        "La fecha de inicio no puede ser posterior a la fecha de fin"
      );
      return;
    }

    let cancelado = false;

    setCargando(true);
    setError(null);

    fetch(
      `/api/bi/days?from=${fechaInicio}&to=${fechaFin}`
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            `Error ${res.status}`
          );
        }

        return res.json();
      })
      .then(
        (json: {
          days: DashboardDayData[];
        }) => {
          if (cancelado) return;

          setFilteredData(
            json.days ?? []
          );
        }
      )
      .catch(() => {
        if (cancelado) return;

        setFilteredData([]);
        setError(
          "No se pudieron cargar los datos del dashboard"
        );
      })
      .finally(() => {
        if (!cancelado)
          setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [fechaInicio, fechaFin]);

  //
  // TOTALES
  //

  const totales = useMemo<Totales>(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.sedan += item.ingresos.sedan;
        acc.suv += item.ingresos.suv;
        acc.grande += item.ingresos.grande;
        acc.total += item.ingresos.total;

        return acc;
      },
      {
        sedan: 0,
        suv: 0,
        grande: 0,
        total: 0,
      }
    );
  }, [filteredData]);

  //
  // PROMEDIO POR DIA DE SEMANA
  //
  // Agrupa las fechas del intervalo por su
  // día de la semana (lunes..domingo) y
  // calcula el promedio de vehículos
  // atendidos por tipo. Así se ve qué días
  // se atienden más autos.
  //

  const promediosPorDia = useMemo<
    PromedioDiaSemana[]
  >(() => {
    const acc = DIAS_SEMANA.map(
      (dia) => ({
        dia,
        sedan: 0,
        suv: 0,
        grande: 0,
        total: 0,
        muestras: 0,
      })
    );

    for (const item of filteredData) {
      const a =
        acc[indiceDiaSemana(item.date)];

      a.sedan += item.cantidad.sedan;
      a.suv += item.cantidad.suv;
      a.grande += item.cantidad.grande;
      a.total += item.cantidad.total;
      a.muestras += 1;
    }

    return acc.map((a) =>
      a.muestras === 0
        ? a
        : {
            ...a,
            sedan: a.sedan / a.muestras,
            suv: a.suv / a.muestras,
            grande:
              a.grande / a.muestras,
            total: a.total / a.muestras,
          }
    );
  }, [filteredData]);

  return (
    <div className="w-full min-h-screen bg-[#081120] text-white p-6">
      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <FaChartLine className="text-cyan-400 text-5xl" />

            <h1 className="bebas text-6xl tracking-wide">
              Dashboard Lavados
            </h1>
          </div>

          <p className="text-neutral-400 mt-2">
            Operación vehículos y
            totalizadores
          </p>
        </div>

        {/* FILTROS */}

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Fecha Inicio
            </label>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) =>
                setFechaInicio(
                  e.target.value
                )
              }
              className="bg-[#121F36] border border-neutral-700 rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Fecha Fin
            </label>

            <input
              type="date"
              value={fechaFin}
              onChange={(e) =>
                setFechaFin(
                  e.target.value
                )
              }
              className="bg-[#121F36] border border-neutral-700 rounded-xl px-4 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-400 block mb-1">
              Vista
            </label>

            <div className="flex bg-[#121F36] rounded-xl overflow-hidden border border-neutral-700">
              <button
                onClick={() =>
                  setViewMode("week")
                }
                className={`px-5 py-2 transition-all ${
                  viewMode === "week"
                    ? "bg-cyan-500 text-black font-bold"
                    : "text-neutral-300"
                }`}
              >
                Semana
              </button>

              <button
                onClick={() =>
                  setViewMode("day")
                }
                className={`px-5 py-2 transition-all ${
                  viewMode === "day"
                    ? "bg-cyan-500 text-black font-bold"
                    : "text-neutral-300"
                }`}
              >
                Día
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TOTALES */}

      <div className="grid md:grid-cols-4 gap-2 mt-4">
        <CardTotal
          title="SEDAN"
          value={totales.sedan}
          icon={<Image src="/sedan.png" width={80} height={20} alt="sedan_img"/>}
        />

        <CardTotal
          title="SUV"
          value={totales.suv}
          icon={<Image src="/suv.png" width={80} height={20} alt="sedan_img"/>}
        />

        <CardTotal
          title="GRANDE"
          value={totales.grande}
          icon={<Image src="/grande.png" width={80} height={20} alt="sedan_img"/>}
        />

        <CardTotal
          title="TOTAL"
          value={totales.total}
          icon={<FaChartLine />}
          big
        />
      </div>

      {/* GRAFICOS */}

      <div className="mt-2 bg-[#101B2E] border border-neutral-800 rounded-3xl p-6 overflow-x-auto">
        {error ? (
          <div className="py-20 text-center text-red-400">
            {error}
          </div>
        ) : cargando ? (
          <div className="py-20 text-center text-neutral-400 animate-pulse">
            Cargando datos…
          </div>
        ) : viewMode === "week" ? (
          <LineChart data={filteredData} />
        ) : (
          <PromedioChart data={promediosPorDia} />
        )}
      </div>
    </div>
  );
}

//
// ======================================================
// LINE CHART
// ======================================================
//

interface LineChartProps {
  data: DashboardDayData[];
}

function LineChart({
  data,
}: LineChartProps) {
  const ref =
    useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);

    svg.selectAll("*").remove();

    const width = 1100;

    const height = 420;

    const margin = {
      top: 20,
      right: 30,
      bottom: 50,
      left: 60,
    };

    const innerWidth =
      width -
      margin.left -
      margin.right;

    const innerHeight =
      height -
      margin.top -
      margin.bottom;

    svg
      .attr(
        "viewBox",
        `0 0 ${width} ${height}`
      )
      .attr(
        "preserveAspectRatio",
        "xMidYMid meet"
      );

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`
      );

    //
    // X
    //

    const x = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.date))
      .range([0, innerWidth]);

    //
    // Y
    //

    const maxY =
      d3.max(data, (d) =>
        Math.max(
          d.cantidad.total,
          d.cantidad.sedan,
          d.cantidad.suv,
          d.cantidad.grande
        )
      ) || 0;

    const y = d3
      .scaleLinear()
      .domain([0, maxY + 10])
      .range([innerHeight, 0]);

    //
    // AXIS
    //

    g.append("g")
      .attr(
        "transform",
        `translate(0,${innerHeight})`
      )
      .call(d3.axisBottom(x));

    g.append("g").call(
      d3.axisLeft(y)
    );

    //
    // GRID
    //

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#1E293B");

    //
    // LINES
    //

    const lines = [
      {
        color: "#06B6D4",
        accessor: (
          d: DashboardDayData
        ) => d.cantidad.sedan,
      },

      {
        color: "#22C55E",
        accessor: (
          d: DashboardDayData
        ) => d.cantidad.suv,
      },

      {
        color: "#F97316",
        accessor: (
          d: DashboardDayData
        ) => d.cantidad.grande,
      },

      {
        color: "#E2E8F0",
        accessor: (
          d: DashboardDayData
        ) => d.cantidad.total,
      },
    ];

    lines.forEach((lineData) => {
      const line = d3
        .line<DashboardDayData>()
        .x(
          (d) =>
            x(d.date) ?? 0
        )
        .y((d) =>
          y(lineData.accessor(d))
        )
        .curve(
          d3.curveMonotoneX
        );

      //
      // PATH
      //

      g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr(
          "stroke",
          lineData.color
        )
        .attr("stroke-width", 3)
        .attr("d", line);

      //
      // POINTS
      //

      g.selectAll(null)
        .data(data)
        .enter()
        .append("circle")
        .attr(
          "cx",
          (d) =>
            x(d.date) ?? 0
        )
        .attr(
          "cy",
          (d) =>
            y(
              lineData.accessor(
                d
              )
            )
        )
        .attr("r", 5)
        .attr(
          "fill",
          lineData.color
        );
    });
  }, [data]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <FaCalendarAlt className="text-cyan-400 text-2xl" />

        <h2 className="bebas text-4xl">
          Operaciones Semanales
        </h2>
      </div>

      <svg
        ref={ref}
        className="w-full h-80"
      />
    </div>
  );
}

//
// ======================================================
// PROMEDIO CHART
// ======================================================
//
// Barras agrupadas por día de la semana.
// Cada grupo (lunes..domingo) tiene una
// barra por tipo de vehículo más el total,
// con el promedio de autos atendidos ese
// día dentro del intervalo seleccionado.
//

const SUBGRUPOS = [
  { key: "Sedan", color: "#06B6D4" },
  { key: "SUV", color: "#22C55E" },
  { key: "Grande", color: "#F97316" },
  { key: "Total", color: "#E2E8F0" },
];

function PromedioChart({
  data,
}: {
  data: PromedioDiaSemana[];
}) {
  const ref =
    useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);

    svg.selectAll("*").remove();

    const width = 1100;

    const height = 420;

    const margin = {
      top: 20,
      right: 30,
      bottom: 50,
      left: 60,
    };

    const innerWidth =
      width -
      margin.left -
      margin.right;

    const innerHeight =
      height -
      margin.top -
      margin.bottom;

    svg
      .attr(
        "viewBox",
        `0 0 ${width} ${height}`
      )
      .attr(
        "preserveAspectRatio",
        "xMidYMid meet"
      );

    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`
      );

    //
    // SOLO DIAS CON DATOS
    //

    const dias = data.filter(
      (d) => d.muestras > 0
    );

    const subgroups = SUBGRUPOS.map(
      (s) => s.key
    );

    //
    // X (día de semana) + X interna (tipo)
    //

    const x = d3
      .scaleBand()
      .domain(dias.map((d) => d.dia))
      .range([0, innerWidth])
      .padding(0.2);

    const xSub = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding(0.08);

    //
    // Y
    //

    const max =
      d3.max(dias, (d) =>
        Math.max(
          d.total,
          d.sedan,
          d.suv,
          d.grande
        )
      ) || 0;

    const y = d3
      .scaleLinear()
      .domain([0, max])
      .nice()
      .range([innerHeight, 0]);

    //
    // COLORS
    //

    const color = d3
      .scaleOrdinal<string>()
      .domain(subgroups)
      .range(
        SUBGRUPOS.map((s) => s.color)
      );

    //
    // GRID
    //

    g.append("g")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#1E293B");

    //
    // AXIS
    //

    g.append("g")
      .attr(
        "transform",
        `translate(0,${innerHeight})`
      )
      .call(d3.axisBottom(x));

    g.append("g").call(
      d3.axisLeft(y).ticks(6)
    );

    //
    // BARS (agrupadas por día)
    //

    const grupo = g
      .selectAll("g.dia")
      .data(dias)
      .enter()
      .append("g")
      .attr("class", "dia")
      .attr(
        "transform",
        (d) =>
          `translate(${x(d.dia) ?? 0},0)`
      );

    grupo
      .selectAll("rect")
      .data((d) => [
        { key: "Sedan", value: d.sedan },
        { key: "SUV", value: d.suv },
        {
          key: "Grande",
          value: d.grande,
        },
        { key: "Total", value: d.total },
      ])
      .enter()
      .append("rect")
      .attr(
        "x",
        (d) => xSub(d.key) ?? 0
      )
      .attr("y", (d) => y(d.value))
      .attr("width", xSub.bandwidth())
      .attr(
        "height",
        (d) =>
          innerHeight - y(d.value)
      )
      .attr("rx", 3)
      .attr(
        "fill",
        (d) => color(d.key)
      );
  }, [data]);

  const conDatos = data.some(
    (d) => d.muestras > 0
  );

  if (!conDatos) {
    return (
      <div className="py-20 text-center text-neutral-400">
        No hay datos en el intervalo
        seleccionado
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-cyan-400 text-2xl" />

          <h2 className="bebas text-4xl">
            Promedio por Día de Semana
          </h2>
        </div>

        {/* LEYENDA */}

        <div className="flex flex-wrap items-center gap-4">
          {SUBGRUPOS.map((s) => (
            <div
              key={s.key}
              className="flex items-center gap-2"
            >
              <span
                className="inline-block w-4 h-4 rounded"
                style={{
                  backgroundColor:
                    s.color,
                }}
              />
              <span className="text-neutral-300 text-sm">
                {s.key}
              </span>
            </div>
          ))}
        </div>
      </div>

      <svg
        ref={ref}
        className="w-full h-80"
      />

      {/* DETALLE DE MUESTRAS */}

      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-neutral-500">
        {data
          .filter((d) => d.muestras > 0)
          .map((d) => (
            <span key={d.dia}>
              {d.dia}: promedio de{" "}
              {d.muestras}{" "}
              {d.muestras === 1
                ? "fecha"
                : "fechas"}
            </span>
          ))}
      </div>
    </div>
  );
}

//
// ======================================================
// CARD TOTAL
// ======================================================
//

function CardTotal({
  title,
  value,
  icon,
  big = false,
}: {
  title: string;

  value: number;

  icon: React.ReactNode;

  big?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-[#101B2E] p-5">
      <div className="flex items-center justify-between">
        <div className="text-cyan-400 text-4xl">
          {icon}
        </div>

        <div className="bebas text-3xl text-neutral-400">
          {title}
        </div>
      </div>

      <div
        className={`bebas mt-4 ${
          big
            ? "text-6xl text-cyan-400"
            : "text-5xl"
        }`}
      >
        $
        {value.toLocaleString(
          "es-CL"
        )}
      </div>
    </div>
  );
}