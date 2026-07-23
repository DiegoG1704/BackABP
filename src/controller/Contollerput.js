const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');

const putCorreo = async(req,res) =>{
    const {id}= req.params;
    const {correo} = req.body;
    const query ='UPDATE datos SET correo =? WHERE id=?'
    try {
        await pool.query(query,[correo,id])
        res.status(200).json({ message: 'Producción iniciada con éxito' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('error');
    }
}

const updateConfiguracion = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const query = `
    UPDATE rol_config 
    SET estado = ? 
    WHERE id = ?
  `;

  try {
    await pool.query(query, [estado, id]);
    res.status(200).json({ message: 'Configuración actualizada' });
  } catch (err) {
    console.error('Error al actualizar configuración:', err.message);
    res.status(500).json({ message: 'Error al actualizar' });
  }
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password, passwordNew } = req.body;

  // 1. Validar entrada
  if (!password || !passwordNew) {
    return res.status(400).json({ message: "Ambas contraseñas son obligatorias" });
  }

  try {
    // 2. Verificar que la contraseña actual coincida
    const [rows] = await pool.query(
      "SELECT contraseña FROM usuario WHERE idDatos = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const currentPassword = rows[0].contraseña;

    if (currentPassword !== password) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    // 3. Actualizar contraseña
    await pool.query(
      "UPDATE usuario SET contraseña = ? WHERE idDatos = ?",
      [passwordNew, id]
    );

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error al actualizar contraseña:", err.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const putCampo = async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const camposPermitidos = ["nombres", "correo", "telefono", "dni", "presupuesto"];

  if (!camposPermitidos.includes(campo)) {
    return res.status(400).json({ error: "Campo no permitido" });
  }

  const query = `UPDATE datos SET ${campo} = ? WHERE id = ?`;

  try {
    await pool.query(query, [valor, id]);
    res.status(200).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar datos:", error);
    res.status(500).json({ error: "Error al guardar los datos" });
  }
};

const putCampoNeg = async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const camposPermitidos = ["nombre", "direccion", "ruc"];

  if (!camposPermitidos.includes(campo)) {
    return res.status(400).json({ error: "Campo no permitido" });
  }

  const query = `UPDATE talleres SET ${campo} = ? WHERE idEncargado = ?`;

  try {
    await pool.query(query, [valor, id]);
    res.status(200).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar datos:", error);
    res.status(500).json({ error: "Error al guardar los datos" });
  }
};

const FotoPerfil = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });
    const imagePath = req.file.filename;

    const query = "UPDATE datos SET fotoPerfil = ? WHERE id = ?";
    const [result] = await pool.query(query, [imagePath, id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(201).json({ fotoPerfil: imagePath, message: "Éxito" });
  } catch (err) {
    console.error("Error actualizando la imagen de perfil:", err);
    res.status(500).send("Error al actualizar la imagen de perfil");
  }
};

const FotoTaller = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ message: "No se recibió archivo" });
    const imagePath = req.file.filename;

    const query = "UPDATE talleres SET imagen = ? WHERE idEncargado = ?";
    const [result] = await pool.query(query, [imagePath, id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(201).json({ fotoPerfil: imagePath, message: "Éxito" });
  } catch (err) {
    console.error("Error actualizando la imagen de perfil:", err);
    res.status(500).send("Error al actualizar la imagen de perfil");
  }
};

const PutEstadoCambio = async(req,res)=>{
  const {id}= req.params;
  const estado = 'ACTIVO'
  try {
    await pool.query('UPDATE participante SET estado = ? WHERE id= ?',[estado,id])
    res.status(200).json({ message: 'Cambio de estado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error al guardar los datos',
      details: error.message
    });
  }
}

const putCampoProyect = async (req, res) => {
  const { id } = req.params;
  const { campo, valor } = req.body;

  const camposPermitidos = ["nombre", "descripcion"];

  if (!camposPermitidos.includes(campo)) {
    return res.status(400).json({ error: "Campo no permitido" });
  }

  const query = `UPDATE proyectos SET ${campo} = ? WHERE id = ?`;

  try {
    await pool.query(query, [valor, id]);
    res.status(200).json({ message: "Datos guardados correctamente" });
  } catch (error) {
    console.error("Error al guardar datos:", error);
    res.status(500).json({ error: "Error al guardar los datos" });
  }
};

module.exports={
    putCampo,putCampoNeg,  FotoPerfil,putCorreo,updateConfiguracion,updatePassword,FotoTaller,putCampoProyect,
        PutEstadoCambio
}