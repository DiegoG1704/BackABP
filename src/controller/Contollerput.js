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

module.exports={
    putAreasEstados,
    putInformes,
    putEstadosPedidos,
    PutCliente,
    putPersonal,
    putEstadoPersonal,
    putEditTaller,
    putRol
}