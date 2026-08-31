import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  getHealthTrend,
  getTrendDirection,
} from "../../utils/healthTrends";

export default function HealthTrends() {
  const navigate = useNavigate();
  const location = useLocation();

  const [patient, setPatient] = useState(null);
  const [selectedParameter, setSelectedParameter] =
    useState("hemoglobin");

  useEffect(() => {
    const navigationPatient = location.state?.patient;

    if (navigationPatient) {
      setPatient(navigationPatient);

      localStorage.setItem(
        "clinovaSelectedPatient",
        JSON.stringify(navigationPatient)
      );

      return;
    }

    const storedPatient = localStorage.getItem(
      "clinovaSelectedPatient"
    );

    if (storedPatient) {
      try {
        setPatient(JSON.parse(storedPatient));
      } catch (error) {
        console.error(
          "Unable to load selected patient:",
          error
        );
      }
    }
  }, [location.state]);

  if (!patient) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="bg-surface border border-gray-200 rounded-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">👤</div>

          <h1 className="text-xl font-semibold text-text">
            Patient Not Selected
          </h1>

          <p className="text-sm text-text-muted mt-2">
            Please select a patient before viewing health trends.
          </p>

          <button
            onClick={() => navigate("/doctor/queue")}
            className="mt-6 bg-primary text-white px-5 py-3 rounded-xl"
          >
            Go to Patient Requests
          </button>
        </div>
      </div>
    );
  }

  const patientName =
    patient.patientName ||
    patient.name ||
    "Patient";

  const patientId =
    patient.patientId ||
    "Not available";

  const reports = Array.isArray(patient.reports)
    ? patient.reports
    : [];

  const trendData = getHealthTrend(
    reports,
    selectedParameter
  );

  const direction = getTrendDirection(trendData);

  const parameterNames = {
    hemoglobin: "Hemoglobin",
    wbc: "WBC",
    platelets: "Platelets",
  };

  const units = {
    hemoglobin: "g/dL",
    wbc: "cells/µL",
    platelets: "cells/µL",
  };

  return (
    <div className="min-h-screen bg-bg font-body text-text">

      {/* HEADER */}
      <header className="bg-surface border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <button
            onClick={() =>
              navigate("/doctor/patient-workspace", {
                state: { patient },
              })
            }
            className="text-primary text-sm font-medium"
          >
            ← Patient Workspace
          </button>

          <div className="mt-4">

            <p className="text-primary text-xs font-bold tracking-wider">
              CLINOVA • HEALTH TRENDS
            </p>

            <h1 className="font-display text-2xl font-semibold mt-1">
              Health Trends
            </h1>

            <p className="text-sm text-text-muted mt-1">
              Track laboratory values across available medical reports.
            </p>

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* PATIENT */}
        <section className="bg-surface border border-gray-200 rounded-2xl p-6 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
              👤
            </div>

            <div>
              <p className="text-xs text-text-muted">
                PATIENT
              </p>

              <h2 className="text-xl font-semibold">
                {patientName}
              </h2>

              <p className="text-sm text-text-muted mt-1">
                Patient ID: {patientId}
              </p>
            </div>

          </div>

        </section>

        {/* PARAMETER SELECTOR */}
        <section className="bg-surface border border-gray-200 rounded-2xl p-6 mb-6">

          <h2 className="font-semibold text-lg">
            Select Health Parameter
          </h2>

          <p className="text-sm text-text-muted mt-1">
            View changes in laboratory values over time.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">

            {Object.entries(parameterNames).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setSelectedParameter(key)
                  }
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                    selectedParameter === key
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 text-text hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              )
            )}

          </div>

        </section>

        {/* TREND */}
        <section className="bg-surface border border-gray-200 rounded-2xl overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <h2 className="font-semibold text-lg">
                  {parameterNames[selectedParameter]} Trend
                </h2>

                <p className="text-sm text-text-muted mt-1">
                  Unit: {units[selectedParameter]}
                </p>

              </div>

              <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">

                <p className="text-xs text-text-muted">
                  Trend
                </p>

                <p className="text-sm font-semibold mt-1">
                  {direction}
                </p>

              </div>

            </div>

          </div>

          <div className="p-6">

            {trendData.length >= 2 ? (

              <div className="w-full h-80">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart data={trendData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />

                  </LineChart>
                </ResponsiveContainer>

              </div>

            ) : (

              <div className="py-12 text-center">

                <div className="text-5xl mb-4">
                  📈
                </div>

                <h3 className="font-semibold">
                  Not Enough Data
                </h3>

                <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
                  At least two dated reports containing this
                  parameter are required to display a trend.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* VALUES */}
        {trendData.length > 0 && (
          <section className="bg-surface border border-gray-200 rounded-2xl p-6 mt-6">

            <h2 className="font-semibold text-lg">
              Recorded Values
            </h2>

            <div className="mt-4 overflow-x-auto">

              <table className="w-full text-sm">

                <thead>
                  <tr className="border-b border-gray-200 text-left">

                    <th className="py-3 pr-4 text-text-muted font-medium">
                      Date
                    </th>

                    <th className="py-3 text-text-muted font-medium">
                      {parameterNames[selectedParameter]}
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {trendData.map((item, index) => (

                    <tr
                      key={index}
                      className="border-b border-gray-100"
                    >

                      <td className="py-3 pr-4">
                        {item.date}
                      </td>

                      <td className="py-3 font-medium">
                        {item.value}{" "}
                        {units[selectedParameter]}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* DISCLAIMER */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">

          <p className="text-sm text-text-muted leading-6">
            Health trends are visualized from available
            patient-record data. Trends are for clinical review
            and do not independently provide a diagnosis.
          </p>

        </div>

      </main>
    </div>
  );
}