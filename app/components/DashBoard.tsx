"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as d3 from "d3";

import {
  FaCar,
  FaTruck,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";

import {
  DashboardDayData,
  dashboardMockData,
} from "./dashboard-mock";
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

//
// ======================================================
// COMPONENT
// ======================================================
//

export default function Dashboard() {
  const [viewMode, setViewMode] =
    useState<ViewMode>("week");

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [popupData, setPopupData] =
    useState<DashboardDayData | null>(
      null
    );

  //
  // FECHAS
  //

  const today = "2025-04-30";

  const sevenDaysAgo = "2025-04-23";

  const [fechaInicio, setFechaInicio] =
    useState(sevenDaysAgo);

  const [fechaFin, setFechaFin] =
    useState(today);

  //
  // DATA
  //

  const filteredData = useMemo(() => {
    return dashboardMockData.filter(
      (x) =>
        x.date >= fechaInicio &&
        x.date <= fechaFin
    );
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
  // DIA SELECCIONADO
  //

  const selectedDayData =
    useMemo<DashboardDayData | null>(() => {
      if (!selectedDate) return null;

      return (
        filteredData.find(
          (x) => x.date === selectedDate
        ) || null
      );
    }, [selectedDate, filteredData]);

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
          icon={<Image src="/sedan_off.png" width={80} height={20} alt="sedan_img"/>}
        />

        <CardTotal
          title="SUV"
          value={totales.suv}
          icon={<Image src="/suv_off.png" width={80} height={20} alt="sedan_img"/>}
        />

        <CardTotal
          title="GRANDE"
          value={totales.grande}
          icon={<Image src="/grande_off.png" width={80} height={20} alt="sedan_img"/>}
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
        {viewMode === "week" ? (
          <LineChart
            data={filteredData}
            onSelect={(d) => {
              setSelectedDate(d.date);
              setPopupData(d);
            }}
          />
        ) : (
          <BarChart
            data={selectedDayData}
          />
        )}
      </div>

      {/* POPUP */}

      {popupData && (
        <PopupDia
          data={popupData}
          onClose={() =>
            setPopupData(null)
          }
        />
      )}
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

  onSelect: (
    data: DashboardDayData
  ) => void;
}

function LineChart({
  data,
  onSelect,
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
        )
        .style(
          "cursor",
          "pointer"
        )
        .on(
          "click",
          (_, d) => {
            onSelect(d);
          }
        );
    });
  }, [data, onSelect]);

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
// BAR CHART
// ======================================================
//

function BarChart({
  data,
}: {
  data: DashboardDayData | null;
}) {
  const ref =
    useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current || !data)
      return;

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
    // GROUPS
    //

    const groups = data.hours.map(
      (x) => x.hour
    );

    const subgroups = [
      "Sedan",
      "SUV",
      "Grande",
      "Total",
    ];

    //
    // X
    //

    const x = d3
      .scaleBand()
      .domain(groups)
      .range([0, innerWidth])
      .padding(0.2);

    const xSub = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding(0.05);

    //
    // Y
    //

    const max =
      d3.max(data.hours, (d) =>
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
      .range([
        "#06B6D4",
        "#22C55E",
        "#F97316",
        "#E2E8F0",
      ]);

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
    // BARS
    //

    const grouped = g
      .selectAll("g.layer")
      .data(data.hours)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d) =>
          `translate(${x(d.hour) ?? 0},0)`
      );

    grouped
      .selectAll("rect")
      .data((d) => [
        {
          key: "Sedan",
          value: d.sedan,
        },

        {
          key: "SUV",
          value: d.suv,
        },

        {
          key: "Grande",
          value: d.grande,
        },

        {
          key: "Total",
          value: d.total,
        },
      ])
      .enter()
      .append("rect")
      .attr(
        "x",
        (d) =>
          xSub(d.key) ?? 0
      )
      .attr(
        "y",
        (d) => y(d.value)
      )
      .attr(
        "width",
        xSub.bandwidth()
      )
      .attr(
        "height",
        (d) =>
          innerHeight -
          y(d.value)
      )
      .attr(
        "fill",
        (d) => color(d.key)
      );
  }, [data]);

  if (!data) {
    return (
      <div className="py-20 text-center text-neutral-400">
        Selecciona un día del gráfico
        semanal
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <FaCalendarAlt className="text-cyan-400 text-2xl" />

        <h2 className="bebas text-4xl">
          Operaciones Horarias
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
// POPUP
// ======================================================
//

function PopupDia({
  data,
  onClose,
}: {
  data: DashboardDayData;

  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#101B2E] border border-cyan-500 rounded-3xl p-8 w-[95%] max-w-xl">
        <div className="flex justify-between items-center">
          <h2 className="bebas text-5xl text-cyan-400">
            {data.date}
          </h2>

          <button
            onClick={onClose}
            className="text-4xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <PopupCard
            label="Sedan"
            value={data.cantidad.sedan}
          />

          <PopupCard
            label="SUV"
            value={data.cantidad.suv}
          />

          <PopupCard
            label="Grande"
            value={data.cantidad.grande}
          />

          <PopupCard
            label="Total"
            value={data.cantidad.total}
          />
        </div>
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

function PopupCard({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="bg-[#16233B] rounded-2xl p-4 border border-neutral-700">
      <div className="text-neutral-400">
        {label}
      </div>

      <div className="bebas text-5xl text-cyan-400">
        {value}
      </div>
    </div>
  );
}