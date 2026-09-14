// Función Netlify para manejar requests del chatbot
// Coloca este archivo en: netlify/functions/chat.js

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

exports.handler = async (event) => {
  // Solo aceptar POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { mensaje } = JSON.parse(event.body);

    if (!mensaje) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Mensaje vacío" }),
      };
    }

    // Llamar a Claude con contexto sobre contratación pública
    const response = await client.messages.create({
     model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      system: `Eres un experto en contratación pública colombiana. Respondes preguntas sobre procesos de contratación en Colombia, regulaciones, leyes (Ley 80 de 1993, Ley 1150 de 2007), SECOP II, y todas las modalidades de contratación.

Tu respuesta debe ser:
- Precisa y basada en normativa vigente
- Clara y fácil de entender
- Práctica con ejemplos cuando sea posible
- Honesta si no tienes información completa

Contexto importante:
- SECOP II es la plataforma oficial de contratación pública
- Las modalidades principales: Licitación pública, Selección abreviada, Contratación directa, Mínima cuantía, Subasta inversa
- El usuario puede ser un estudiante, emprendedor o persona interesada en contratación pública`,
      messages: [
        {
          role: "user",
          content: mensaje,
        },
      ],
    });

    const respuesta = response.content[0].text;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        respuesta: respuesta,
      }),
    };
  } catch (error) {
    console.error("Error:", error);

    if (error.message.includes("API key")) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error:
            "API key no configurada. Agrega CLAUDE_API_KEY a las variables de entorno de Netlify.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error procesando tu pregunta. Intenta de nuevo.",
      }),
    };
  }
};
