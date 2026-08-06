const multer = require("multer");
const { pool } = require("../database.js");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');

const putCorreo = async (req, res) => {
  const { id } = req.params;
  const { correo } = req.body;
  const query = 'UPDATE datos SET correo =? WHERE id=?'
  try {
    await pool.query(query, [correo, id])
    res.status(200).json({ message: 'Producción iniciada con éxito' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json('error');
  }
}

const putCuposEmpresa = async (req, res) => {
  const { id } = req.params;
  const { cupos } = req.body;
  const query = 'UPDATE empresa SET cupos =? WHERE id=?'
  try {
    await pool.query(query, [cupos, id])
    res.status(200).json({ message: 'Cambio con éxito' });
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

    const passwordCorrecta = await bcrypt.compare(password, currentPassword);
    if (!passwordCorrecta) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    // 3. Actualizar contraseña (hasheada)
    const hashedPassword = await bcrypt.hash(passwordNew, 10);
    await pool.query(
      "UPDATE usuario SET contraseña = ? WHERE idDatos = ?",
      [hashedPassword, id]
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

const PutEstadoCambio = async (req, res) => {
  const { id } = req.params;
  const estado = "ACTIVO";

  try {
    const [resultEvento] = await pool.query(
      `
            SELECT
                p.id AS participanteId,
                p.correo,
                p.codigo,
                e.nombre,
                e.descripcion,
                DATE_FORMAT(e.fechaEvento, '%d-%m-%Y') AS FechaEvento
            FROM participante p
            INNER JOIN evento e
                ON p.evento_id = e.id
            WHERE p.id = ?
        `,
      [id]
    );

    if (resultEvento.length === 0) {
      return res.status(404).json({
        message: "Participante no encontrado"
      });
    }

    const participante = resultEvento[0];

    const qr = await QRCode.toDataURL(participante.codigo);
    const qrBase64 = qr.replace(/^data:image\/png;base64,/, "");



    const { error } = await resend.emails.send({

      from: "ADB <noreply@massalud.org.pe>",
      to: participante.correo,
      subject: `Confirmación de inscripción - ${participante.nombre}`,

      html: `
        <!DOCTYPE html>
        <html lang="es">
        <body style="font-family: Arial; background:#f5f5f5; padding:30px;">

            <table width="600" align="center"
                style="background:#ffffff;border-radius:10px;padding:30px;">

                <tr>
                    <td align="center">
                        <h1 style="color:#0d6efd;">
                            ¡Registro exitoso!
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td>
                        <h2>${participante.nombre}</h2>

                        <p>
                            <strong>Descripción:</strong><br>
                            ${participante.descripcion}
                        </p>

                        <p>
                            <strong>Fecha del evento:</strong><br>
                            ${participante.FechaEvento}
                        </p>
                    </td>
                </tr>


                <tr>
                    <td align="center" style="padding:25px 0;">

                        <img
                            src="cid:qr-evento"
                            alt="Código QR"
                            width="220"
                            height="220"
                        />

                    </td>
                </tr>


               

            </table>

        </body>
        </html>
        `,

      attachments: [
        {
          filename: "qr-evento.png",
          content: qrBase64,
          contentType: "image/png",
          contentId: "qr-evento"
        }
      ]
    });
    await resend.emails.send({
      from: "ADB <noreply@massalud.org.pe>",
      to: "info@asociaciondebodegueros.com.pe",
      subject: `Nuevo registro - ${Titulo}`,

      html: `
        <div style="font-family: Arial, Helvetica, sans-serif;">
            <h2>Nuevo registro</h2>

            <p>
                Se registró <strong>${nombres}</strong>
                al evento <strong>${Titulo}</strong>.
            </p>
        </div>
    `
    });

    if (error) {
      return res.status(500).json({
        message: "No se pudo enviar el correo",
        error
      });
    }

    await pool.query(
      "UPDATE participante SET estado=? WHERE id=?",
      [estado, id]
    );

    res.status(200).json({
      message: "Estado actualizado y correo enviado."
    });

  } catch (error) {
    res.status(500).json({
      message: "Error interno",
      error: error.message
    });
  }
};

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

module.exports = {
  putCampo, putCampoNeg, FotoPerfil, putCorreo, updateConfiguracion, updatePassword, FotoTaller, putCampoProyect,
  PutEstadoCambio, putCuposEmpresa
}