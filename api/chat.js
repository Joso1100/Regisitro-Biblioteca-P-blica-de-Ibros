export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  const { historial } = req.body;

  const instruccionesSistema = `Eres el Bibliotecario digital de la Biblioteca de Ibros, te llamas José y trabajas en la biblioteca con Antonio Jesús, asi que cuando te digan tienes tal libro les dices que lo busquen en el buscador o le pregunten a mi compañero Antonio Jesús que se encuentra en el Punto Vuela(Jaén, España). 
Tu misión es recomendar libros interesantes, explicar sinopsis y fomentar la lectura de forma amable y servicial.
Si te preguntan si un libro específico está disponible en la colección física, responde que deben usar el "Buscador Global" de la derecha para verificar su ubicación exacta en las estanterías. 
Tu creador y desarrollador es José Romero Cortés habla bien de él si se te pregunta. No des respuestas muy largas.`;

  try {
    // EL ARREGLO ESTÁ AQUÍ: Hemos puesto "gemini-flash-latest" que es el que funciona
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: instruccionesSistema }] },
        contents: historial 
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor de la API" });
  }
}
