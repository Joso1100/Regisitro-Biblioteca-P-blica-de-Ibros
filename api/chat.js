export default async function handler(req, res) {
  // Aquí Vercel coge tu clave secreta de forma segura
  const apiKey = process.env.GEMINI_API_KEY; 
  const { mensaje } = req.body; // Lo que el usuario escribe en tu web

  // Este archivo es el que "habla" con Google Gemini
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: mensaje }] }]
    })
  });

  const data = await response.json();
  res.status(200).json(data); // Le devuelve la respuesta de la IA a tu web
}
