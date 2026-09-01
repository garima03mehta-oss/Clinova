import React from "react";
import { useNavigate } from "react-router-dom";

export default function HealthTrends() {
  const navigate = useNavigate();

  const trends = [
    {
      month: "January",
      bloodPressure: "120/80",
      heartRate: "72 BPM",
      weight: "68 kg",
    },
    {
      month: "February",
      bloodPressure: "122/81",
      heartRate: "74 BPM",
      weight: "67 kg",
    },
    {
      month: "March",
      bloodPressure: "118/79",
      heartRate: "71 BPM",
      weight: "67 kg",
    },
    {
      month: "April",
      bloodPressure: "125/82",
      heartRate: "76 BPM",
      weight: "66 kg",
    },
    {
      month: "May",
      bloodPressure: "121/80",
      heartRate: "73 BPM",
      weight: "66 kg",
    },
    {
      month: "June",
      bloodPressure: "119/78",
      heartRate: "70 BPM",
      weight: "65 kg",
    },
  ];

  return (
    <div className="min-h-screen bg-bg font-body px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs text-primary tracking-widest mb-2">
              CLINICAL ANALYTICS
            </p>

            <h1 className="font-display text-3xl font-semibold text-text">
              Health Trends
            </h1>

            <p className="text-text-muted mt-2">
              Monitor patient health measurements over time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/doctor/dashboard")}
            className="bg-surface border-2 border-primary text-primary px-5 py-3 rounded-xl font-display hover:bg-primary-light transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* PATIENT INFORMATION */}
        <div className="bg-primary-light border border-primary rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              📊
            </div>

            <div>
              <h2 className="font-display font-semibold text-primary">
                Patient Health Overview
              </h2>

              <p className="text-sm text-primary mt-1">
                Review recorded measurements and monitor changes over time.
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-text-muted text-sm mb-3">
              Blood Pressure
            </p>

            <p className="font-display text-3xl font-semibold text-text">
              119/78
            </p>

            <span className="inline-block mt-3 bg-primary-light text-primary border border-primary px-3 py-1 rounded-full text-xs font-mono">
              BP
            </span>
          </div>

          <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-text-muted text-sm mb-3">
              Heart Rate
            </p>

            <p className="font-display text-3xl font-semibold text-text">
              70
            </p>

            <span className="inline-block mt-3 bg-green-50 text-success border border-success px-3 py-1 rounded-full text-xs font-mono">
              BPM
            </span>
          </div>

          <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-text-muted text-sm mb-3">
              Current Weight
            </p>

            <p className="font-display text-3xl font-semibold text-text">
              65
            </p>

            <span className="inline-block mt-3 bg-gray-50 text-text-muted border border-gray-300 px-3 py-1 rounded-full text-xs font-mono">
              KG
            </span>
          </div>

        </div>

        {/* TREND CARDS */}
        <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-text">
                Health Indicators
              </h2>

              <p className="text-text-muted text-sm mt-1">
                Historical patient measurements.
              </p>
            </div>

            <span className="bg-primary-light text-primary border border-primary px-3 py-1 rounded-full text-xs font-mono">
              VERIFIED
            </span>
          </div>

          <div className="space-y-6">

            {/* BLOOD PRESSURE */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-display text-sm text-text">
                  Blood Pressure
                </span>

                <span className="font-mono text-xs text-text-muted">
                  mmHg
                </span>
              </div>

              <div className="flex items-end gap-3 h-40 bg-gray-50 rounded-xl p-4">

                {trends.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >
                    <span className="text-xs text-text-muted mb-2">
                      {item.bloodPressure.split("/")[0]}
                    </span>

                    <div
                      className="w-full bg-primary rounded-t-lg"
                      style={{
                        height: `${50 + index * 7}%`,
                      }}
                    />

                    <span className="text-xs text-text-muted mt-2">
                      {item.month.substring(0, 3)}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* HEART RATE */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-display text-sm text-text">
                  Heart Rate
                </span>

                <span className="font-mono text-xs text-text-muted">
                  BPM
                </span>
              </div>

              <div className="flex items-end gap-3 h-40 bg-gray-50 rounded-xl p-4">

                {trends.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >
                    <span className="text-xs text-text-muted mb-2">
                      {item.heartRate.replace(" BPM", "")}
                    </span>

                    <div
                      className="w-full bg-accent rounded-t-lg"
                      style={{
                        height: `${55 + index * 5}%`,
                      }}
                    />

                    <span className="text-xs text-text-muted mt-2">
                      {item.month.substring(0, 3)}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            {/* WEIGHT */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-display text-sm text-text">
                  Weight
                </span>

                <span className="font-mono text-xs text-text-muted">
                  KG
                </span>
              </div>

              <div className="flex items-end gap-3 h-40 bg-gray-50 rounded-xl p-4">

                {trends.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >
                    <span className="text-xs text-text-muted mb-2">
                      {item.weight.replace(" kg", "")}
                    </span>

                    <div
                      className="w-full bg-warning rounded-t-lg"
                      style={{
                        height: `${85 - index * 5}%`,
                      }}
                    />

                    <span className="text-xs text-text-muted mt-2">
                      {item.month.substring(0, 3)}
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-surface rounded-2xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-text">
                Recorded Measurements
              </h2>

              <p className="text-text-muted text-sm mt-1">
                Patient measurements by month.
              </p>
            </div>

            <span className="bg-gray-50 text-text-muted border border-gray-300 px-3 py-1 rounded-full text-xs font-mono">
              6 RECORDS
            </span>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-200">

                  <th className="text-left py-3 px-3 text-xs font-mono text-text-muted">
                    MONTH
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-mono text-text-muted">
                    BLOOD PRESSURE
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-mono text-text-muted">
                    HEART RATE
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-mono text-text-muted">
                    WEIGHT
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-mono text-text-muted">
                    STATUS
                  </th>

                </tr>
              </thead>

              <tbody>

                {trends.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >

                    <td className="py-4 px-3 text-sm font-medium text-text">
                      {item.month}
                    </td>

                    <td className="py-4 px-3 text-sm text-text">
                      {item.bloodPressure}
                    </td>

                    <td className="py-4 px-3 text-sm text-text">
                      {item.heartRate}
                    </td>

                    <td className="py-4 px-3 text-sm text-text">
                      {item.weight}
                    </td>

                    <td className="py-4 px-3">
                      <span className="bg-green-50 text-success border border-success px-3 py-1 rounded-full text-xs font-mono">
                        VERIFIED
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        </div>

        {/* NOTE */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-text-muted">
            <strong>Clinical note:</strong>{" "}
            Health trends support clinical review and should not replace
            professional medical judgment.
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">

          <button
            type="button"
            onClick={() => navigate("/doctor/patient")}
            className="bg-surface border-2 border-primary text-primary py-3 px-4 rounded-xl font-display hover:bg-primary-light transition"
          >
            ← Patient Workspace
          </button>

          <button
            type="button"
            onClick={() => navigate("/doctor/dashboard")}
            className="bg-primary text-white py-3 px-4 rounded-xl font-display hover:bg-primary-dark transition"
          >
            Doctor Dashboard
          </button>

        </div>

      </div>
    </div>
  );
}