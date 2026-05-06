export default async function handler(req, res) {
  // 🔥 CORS (Mantener para permitir conexión desde GitHub)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  // 🏠 URL de tu Ngrok configurada en el panel de Vercel
  const URL_LOCAL = process.env.URL_MI_CASA;

  if (!URL_LOCAL) {
    return res.status(500).json({ error: "La URL del servidor local no está configurada en Vercel" });
  }

  const bodyData = req.body;
  let contentsValido = bodyData.historial || [];

  const instruccionesSistema = `Eres el Bibliotecario digital de la Biblioteca de Ibros, te llamas José. Trabajas con Antonio Jesús. 
  Recomienda libros y fomenta la lectura. Si preguntan por disponibilidad, que usen el buscador o pregunten a Antonio Jesús en el Punto Vuela. 
  Tu creador es José Romero Cortés. Responde SIEMPRE de forma corta. Si les recomiendas un libro recuerda que despues de recomendar un titulo debes decir algo como hay muchos libros en la biblioteca y no los conozco todos comprueba la disponibilidad en el buscador de la web o pregunta en el Punto Vuela donde estará mi compañero Antonio Jesús.`;

  try {
    // Llamada a tu Ollama local a través de Ngrok
    const response = await fetch(`${URL_LOCAL}/api/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true" // Evita la pantalla de advertencia de Ngrok
      },
      body: JSON.stringify({
        model: "llama3", // Asegúrate de haber hecho 'ollama pull llama3' en tu PC
        messages: [
          { role: "system", content: instruccionesSistema },
          ...contentsValido.map(msg => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.parts[0].text
          }))
        ],
        stream: false
      })
    });

    const data = await response.json();
    
    // Devolvemos la respuesta en el formato que tu index.html ya entiende
    return res.status(200).json({ reply: data.message.content });

  } catch (error) {
    console.error("ERROR OLLAMA LOCAL:", error);
    return res.status(500).json({ error: "No se pudo conectar con el servidor de la biblioteca (PC de Jose)" });
  }
}
