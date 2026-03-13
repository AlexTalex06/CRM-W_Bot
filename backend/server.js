// ============================================================
// server.js — Servidor principal del CRM WhatsApp Bot
// Express + Supabase + OpenAI + WhatsApp Business API
// ============================================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import webhookRoutes from "./routes/webhook.js";
import messagesRoutes from "./routes/messages.js";
import clientsRoutes from "./routes/clients.js";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Rutas ---

// Webhook de WhatsApp (verificación y recepción de mensajes)
app.use("/webhook", webhookRoutes);

// Conversaciones y mensajes (para el CRM)
app.use("/", messagesRoutes);

// Clientes
app.use("/clients", clientsRoutes);

// --- Ruta de salud ---
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "CRM WhatsApp Bot",
  });
});

// --- Iniciar servidor ---
app.listen(PORT, () => {
  console.log(`🚀 CRM WhatsApp Bot corriendo en http://localhost:${PORT}`);
  console.log(`📡 Webhook: http://localhost:${PORT}/webhook`);
  console.log(`💬 Conversaciones: http://localhost:${PORT}/conversations`);
  console.log(`👥 Clientes: http://localhost:${PORT}/clients`);
});
