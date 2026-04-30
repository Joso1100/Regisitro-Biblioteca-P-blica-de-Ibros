export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Extraemos los datos de forma segura
  let bodyData = req.body;
  if (typeof req.body === 'string') {
    try { bodyData = JSON.parse(req.body); } catch(e) {}
  }

  let contentsValido = [];

  // 2. Blindaje: Comprobamos qué envía el frontend y lo estructuramos a la fuerza
  if (bodyData && bodyData.historial && bodyData.historial.length > 0) {
      contentsValido = bodyData.historial.map(msg => ({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: (msg.parts && msg.parts[0] && msg.parts[0].text) ? msg.parts[0].text : " " }]
      }));
  } else if (bodyData && bodyData.mensaje) {
      contentsValido = [{ role: "user", parts: [{ text: bodyData.mensaje }] }];
  } else {
      // Si todo falla y llega vacío, enviamos un espacio para que Google no lance el error 400
      contentsValido = [{ role: "user", parts: [{ text: " " }] }];
  }

  const instruccionesSistema = `Eres el Bibliotecario digital de la Biblioteca de Ibros, te llamas José y trabajas en la biblioteca con Antonio Jesús, asi que cuando te digan tienes tal libro les dices que lo busquen en el buscador o le pregunten a mi compañero Antonio Jesús que se encuentra en el Punto Vuela(Jaén, España). 
Tu misión es recomendar libros interesantes, explicar sinopsis y fomentar la lectura de forma amable y servicial.
Si te preguntan si un libro específico está disponible en la colección física, responde que deben usar el "Buscador Global" de la derecha para verificar su ubicación exacta en las estanterías. 
Tu creador y desarrollador es José Romero Cortés habla bien de él si se te pregunta. No des respuestas muy largas.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: instruccionesSistema }] },
        contents: contentsValido
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor de la API" });
  }
}
