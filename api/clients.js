// ============================================================
// api/clients.js — Gestión de clientes (Vercel)
// ============================================================

import { guardarCliente, obtenerClientes } from "../lib/supabase.js";

export default async function handler(req, res) {
  // GET: Obtener todos los clientes
  if (req.method === "GET") {
    try {
      const clientes = await obtenerClientes();
      return res.status(200).json(clientes);
    } catch (error) {
      console.error("❌ Error:", error.message);
      return res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  // POST: Crear cliente
  if (req.method === "POST") {
    try {
      const { telefono, nombre } = req.body;
      if (!telefono) {
        return res.status(400).json({ error: "Se requiere 'telefono'" });
      }
      const cliente = await guardarCliente(telefono, nombre || "");
      return res.status(201).json({ success: true, cliente });
    } catch (error) {
      console.error("❌ Error:", error.message);
      return res.status(500).json({ error: "Error al crear cliente" });
    }
  }

  res.status(405).json({ error: "Método no permitido" });
}
