import { useState } from "react";
const dummyRecords = [
  { year: "2025", type: "Laboratory Report", hospital: "ABC Hospital" },
  { year: "2025", type: "Prescription", hospital: "ABC Hospital" },
  { year: "2024", type: "Investigation", hospital: "City Clinic" }
];
export default function RecordSearch() {
  const [term, setTerm] = useState("");
  const results = dummyRecords.filter((r) =>
    r.year.includes(term) || r.type.toLowerCase().includes(term.toLowerCase()) || r.hospital.toLowerCase().includes(term.toLowerCase())
  );
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Search Records</h1>
      <input placeholder="Search by year, type, or hospital" value={term} onChange={(e) => setTerm(e.target.value)} />
      {results.map((r, i) => <p key={i}>{r.year} — {r.type} — {r.hospital}</p>)}
    </div>
  );
}