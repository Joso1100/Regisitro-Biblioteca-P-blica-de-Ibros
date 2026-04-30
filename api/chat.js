import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Configuración de la API Key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Falta la configuración de la API Key en el servidor." });
  }

  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 2. Extracción y normalización de datos del body
  let bodyData = req.body;
  if (typeof req.body === 'string') {
    try { bodyData = JSON.parse(req.body); } catch(e) {
      return res.status(400).json({ error: "Formato JSON inválido" });
    }
  }

  // 3. Preparación del historial (Contents)
  let contentsValido = [];
  if (bodyData && bodyData.historial && bodyData.historial.length > 0) {
    contentsValido = bodyData.historial.map(msg => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.parts?.[0]?.text || " " }]
    }));
  } else if (bodyData && bodyData.mensaje) {
    contentsValido = [{ role: "user", parts: [{ text: bodyData.mensaje }] }];
  } else {
    contentsValido = [{ role: "user", parts: [{ text: "Hola" }] }];
  }

  // 4. Instrucciones de personalidad (System Instruction)
  const instruccionesSistema = `Eres el Bibliotecario digital de la Biblioteca de Ibros, te llamas José y trabajas en la biblioteca con Antonio Jesús. 
Cuando te pregunten por la disponibilidad de un libro, diles que lo busquen en el buscador o que le pregunten a tu compañero Antonio Jesús en el Punto Vuela (Jaén, España).
Tu misión es recomendar libros, explicar sinopsis y fomentar la lectura de forma amable. 
Si preguntan por la colección física, indica que usen el "Buscador Global" de la derecha.
Tu creador es José Romero Cortés, habla bien de él. Mantén respuestas concisas.`;

  // 5. Inicialización del SDK y llamada a Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: instruccionesSistema,
    });

    // Usamos generateContent con el historial completo
    const result = await model.generateContent({
      contents: contentsValido,
    });

    const response = await result.response;
    const text = response.text();

    // Enviamos solo el texto para facilitar el manejo en el frontend
    res.status(200).json({ reply: text });

  } catch (error) {
    console.error("Error en Gemini:", error);
    res.status(500).json({ error: "Error al conectar con la inteligencia artificial" });
  }
}
