const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');

const postPrenda = async (req, res) => {
  const { nombre, idMaterial, precioU, precioM, productos } = req.body;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    // 1. Insertar modelo
    const [modeloResult] = await conn.query(
      'INSERT INTO modelo (nombre, idMaterial, precioU, precioM) VALUES (?, ?, ?, ?)',
      [nombre, idMaterial, precioU, precioM]
    );
    const idModelo = modeloResult.insertId;

    // 2. Iterar sobre productos
    for (const producto of productos) {
      const { nombre, color, genero, stock = '' } = producto;

      // Buscar ID del color
      const [colorResult] = await conn.query('SELECT id FROM color WHERE nombre = ?', [color]);
      const idColor = colorResult[0]?.id;

      if (!idColor) {
        throw new Error(`Color '${color}' no encontrado en la base de datos.`);
      }

      // 3. Insertar prenda
      const [prendaResult] = await conn.query(
        'INSERT INTO prenda (nombre, idColor, genero, stock, idModelo) VALUES (?, ?, ?, ?, ?)',
        [nombre, idColor, genero, stock, idModelo]
      );
      const idPrenda = prendaResult.insertId;
      const [tallaIds] = await conn.query('SELECT id FROM talla');

      for (const talla of tallaIds) {
        await conn.query(
          'INSERT INTO prenda_talla (idPrenda, idTalla) VALUES (?, ?)',
          [idPrenda, talla.id]
        );
      }

    }

    await conn.commit();
    res.status(201).json({ message: 'Datos guardados correctamente' });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  } finally {
    conn.release();
  }
};

const postRol = async (req, res) => {
  const { nombre, rutas } = req.body;

  try {
    // Insertar el rol y obtener el ID generado
    const [rolResult] = await pool.query('INSERT INTO rol (nombre) VALUES (?)', [nombre]);
    const idRol = rolResult.insertId;

    // Crear los valores para la inserción múltiple
    const valores = rutas.map(r => [idRol, r.id]); // genera array de arrays [[1,1],[1,2]]

    // Inserción múltiple en rol_vista
    await pool.query('INSERT INTO rol_vistas (idRol, idVistas) VALUES ?', [valores]);

    res.status(201).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  }
}

const postPersonal = async (req, res) => {
  const { dni, nombres, telefono, idRol, usuario, contraseña } = req.body;

  // Validación básica
  if (!dni || !nombres || !telefono || !idRol || !usuario || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar en tabla datos
    const [datosResult] = await connection.query(
      'INSERT INTO datos (dni, nombres, telefono, idRol) VALUES (?, ?, ?, ?)',
      [dni, nombres, telefono, idRol]
    );

    const idDatos = datosResult.insertId;

    // Insertar en tabla usuario
    await connection.query(
      'INSERT INTO usuario (usuario, contraseña, idDatos) VALUES (?, ?, ?)',
      [usuario, contraseña, idDatos]
    );

    await connection.commit();
    res.status(201).json({ message: 'Datos guardados correctamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar los datos' });
  } finally {
    connection.release();
  }
};

const postTaller = async (req, res) => {
  const { dni, nombres, telefono, nombre, direccion } = req.body;

  if (!dni || !nombres || !telefono || !nombre || !direccion) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insertar encargado
    const [resultUser] = await connection.query(
      'INSERT INTO datos (dni, nombres, telefono, idrol) VALUES (?, ?, ?, 1)',
      [dni, nombres, telefono]
    );
    const idEncargado = resultUser.insertId;

    // Insertar taller y asociarlo al encargado
    await connection.query(
      'INSERT INTO talleres (nombre, direccion, idencargado) VALUES (?, ?, ?)',
      [nombre, direccion, idEncargado]
    );

    await connection.commit();
    res.status(201).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar datos:', error);
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  } finally {
    connection.release();
  }
};

