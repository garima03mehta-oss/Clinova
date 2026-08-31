import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

function sendFallbackResult(fileName) {
  const lowerName = String(fileName || "").toLowerCase();

  let documentType = "Medical Document";

  if (
    lowerName.includes("thyroid") ||
    lowerName.includes("tsh") ||
    lowerName.includes("t3") ||
    lowerName.includes("t4")
  ) {
    documentType = "Thyroid Function Test";
  } else if (
    lowerName.includes("cbc") ||
    lowerName.includes("blood") ||
    lowerName.includes("hemoglobin")
  ) {
    documentType = "Blood / Laboratory Report";
  } else if (lowerName.includes("ecg")) {
    documentType = "ECG Report";
  } else if (
    lowerName.includes("prescription") ||
    lowerName.includes("medicine")
  ) {
    documentType = "Prescription";
  }

  return {
    documentType,
    date: "",
    hospital: "",
    doctor: "",
    patientName: "",
    clinicalIndication: "",
    investigations: [],
    findings: [
      "Document was uploaded successfully.",
      "AI document analysis is temporarily unavailable.",
      "Please have the original document verified by a qualified healthcare professional.",
    ],
    impression: "",
    medications: [],
    diagnosis: [],
    recommendations: [],
    otherInformation: [
      `Uploaded file: ${fileName}`,
    ],
    aiExplanation:
      "The document was uploaded successfully, but AI analysis is temporarily unavailable. No medical values or diagnosis have been inferred.",
    status: "FALLBACK_DRAFT",
    aiAvailable: false,
  };
}

function cleanGeminiJSON(text) {
  return String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  let parsedForm;

  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
    });

    parsedForm = await form.parse(req);
  } catch (error) {
    console.error("Formidable parsing error:", error);

    return res.status(400).json({
      error: "Unable to read uploaded document.",
    });
  }

  try {
    const [fields, files] = parsedForm;

    const uploadedFile = Array.isArray(files?.file)
      ? files.file[0]
      : files?.file;

    if (!uploadedFile) {
      return res.status(400).json({
        error: "No document was uploaded.",
      });
    }

    const filePath = uploadedFile.filepath;
    const fileName =
      uploadedFile.originalFilename ||
      uploadedFile.newFilename ||
      "medical-document";

    const mimeType =
      uploadedFile.mimetype ||
      "application/octet-stream";

    /*
     * --------------------------------------------------
     * GEMINI IS THE PRIMARY DOCUMENT ANALYZER
     * --------------------------------------------------
     */

    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "GEMINI_API_KEY missing. Using fallback extraction."
      );

      return res.status(200).json(
        sendFallbackResult(fileName)
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    const prompt = `
You are Clinova's Medical Document Intelligence module.

You are NOT a doctor.

Analyze the uploaded medical document carefully.

The document may be any medical document, including:

- Blood report
- CBC
- Thyroid function test
- Lipid profile
- Liver function test
- Kidney function test
- Diabetes report
- ECG
- Echocardiogram
- X-ray
- CT
- MRI
- Ultrasound
- Prescription
- Discharge summary
- Consultation note
- Pathology report
- Medical bill
- Vaccination record
- Other medical document

IMPORTANT:

1. Read the actual uploaded document.
2. Extract ONLY information that is actually visible/readable.
3. Do NOT rely only on the filename.
4. Do NOT invent values.
5. Do NOT diagnose the patient.
6. Do NOT prescribe treatment.
7. Preserve units and reference ranges when visible.
8. Preserve high/low/abnormal flags when explicitly present.
9. If information is unavailable, return an empty string or empty array.
10. For thyroid reports, extract TSH, T3, T4, FT3, FT4 when present.
11. For ECG reports, extract visible measurements and the reported impression.
12. For imaging, extract findings and impression.
13. For prescriptions, extract medicines, dose, frequency and duration.
14. For discharge summaries, extract relevant diagnoses, investigations, medicines and recommendations exactly as documented.
15. aiExplanation must be simple and patient-friendly.
16. Clearly state that this is an AI-generated draft requiring professional verification.

Return ONLY valid JSON.

Use exactly this structure:

{
  "documentType": "",
  "date": "",
  "hospital": "",
  "doctor": "",
  "patientName": "",
  "clinicalIndication": "",
  "investigations": [
    {
      "name": "",
      "value": "",
      "unit": "",
      "referenceRange": "",
      "flag": ""
    }
  ],
  "findings": [],
  "impression": "",
  "medications": [
    {
      "name": "",
      "dose": "",
      "frequency": "",
      "duration": ""
    }
  ],
  "diagnosis": [],
  "recommendations": [],
  "otherInformation": [],
  "aiExplanation": "",
  "status": "DRAFT",
  "aiAvailable": true
}
`;

    let geminiResponse;

    try {
      geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );
    } catch (networkError) {
      console.error(
        "Gemini network error:",
        networkError
      );

      return res.status(200).json(
        sendFallbackResult(fileName)
      );
    }

    const geminiData =
      await geminiResponse.json().catch(
        () => ({})
      );

    /*
     * --------------------------------------------------
     * GEMINI QUOTA / API ERROR
     * --------------------------------------------------
     *
     * Instead of showing a white screen,
     * return a safe fallback result.
     */

    if (!geminiResponse.ok) {
      console.error(
        "Gemini document error:",
        geminiData
      );

      return res.status(200).json({
        ...sendFallbackResult(fileName),
        aiError:
          geminiData?.error?.message ||
          "Gemini document analysis unavailable.",
      });
    }

    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]
        ?.text;

    if (!rawText) {
      console.error(
        "Gemini returned no document analysis."
      );

      return res.status(200).json(
        sendFallbackResult(fileName)
      );
    }

    const cleaned = cleanGeminiJSON(
      rawText
    );

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(
        "Gemini JSON parsing failed:",
        cleaned
      );

      return res.status(200).json(
        sendFallbackResult(fileName)
      );
    }

    /*
     * Ensure expected fields always exist.
     */

    const safeResult = {
      documentType:
        parsed.documentType || "Medical Document",

      date: parsed.date || "",
      hospital: parsed.hospital || "",
      doctor: parsed.doctor || "",
      patientName:
        parsed.patientName || "",

      clinicalIndication:
        parsed.clinicalIndication || "",

      investigations:
        Array.isArray(parsed.investigations)
          ? parsed.investigations
          : [],

      findings:
        Array.isArray(parsed.findings)
          ? parsed.findings
          : [],

      impression:
        parsed.impression || "",

      medications:
        Array.isArray(parsed.medications)
          ? parsed.medications
          : [],

      diagnosis:
        Array.isArray(parsed.diagnosis)
          ? parsed.diagnosis
          : [],

      recommendations:
        Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : [],

      otherInformation:
        Array.isArray(parsed.otherInformation)
          ? parsed.otherInformation
          : [],

      aiExplanation:
        parsed.aiExplanation ||
        "The document was analyzed by AI. Please verify the extracted information with a qualified healthcare professional.",

      status: "DRAFT",
      aiAvailable: true,
    };

    return res.status(200).json(
      safeResult
    );
  } catch (error) {
    console.error(
      "Document extraction failed:",
      error
    );

    /*
     * Final safety net.
     * Never let document upload produce
     * a white screen because of AI failure.
     */

    return res.status(200).json(
      sendFallbackResult(
        "medical-document"
      )
    );
  }
}