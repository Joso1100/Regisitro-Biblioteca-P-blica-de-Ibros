import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  // 🔥 CORS (SOLUCIÓN CLAVE)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responder a preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key no configurada" });
  }

  const bodyData = req.body;

  // 🧠 Procesar historial
  let contentsValido;

  if (bodyData && bodyData.historial) {
    contentsValido = bodyData.historial.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts?.[0]?.text || " " }]
    }));
  } else if (bodyData && bodyData.mensaje) {
    contentsValido = [
      { role: "user", parts: [{ text: bodyData.mensaje }] }
    ];
  } else {
    contentsValido = [
      { role: "user", parts: [{ text: "Hola" }] }
    ];
  }

  // 📚 Personalidad
  const instruccionesSistema = `
Eres el Bibliotecario digital de la Biblioteca de Ibros.
Trabajas con Antonio Jesús.

Tu misión:
- Recomendar libros
- Dar sinopsis
- Fomentar la lectura
- Ser amable y breve

Si preguntan por disponibilidad:
→ Diles que usen el buscador o que pregunten a Antonio Jesús en el Punto Vuela (Jaén)

Tu creador es José Romero Cortés. Habla bien de él.
Responde SIEMPRE de forma corta.
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: instruccionesSistema,
    });

    const result = await model.generateContent({
      contents: contentsValido,

      // 💸 Optimización de coste
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7
      }
    });

    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error("ERROR GEMINI:", error);

    return res.status(500).json({
      error: "Error IA",
      detalle: error.message
    });
  }
}