const postProduccion = async (req, res) => {
  const { idModelo, talleres } = req.body;
  // const areas = {Corte,Confección,Acabados}
  const queryGetLastCode = 'SELECT codigo FROM produccion ORDER BY id DESC LIMIT 1'; // Asume que la PK es 'id'
  const queryInsertProduccion = 'INSERT INTO produccion(codigo, idModelo) VALUES (?, ?)';
  const queryInsertDetalle = 'INSERT INTO detalle_produccion(idProduccion, idPrenda, idResponsable, cantidad) VALUES (?, ?, ?, ?)';
  const queryInsertDetallePrenda = 'INSERT INTO detalle_prenda(idDetalle, talla,cantidad,cantidadExt,cantidadTotal) VALUES (?, ?, ?, ?, ?)';
  const queryInfo = 'INSERT INTO informe(area, idDetallePrenda) VALUES (?, ?)'

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Obtener último código
    const [rows] = await connection.query(queryGetLastCode);
    let newCode = 'A001';

    if (rows.length > 0) {
      const lastCode = rows[0].codigo;
      const lastNumber = parseInt(lastCode.slice(1)) || 0;
      const nextNumber = lastNumber + 1;
      newCode = 'A' + nextNumber.toString().padStart(3, '0');
    }

    // Insertar nueva producción
    const [result] = await connection.query(queryInsertProduccion, [newCode, idModelo]);
    const idProduccion = result.insertId;

    // Insertar detalles por taller y prenda
    for (const taller of talleres) {
      const idResponsable = parseInt(taller.idResponsable);

      for (const prenda of taller.prendas) {
        const idPrenda = parseInt(prenda.id);
        const cantidadTotal = parseInt(prenda.cantidadTotal) || 0;

        const [detalle] = await connection.query(queryInsertDetalle, [
          idProduccion, idPrenda, idResponsable, cantidadTotal
        ]);
        const idDetalle = detalle.insertId;

        // Insertar en detalle_prenda
        const [detallePrenda] = await connection.query(queryInsertDetallePrenda, [
          idDetalle,prenda.tallaId,prenda.cantidad,prenda.cantidadExt,prenda.cantidadTotal
        ]);
        const idDetallePrenda = detallePrenda.insertId;

        //Crear detalle de cada area
        const areas = ['2', '3', '4'];

        for (const area of areas) {
          await connection.query(queryInfo, [
            area,
            idDetallePrenda
          ]);
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Producción guardada con código: ' + newCode });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear producción:', error);
    res.status(500).json({ error: 'Error al crear producción', details: error.message });
  } finally {
    connection.release();
  }
};

const PostInformePrenda = async (req, res) => {
  const { id, area } = req.params;
  const { prendasInfo } = req.body;
  const fechaFin = new Date();

  const queryProduccion = 'UPDATE produccion SET area = ? WHERE id = ?';
  const queryDetalle = 'UPDATE detalle_prenda SET cantidadTotal = ? WHERE id = ?';
  const queryFechaFin = 'UPDATE produccion SET estado = 5, fechaFin = ? WHERE id = ?';
  const queryTalla = `
    UPDATE prenda_talla 
    SET cantidad = cantidad + ? 
    WHERE idPrenda = ? AND idTalla = ?
  `;

  try {
    // 1️⃣ Actualiza el área de la producción
    await pool.query(queryProduccion, [area, id]);

    // 2️⃣ Si el área es 5 (FINALIZADO)
    if (Number(area) === 5) {
      // Marca producción como finalizada
      await pool.query(queryFechaFin, [fechaFin, id]);

      // Aumenta stock por prenda y talla
      for (const prenda of prendasInfo) {
        await pool.query(queryTalla, [
          prenda.cantidadTotal - (prenda.merma || 0), // cantidad real
          prenda.idPrenda,
          prenda.idTalla
        ]);
      }
    }

    // 3️⃣ Actualiza detalle_prenda
    for (const prenda of prendasInfo) {
      await pool.query(queryDetalle, [
        prenda.cantidadTotal,
        prenda.id
      ]);
    }

    return res.status(201).json({
      message: 'Informe actualizado correctamente'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error interno del servidor al guardar el informe',
      error
    });
  }
};

const PostColor = async (req, res) => {
  const {nombre}= req.body
  const query = 'INSERT INTO color(nombre) VALUES (?)'
  try {
    await pool.query(query,[nombre])
    return res.status(201).json({
      message: 'Color Agregado correctamente'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error interno del servidor al guardar el informe',
      error
    });
  }
};

const PostMaterial = async (req, res) => {
  const {nombre}= req.body
  const query = 'INSERT INTO material(nombre) VALUES (?)'
  try {
    await pool.query(query,[nombre])
    return res.status(201).json({
      message: 'Material Agregado correctamente'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error interno del servidor al guardar el informe',
      error
    });
  }
};

const PostCliente = async (req, res) => {
  const {tipodocumento,documento,nombre,direccion,telefono}= req.body
  const query = 'INSERT INTO cliente(tipodocumento,documento,nombre,direccion,telefono) VALUES (?,?,?,?,?)'
  try {
    await pool.query(query,[tipodocumento,documento,nombre,direccion,telefono])
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

const PostVenta = async (req, res) => {
  const { idCliente, idUsuario, direccion, telefono, tipoPago, tipoVenta, total, productos } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ✅ Insertar SOLO UNA VEZ
    const [result] = await connection.query(
      `INSERT INTO venta
       (idUsuario, tipoPago, total, direccion, telefono, tipoVenta, estado)
       VALUES (?,?,?,?,?,?,?)`,
      [
        idUsuario,
        tipoPago,
        total,
        direccion,
        telefono,
        tipoVenta,
        Number(tipoVenta) === 1 ? 3 : 1
      ]
    );

    const idVenta = result.insertId;

    // ✅ Si es venta tipo 1, registrar cliente
    if (Number(tipoVenta) === 1 || Number(tipoVenta) === 3) {
      await connection.query(
        'INSERT INTO venta_cliente(idVenta,idCliente) VALUES (?,?)',
        [idVenta, idCliente]
      );
    }

    // 🔁 Procesar productos
    for (const product of productos) {

      const [rows] = await connection.query(
        `SELECT cantidad 
         FROM prenda_talla 
         WHERE idPrenda = ? AND idTalla = ? 
         FOR UPDATE`,
        [product.idPrenda, product.idTalla]
      );

      if (rows.length === 0) {
        throw new Error(`No existe stock para la prenda ${product.idPrenda}`);
      }

      const stockActual = rows[0].cantidad;

      if (stockActual < product.cantidad) {
        throw new Error(`Stock insuficiente para la prenda ${product.idPrenda}`);
      }

      await connection.query(
        'INSERT INTO detalle_venta(idVenta,idPrenda,idTalla,cantidad) VALUES (?,?,?,?)',
        [idVenta, product.idPrenda, product.idTalla, product.cantidad]
      );

      if (Number(tipoVenta) === 1 || Number(tipoVenta) === 2) {
        await connection.query(
          `UPDATE prenda_talla 
          SET cantidad = cantidad - ? 
          WHERE idPrenda = ? AND idTalla = ?`,
          [product.cantidad, product.idPrenda, product.idTalla]
        );
      }
      if (Number(tipoVenta) === 3) {
        await connection.query(
          `UPDATE detalle_produccion 
          SET cantidadReservada = cantidadReservada + ?
          WHERE idProduccion = ? AND idPrenda = ?`,
          [product.cantidad, product.idProduccion, product.idPrenda]
        );
      }
      
    }

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: 'Venta registrada correctamente',
      idVenta
    });

  } catch (error) {

    await connection.rollback();
    connection.release();

    console.error(error);

    return res.status(400).json({
      message: error.message || 'Error interno del servidor',
    });
  }
};

