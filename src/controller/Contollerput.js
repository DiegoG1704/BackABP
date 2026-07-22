const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');

const putAreasEstados = async (req, res) => {
    const { id } = req.params;
    const {area,estado}=req.body;
    const query = 'UPDATE produccion SET estado = ?, area = ? WHERE id = ?';

    try {
        await pool.query(query, [estado, area, id]);
        res.status(200).json({ message: 'Producción iniciada con éxito' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('error');
    }
}

const putInformes = async(req,res) =>{
    const {id}= req.params;
    const {idUsuario,cantidad,cantMerma} = req.body;
    const fecha = new Date();
    const query ='UPDATE informe SET idUsuario =?, fecha=?, cantidad=?, cantMerma=?, estadoInforme = 2 WHERE id=?'
    try {
        await pool.query(query,[idUsuario,fecha,cantidad,cantMerma,id])
        res.status(200).json({ message: 'Producción iniciada con éxito' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('error');
    }
}

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

const putEstadosPedidos = async(req,res) =>{
    const {estado,id}= req.params;
    const query ='UPDATE venta SET estado = ? WHERE id=?'
    try {
        await pool.query(query,[estado,id])
        res.status(200).json({ message: 'cambio de fase correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('error');
    }
}

const PutCliente = async (req, res) => {
  const {id} = req.params;
  const {tipodocumento,documento,nombre,direccion,telefono}= req.body
  const query = 'UPDATE cliente SET tipodocumento = ?,documento = ?,nombre = ?,direccion = ?,telefono = ? WHERE id = ?'
  try {
    await pool.query(query,[tipodocumento,documento,nombre,direccion,telefono,id])
    return res.status(201).json({
      message: 'Cliente Agregado correctamente'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error interno del servidor al guardar el informe',
      error
    });
  }
};

const putPersonal = async (req, res) => {
  const { id } = req.params;
  const { dni, nombres, telefono, idRol } = req.body;

  // Validación básica
  if (!dni || !nombres || !telefono || !idRol) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    await pool.query(
      'UPDATE cliente SET dni = ?,nombres = ?,telefono = ?,idRol= ? WHERE id = ?',
      [dni, nombres, telefono, idRol, id]
    );

    res.status(201).json({ message: 'Datos guardados correctamente' });

  } catch (error) {
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  } 
};

const putEstadoPersonal = async (req, res) => {
  const { id } = req.params;
  const { estado,descripcion } = req.body;

  try {
    await pool.query(
      'UPDATE datos SET estado = ? WHERE id = ?',
      [estado, id]
    );
    await pool.query('INSERT INTO observacion_personal(descripcion,idPersonal) VALUES (?,?)',[descripcion,id])
    res.status(201).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  } 
};

const putEditTaller = async (req, res) => {
  const { id } = req.params;
  const { nombre,direccion} = req.body;
  try {
    await pool.query(
      'UPDATE talleres SET nombre = ?, direccion = ? WHERE id = ?',
      [nombre,direccion, id]
    );
    res.status(201).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
}

const putLeido= async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE notificaciones SET estado = 2 WHERE id = ?',
      [id]
    );
    res.status(201).json({ message: 'notificion leida correctamente' });
  } catch (error) {
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  }
}

const putRol = async (req, res) => {
  const { id } = req.params;
  const { nombre, rutas } = req.body; // rutas es array de IDs

  try {
    // 1️⃣ Actualizar nombre del rol
    await pool.query(
      'UPDATE rol SET nombre = ? WHERE id = ?',
      [nombre, id]
    );

    // 2️⃣ Obtener vistas actuales
    const [currentRows] = await pool.query(
      'SELECT idVistas FROM rol_vistas WHERE idRol = ?',
      [id]
    );
    const currentVistas = currentRows.map(row => row.idVistas);

    // 3️⃣ Calcular diferencias
    const nuevas = rutas.filter(r => !currentVistas.includes(r)); // agregar
    const eliminar = currentVistas.filter(r => !rutas.includes(r)); // eliminar

    // 4️⃣ Insertar nuevas vistas si hay
    if (nuevas.length > 0) {
      const valoresInsert = nuevas.map(r => [id, r]);
      await pool.query(
        'INSERT INTO rol_vistas (idRol, idVistas) VALUES ?',
        [valoresInsert]
      );
    }

    // 5️⃣ Eliminar vistas que ya no están
    if (eliminar.length > 0) {
      await pool.query(
        `DELETE FROM rol_vistas WHERE idRol = ? AND idVistas IN (?)`,
        [id, eliminar]
      );
    }

    res.json({ message: 'Rol actualizado correctamente (pro)' });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al actualizar rol',
      error: error.message
    });
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

const putCanvas = async (req, res) => {
  const {id}=req.params;
  const { nombre, tipo, estructura,tamaño,orientacion } = req.body;

  try {
    // Insertar el rol y obtener el ID generado
    const [rolResult] = await pool.query('UPDATE canvas SET nombre = ?, tipo=?, estructura=?, tamaño=?, orientacion=? WHERE id = ? ', [nombre,tipo,JSON.stringify(estructura),tamaño,orientacion,id]);

    res.status(201).json({ message: 'Datos Actualizados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  }
}

const putAdministracion = async (req, res) => {
  const {id,userId}=req.params;
  const { cantidad, descripcion, frecuenciaPago } = req.body;

  try {
    // Insertar el rol y obtener el ID generado
    await pool.query('UPDATE administracion SET cantidad = ?, descripcion=?, frecuenciaPago=? WHERE id = ? AND userId = ? ', [cantidad, descripcion, frecuenciaPago,id,userId]);

    res.status(201).json({ message: 'Datos Actualizados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  }
}

const putAsignacion = async (req,res) =>{
  const {userId,id} = req.params;
  const horaAsignacion = new Date();
  const personal = userId
  try {
    await pool.query('UPDATE actividades SET personal = ?, horaAsignacion = ? WHERE id = ?',[personal,horaAsignacion,id])
    res.status(201).json({ message: 'Asignacion correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  }
}

const putTareaEstado = async (req, res) => {
  const { idActividad, id } = req.params;
  const { estado } = req.body;

  try {
    await pool.query(
      'UPDATE tareas SET estado = ? WHERE idActividad = ? AND id = ?',
      [estado, idActividad, id]
    );

    res.status(200).json({ message: 'Cambio de estado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error al guardar los datos',
      details: error.message
    });
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
    putAreasEstados,
    putInformes,
    putEstadosPedidos,
    PutCliente,
    putPersonal,
    putEstadoPersonal,
    putEditTaller,
    putRol,
    putCampo,
    putCampoNeg,
    putCorreo,
    updateConfiguracion,
    updatePassword,
    FotoPerfil,FotoTaller,putLeido,
    putCanvas,
    putAdministracion,
    putAsignacion, 
    putTareaEstado,
    putCampoProyect,
    PutEstadoCambio
}