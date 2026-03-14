// ============================================================
// api/crm/update-task.js — Crear o actualizar una tarea (Vercel)
// ============================================================

import { guardarTarea } from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { tarea } = req.body;
    
    if (!tarea || !tarea.telefono || !tarea.title) {
      return res.status(400).json({ error: "Faltan parámetros de la tarea (telefono, title)" });
    }

    const tareaActualizada = await guardarTarea(tarea);
    
    if (!tareaActualizada) {
      return res.status(500).json({ error: "Error al guardar la tarea" });
    }

    res.status(200).json({ success: true, tarea: tareaActualizada });
  } catch (error) {
    console.error("❌ Error en update-task:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
