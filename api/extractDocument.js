import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error:
        "GEMINI_API_KEY is missing from environment.",
    });
  }

  try {
    const form = formidable({
      multiples: false,
    });

    const [fields, files] = await form.parse(req);

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!uploadedFile) {
      return res.status(400).json({
        error: "No document was uploaded.",
      });
    }

    const filePath = uploadedFile.filepath;

    const mimeType =
      uploadedFile.mimetype ||
      "application/octet-stream";

    const fileBuffer =
      fs.readFileSync(filePath);

    const base64Data =
      fileBuffer.toString("base64");

    const prompt = `
You are Clinova's Medical Document Intelligence module.

Analyze the uploaded medical document.

Extract ONLY information that is actually visible/readable.

Do NOT invent information.
Do NOT diagnose the patient.
Do NOT prescribe treatment.

The document can be any medical document:
- Blood report
- CBC
- Thyroid report
- Lipid profile
- Liver function test
- Kidney function test
- Diabetes report
- ECG
- X-ray
- CT
- MRI
- Ultrasound
- Prescription
- Discharge summary
- Consultation note
- Pathology report
- Vaccination record
- Medical bill
- Other medical document

Return ONLY valid JSON.

Use exactly this structure:

{
  "documentType": "",
  "date": "",
  "hospital": "",
  "doctor": "",
  "patientName": "",
  "clinicalIndication": "",
  "investigations": [],
  "findings": [],
  "impression": "",
  "medications": [],
  "diagnosis": [],
  "recommendations": [],
  "otherInformation": [],
  "aiExplanation": "",
  "status": "DRAFT"
}

For investigations use:

{
  "name": "",
  "value": "",
  "unit": "",
  "referenceRange": "",
  "flag": ""
}

For medications use:

{
  "name": "",
  "dose": "",
  "frequency": "",
  "duration": ""
}

Rules:

1. Identify the actual document type.
2. Extract only visible information.
3. Preserve units.
4. Preserve reference ranges if visible.
5. Preserve abnormal/high/low flags if shown.
6. Do not calculate values.
7. Do not infer a diagnosis.
8. If information is unavailable, use "" or [].
9. Do not invent patient name, hospital, doctor or dates.
10. aiExplanation must be simple and patient-friendly.
11. aiExplanation must clearly say this is an AI-generated draft requiring professional verification.
`;

    const geminiResponse = await fetch(
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
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const geminiData =
      await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error(
        "Gemini document error:",
        geminiData
      );

      return res.status(
        geminiResponse.status
      ).json({
        error:
          geminiData?.error?.message ||
          "Gemini rejected the document.",
        geminiError: geminiData,
      });
    }

    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({
        error:
          "Gemini returned no document analysis.",
      });
    }

    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(
        "Gemini JSON parsing failed:",
        cleaned
      );

      return res.status(500).json({
        error:
          "Gemini returned invalid JSON.",
        rawText: cleaned,
      });
    }

    /*
     * Ensure status is always present.
     */
    parsed.status = "DRAFT";

    /*
     * Ensure arrays exist.
     */
    parsed.investigations =
      Array.isArray(parsed.investigations)
        ? parsed.investigations
        : [];

    parsed.findings =
      Array.isArray(parsed.findings)
        ? parsed.findings
        : [];

    parsed.medications =
      Array.isArray(parsed.medications)
        ? parsed.medications
        : [];

    parsed.diagnosis =
      Array.isArray(parsed.diagnosis)
        ? parsed.diagnosis
        : [];

    parsed.recommendations =
      Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [];

    parsed.otherInformation =
      Array.isArray(
        parsed.otherInformation
      )
        ? parsed.otherInformation
        : [];

    return res.status(200).json(parsed);
  } catch (error) {
    console.error(
      "Document extraction failed:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Unable to analyze the medical document.",
    });
  }
}