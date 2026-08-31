export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const {
      history = {},
      documents = [],
    } = req.body || {};

    const safeHistory =
      history &&
      typeof history === "object"
        ? history
        : {};

    const safeDocuments =
      Array.isArray(documents)
        ? documents
        : [];

    /*
     * -----------------------------
     * CHIEF COMPLAINT
     * -----------------------------
     */

    const chiefComplaint =
      safeHistory.chiefComplaint ||
      safeHistory.symptomText ||
      safeHistory.symptoms ||
      "Not provided";

    /*
     * -----------------------------
     * PATIENT RESPONSES
     * -----------------------------
     */

    const responseEntries =
      Object.entries(safeHistory).filter(
        ([key, value]) =>
          key !== "chiefComplaint" &&
          key !== "symptomText" &&
          key !== "symptoms" &&
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
      );

    /*
     * -----------------------------
     * DOCUMENT INFORMATION
     * -----------------------------
     */

    const documentEntries =
      safeDocuments.map((document, index) => {
        const doc =
          document &&
          typeof document === "object"
            ? document
            : {};

        const investigations =
          Array.isArray(
            doc.investigations
          )
            ? doc.investigations
            : [];

        const findings =
          Array.isArray(doc.findings)
            ? doc.findings
            : [];

        const medications =
          Array.isArray(
            doc.medications
          )
            ? doc.medications
            : [];

        const diagnosis =
          Array.isArray(doc.diagnosis)
            ? doc.diagnosis
            : [];

        return {
          number: index + 1,

          documentType:
            doc.documentType ||
            "Medical Document",

          fileName:
            doc.fileName ||
            "Uploaded document",

          date:
            doc.date ||
            "Not provided",

          hospital:
            doc.hospital ||
            "Not provided",

          doctor:
            doc.doctor ||
            "Not provided",

          investigations,

          findings,

          impression:
            doc.impression ||
            "Not provided",

          medications,

          diagnosis,

          recommendations:
            Array.isArray(
              doc.recommendations
            )
              ? doc.recommendations
              : [],

          aiExplanation:
            doc.aiExplanation ||
            "",
        };
      });

    /*
     * -----------------------------
     * BUILD REPORT
     * -----------------------------
     *
     * This is intentionally generated
     * without another Gemini request.
     * This avoids quota/rate-limit issues.
     */

    let report = "";

    report +=
      "CLINOVA PRE-CONSULTATION REPORT\n";
    report +=
      "================================\n\n";

    report += "1. Chief Complaint\n";
    report +=
      `${chiefComplaint}\n\n`;

    /*
     * Symptoms / Responses
     */

    report +=
      "2. Symptoms / Patient Responses\n";

    if (responseEntries.length === 0) {
      report +=
        "Not provided.\n\n";
    } else {
      responseEntries.forEach(
        ([key, value]) => {
          const readableKey =
            key
              .replace(
                /([A-Z])/g,
                " $1"
              )
              .replace(
                /^./,
                (char) =>
                  char.toUpperCase()
              );

          report += `• ${readableKey}: ${String(
            value
          )}\n`;
        }
      );

      report += "\n";
    }

    /*
     * Relevant History
     */

    report += "3. Relevant History\n";

    const historyEntries =
      responseEntries.filter(
        ([key]) =>
          ![
            "chiefComplaint",
            "symptomText",
            "symptoms",
          ].includes(key)
      );

    if (historyEntries.length === 0) {
      report +=
        "Not provided.\n\n";
    } else {
      historyEntries.forEach(
        ([key, value]) => {
          const readableKey =
            key
              .replace(
                /([A-Z])/g,
                " $1"
              )
              .replace(
                /^./,
                (char) =>
                  char.toUpperCase()
              );

          report += `• ${readableKey}: ${String(
            value
          )}\n`;
        }
      );

      report += "\n";
    }

    /*
     * Uploaded records
     */

    report +=
      "4. Uploaded Medical Records\n";

    if (documentEntries.length === 0) {
      report +=
        "No medical documents were provided.\n\n";
    } else {
      documentEntries.forEach(
        (doc) => {
          report += `Document ${doc.number}: ${doc.documentType}\n`;

          report += `File: ${doc.fileName}\n`;

          if (
            doc.date &&
            doc.date !==
              "Not provided"
          ) {
            report += `Date: ${doc.date}\n`;
          }

          if (
            doc.hospital &&
            doc.hospital !==
              "Not provided"
          ) {
            report += `Hospital: ${doc.hospital}\n`;
          }

          report += "\n";

          if (
            doc.investigations.length >
            0
          ) {
            report +=
              "Investigations:\n";

            doc.investigations.forEach(
              (item) => {
                const name =
                  item?.name ||
                  "Investigation";

                const value =
                  item?.value || "";

                const unit =
                  item?.unit
                    ? ` ${item.unit}`
                    : "";

                const flag =
                  item?.flag
                    ? ` (${item.flag})`
                    : "";

                report += `• ${name}: ${value}${unit}${flag}\n`;
              }
            );

            report += "\n";
          }

          if (
            doc.findings.length >
            0
          ) {
            report += "Findings:\n";

            doc.findings.forEach(
              (finding) => {
                report += `• ${String(
                  finding
                )}\n`;
              }
            );

            report += "\n";
          }

          if (
            doc.impression &&
            doc.impression !==
              "Not provided"
          ) {
            report +=
              `Impression: ${doc.impression}\n\n`;
          }

          if (
            doc.medications.length >
            0
          ) {
            report +=
              "Medications mentioned:\n";

            doc.medications.forEach(
              (medicine) => {
                const name =
                  medicine?.name ||
                  "Medicine";

                const details =
                  [
                    medicine?.dose,
                    medicine?.frequency,
                    medicine?.duration,
                  ]
                    .filter(Boolean)
                    .join(", ");

                report += `• ${name}${
                  details
                    ? ` — ${details}`
                    : ""
                }\n`;
              }
            );

            report += "\n";
          }
        }
      );
    }

    /*
     * Important findings
     */

    report += "5. Important Findings\n";

    const importantFindings = [];

    documentEntries.forEach(
      (doc) => {
        doc.investigations.forEach(
          (item) => {
            if (
              item?.flag &&
              String(
                item.flag
              ).toLowerCase() !==
                "normal"
            ) {
              importantFindings.push(
                `${item.name || "Investigation"}: ${
                  item.flag
                }`
              );
            }
          }
        );

        doc.findings.forEach(
          (finding) => {
            importantFindings.push(
              String(finding)
            );
          }
        );
      }
    );

    if (
      importantFindings.length ===
      0
    ) {
      report +=
        "No specific document findings were provided.\n\n";
    } else {
      importantFindings.forEach(
        (finding) => {
          report += `• ${finding}\n`;
        }
      );

      report += "\n";
    }

    /*
     * Missing information
     */

    report +=
      "6. Information Missing / Needs Clarification\n";

    const missing = [];

    if (
      chiefComplaint ===
        "Not provided" ||
      !chiefComplaint
    ) {
      missing.push(
        "Chief complaint"
      );
    }

    if (
      responseEntries.length ===
      0
    ) {
      missing.push(
        "Additional patient responses"
      );
    }

    if (
      documentEntries.length ===
      0
    ) {
      missing.push(
        "Previous medical documents, if relevant"
      );
    }

    if (missing.length === 0) {
      report +=
        "No specific missing information identified from the provided data.\n\n";
    } else {
      missing.forEach(
        (item) => {
          report += `• ${item}\n`;
        }
      );

      report += "\n";
    }

    /*
     * Doctor attention
     */

    report +=
      "7. Points for Doctor Attention\n";

    report +=
      "• Review the patient's reported symptoms and responses.\n";

    if (
      importantFindings.length >
      0
    ) {
      report +=
        "• Review the highlighted document findings and laboratory values.\n";
    }

    report +=
      "• Verify the original medical documents and patient-provided information.\n";

    report +=
      "• Perform clinical assessment and make medical decisions independently.\n\n";

    /*
     * Disclaimer
     */

    report +=
      "IMPORTANT DISCLAIMER\n";
    report +=
      "This is an AI-generated draft based only on the information provided to Clinova. It is not a diagnosis or treatment recommendation and must be reviewed and verified by a qualified healthcare professional.";

    return res.status(200).json({
      report,
      status: "DRAFT",
      documentsIncluded:
        documentEntries.length,
    });
  } catch (error) {
    console.error(
      "Pre-report generation error:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Failed to generate pre-report.",
    });
  }
}