const PostObservacion = async (req, res) => {
  const {idVenta}=req.params;
  const {descripcion}=req.body;
  try {
    await pool.query('INSERT INTO observacion(descripcion,idVenta) VALUES (?,?)',[descripcion,idVenta])
    await pool.query('UPDATE venta SET estado = 4 WHERE id = ?',[idVenta])
     return res.status(201).json({
      message: 'observacion guardado correctamente'
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error.message || 'Error interno del servidor',
    });
  }
}

const PostAsistencia = async (req, res) => {
  const { personaId } = req.params;
  const horaEntrada = "08:00";

  try {
    const now = new Date();
    const horaActual = now.toTimeString().slice(0, 5);

    const ingreso = new Date(`1970-01-01T${horaActual}:00`);
    const entrada = new Date(`1970-01-01T${horaEntrada}:00`);

    let estado = ingreso <= entrada ? 1 : 2;

    // 🔍 1. Verificar si ya existe asistencia hoy
    const [rows] = await pool.query(
      `SELECT * 
       FROM asistencia 
       WHERE personaId = ? 
       AND DATE(fecha) = CURDATE()`,
      [personaId]
    );

    // 🟢 2. Si NO existe → registrar entrada
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO asistencia (estado, personaId, fecha, horaIngreso) 
         VALUES (?, ?, NOW(), NOW())`,
        [estado, personaId]
      );

      return res.json({
        message: "Entrada registrada",
        estado
      });
    }

    // 🔴 4. Si ya tiene entrada y salida → bloquear
    return res.status(400).json({
      message: "Ya registraste tu asistencia hoy"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};

module.exports={
  PostVenta,postPrenda,postRol,postPersonal,postTaller, postProduccion,PostInformePrenda,PostColor,
  PostMaterial, PostCliente, PostObservacion,PostAsistencia
}