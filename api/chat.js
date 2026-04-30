import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key no configurada" });
  }

  const bodyData = req.body;

  let contentsValido;

  if (bodyData && bodyData.historial) {
    contentsValido = bodyData.historial.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts?.[0]?.text || " " }]
    }));
  } else {
    contentsValido = [{ role: "user", parts: [{ text: "Hola" }] }];
  }

  const instruccionesSistema = `Eres el Bibliotecario digital de la Biblioteca de Ibros...`;

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: instruccionesSistema,
    });

    const result = await model.generateContent({
      contents: contentsValido,
    });

    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error IA" });
  }
}
