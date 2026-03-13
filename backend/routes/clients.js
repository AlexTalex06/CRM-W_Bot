// ============================================================
// routes/clients.js — Rutas de Clientes
// Endpoints para gestionar clientes del CRM
// ============================================================

import { Router } from "express";
import { guardarCliente, obtenerClientes } from "../supabase.js";

const router = Router();

/**
 * GET /clients — Obtener todos los clientes
 */
router.get("/", async (_req, res) => {
  try {
    const clientes = await obtenerClientes();
    res.json(clientes);
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error.message);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

/**
 * POST /clients — Crear un nuevo cliente
 * Body: { telefono, nombre }
 */
router.post("/", async (req, res) => {
  try {
    const { telefono, nombre } = req.body;

    if (!telefono) {
      return res.status(400).json({ error: "Se requiere 'telefono'" });
    }

    const cliente = await guardarCliente(telefono, nombre || "");

    res.status(201).json({
      success: true,
      cliente,
    });
  } catch (error) {
    console.error("❌ Error al crear cliente:", error.message);
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

export default router;
