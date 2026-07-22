const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');
const QRCode = require("qrcode");

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

    await connection.query(
      'INSERT INTO rol_config(configId,userId) VALUES (1, ?)',
      [idDatos]
    )

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

const PostNotificacines = async (req, res) => {
  const {remitente} = req.params
  const {mensaje,titulo,userId}= req.body
  const query = 'INSERT INTO notificaciones(mensaje,titulo,remitente,userId) VALUES (?,?,?,?)'
  try {
    await pool.query(query,[mensaje,titulo,userId,remitente])
    return res.status(201).json({
      message: 'mensaje enviado correctamente'
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

const postCanvas = async (req, res) => {
  const { nombre, tipo, estructura,tamaño,orientacion } = req.body;

  try {
    // Insertar el rol y obtener el ID generado
    const [rolResult] = await pool.query('INSERT INTO canvas (nombre, tipo, estructura,tamaño,orientacion) VALUES (?,?,?,?,?)', [nombre,tipo,JSON.stringify(estructura),tamaño,orientacion]);

    res.status(201).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  }
}

const postModulos = async (req, res) => {
  const { idUsuario, idVista } = req.body;

  

  try {
    // 2. VALIDAR SI YA LO TIENE
  const [existeModulo] = await pool.query(`
      SELECT *
      FROM usuario_vistas
      WHERE idUsuario = ?
      AND idVista = ?
  `, [
      idUsuario,
      idVista
  ]);

  if (existeModulo.length > 0) {

      return res.status(500).json({
          error: 'El usuario ya tiene este módulo'
      });

  }
    // Insertar el rol y obtener el ID generado
    await pool.query('INSERT INTO usuario_vistas (idUsuario, idVista) VALUES (?,?)', [idUsuario,idVista]);

    res.status(201).json({ message: 'Datos guardados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos', details: error.message });
  }
}

const postRegistro = async (req, res) => {
  const { dni, nombres, telefono, usuario, contraseña } = req.body;

  // Validación básica
  if (!dni || !nombres || !telefono || !usuario || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar en tabla datos
    const [datosResult] = await connection.query(
      'INSERT INTO datos (dni, nombres, telefono, idRol) VALUES (?, ?, ?, 9)',
      [dni, nombres, telefono, idRol]
    );

    const idDatos = datosResult.insertId;

    // Insertar en tabla usuario
    await connection.query(
      'INSERT INTO usuario (usuario, contraseña, idDatos) VALUES (?, ?, ?)',
      [usuario, contraseña, idDatos]
    );

    await connection.query(
      'INSERT INTO rol_config(configId,userId) VALUES (1, ?)',
      [idDatos]
    )

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

const postMovimientos = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { tipoAdmin } = req.params;

    const {
      cantidad,
      descripcion,
      tipoPago,
      frecuenciaPago,
      cliente,
      prestamos,
      userId
    } = req.body;

    // ==========================
    // ADMINISTRACION
    // ==========================
    const fechaVenc = new Date();

    if (tipoPago === 1 && frecuenciaPago) {
      switch (frecuenciaPago) {
        case 1: // semanal
          fechaVenc.setDate(fechaVenc.getDate() + 7);
          break;

        case 2: // mensual
          fechaVenc.setMonth(fechaVenc.getMonth() + 1);
          break;

        case 3: // anual
          fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
          break;
      }
    }
    const [resultUserDat] = await pool.query(
      'SELECT * FROM usuario WHERE idDatos = ?',
      [userId]
    );

   const [adminResult] = await connection.query(
    `INSERT INTO Administracion
    (cantidad, descripcion, tipoPago, frecuenciaPago, tipoAdmin, fechaVenc,userId)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      cantidad,
      descripcion,
      tipoPago,
      frecuenciaPago,
      tipoAdmin,
      tipoPago === 1 ? fechaVenc : null,
      resultUserDat[0].id
    ]
  );

    const idAdministracion = adminResult.insertId;

    const [resultUser] = await pool.query(
      'SELECT presupuesto FROM datos WHERE id = ?',
      [userId]
    );

    const pres = Number(resultUser[0].presupuesto || 0);
    const monto = Number(cantidad);

    if (Number(tipoAdmin) === 1) {
      await pool.query(
        'UPDATE datos SET presupuesto = COALESCE(presupuesto, 0) + ? WHERE id = ?',
        [monto, userId]
      );
    } else if (Number(tipoAdmin) === 2 || Number(tipoAdmin) === 3) {
      if (pres < monto) {
        return res.status(400).json({
          message: 'No hay suficiente presupuesto',
        });
      }

      await pool.query(
        'UPDATE datos SET presupuesto = presupuesto - ? WHERE id = ?',
        [monto, userId]
      );
    }

    // ==========================
    // CLIENTE
    // ==========================
    let idPrestamo = null;
    if (Number(tipoAdmin) === 3) {
       if (!cliente?.length) {
          throw new Error("Debe enviar un cliente");
        }

        if (!prestamos?.length) {
          throw new Error("Debe enviar un préstamo");
        }
    const cli = cliente[0];

    const [clienteResult] = await connection.query(
      `INSERT INTO cliente
      (documento, nombre, apellido, telefono, tipo)
      VALUES (?,?,?,?,2)`,
      [
        cli.documento,
        cli.nombre,
        cli.apellido,
        cli.telefono
      ]
    );

    const idCliente = clienteResult.insertId;

    // ==========================
    // PRESTAMO
    // ==========================
    const prest = prestamos[0];

    const [prestamoResult] = await connection.query(
      `INSERT INTO prestamo(
        tipoCobro,
        cantidadCuotas,
        recurrencia,
        fechaPago,
        tieneInteres,
        tipoInteres,
        valorInteres,
        montoInteres,
        montoTotal,
        montoPagado,
        saldoPendiente,
        estado,
        idAdministracion,
        idCliente
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        prest.tipoCobro,
        prest.cantidadCuotas,
        prest.recurrencia,
        prest.fechaPago,
        prest.tieneInteres,
        prest.tipoInteres,
        prest.valorInteres,
        prest.montoInteres,
        prest.montoTotal,
        0,
        prest.montoTotal,
        'PENDIENTE',
        idAdministracion,
        idCliente
      ]
    );

    const idPrestamo = prestamoResult.insertId;

    // ==========================
    // GENERAR CUOTAS
    // ==========================
    const cuotas = [];

    let fechaBase;

    if (prest.fechaPago) {
      fechaBase = new Date(prest.fechaPago);
    } else {
      fechaBase = new Date();
      fechaBase.setMonth(fechaBase.getMonth() + 1);
    }

    const montoCuota =
      Number(prest.montoTotal) /
      Number(prest.cantidadCuotas);

    for (let i = 1; i <= prest.cantidadCuotas; i++) {
      const fechaVencimiento = new Date(fechaBase);

      switch (prest.recurrencia) {
        case "SEMANAL":
          fechaVencimiento.setDate(
            fechaVencimiento.getDate() + (7 * (i - 1))
          );
          break;

        case "MENSUAL":
          fechaVencimiento.setMonth(
            fechaVencimiento.getMonth() + (i - 1)
          );
          break;

        case "ANUAL":
          fechaVencimiento.setFullYear(
            fechaVencimiento.getFullYear() + (i - 1)
          );
          break;
      }

      cuotas.push([
        idPrestamo,
        i,
        montoCuota.toFixed(2),
        fechaVencimiento,
        null,
        0,
        "PENDIENTE"
      ]);
    }

    await connection.query(
      `INSERT INTO prestamo_cuota
      (
        idPrestamo,
        numeroCuota,
        montoCuota,
        fechaVencimiento,
        fechaPago,
        montoPagado,
        estado
      )
      VALUES ?`,
      [cuotas]
    );

  }

    await connection.commit();

    res.status(201).json({
      success: true,
      idPrestamo,
      message: "Registro echo correctamente"
    });

  } catch (error) {
    await connection.rollback();

    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    connection.release();
  }
};

const postPagosPrestamo = async (req, res) => {
  const { idCuota, idPrestamo, monto, userId } = req.body;

  let connection;

  try {
    // Validaciones básicas
    if (!idCuota || !idPrestamo || !monto) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos requeridos",
      });
    }

    const montoPago = Number(monto);

    if (isNaN(montoPago) || montoPago <= 0) {
      return res.status(400).json({
        ok: false,
        message: "Monto inválido",
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    // Obtener información de la cuota
    const [cuotas] = await connection.query(
      `SELECT *
       FROM prestamo_cuota
       WHERE idCuota = ? AND idPrestamo = ?`,
      [idCuota, idPrestamo]
    );

    if (cuotas.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        ok: false,
        message: "La cuota no existe",
      });
    }

    const cuota = cuotas[0];

    // Obtener información del préstamo
    const [prestamos] = await connection.query(
      `SELECT *
       FROM prestamo
       WHERE id = ?`,
      [idPrestamo]
    );

    if (prestamos.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        ok: false,
        message: "El préstamo no existe",
      });
    }

    const prestamo = prestamos[0];

    // Validar que la cuota no esté pagada
    if (cuota.estado === "PAGADA") {
      await connection.rollback();

      return res.status(400).json({
        ok: false,
        message: "La cuota ya fue pagada",
      });
    }

    // Validar que no exceda el monto pendiente de la cuota
    const montoPendienteCuota =
      Number(cuota.montoCuota) - Number(cuota.montoPagado);

    if (montoPago > montoPendienteCuota) {
      await connection.rollback();

      return res.status(400).json({
        ok: false,
        message: `El monto excede el saldo pendiente de la cuota (${montoPendienteCuota})`,
      });
    }

    // Registrar pago
    await connection.query(
      `INSERT INTO prestamo_pago
      (idPrestamo, idCuota, monto)
      VALUES (?, ?, ?)`,
      [idPrestamo, idCuota, montoPago]
    );

    // Actualizar cuota
    await connection.query(
      `UPDATE prestamo_cuota
       SET montoPagado = montoPagado + ?
       WHERE idCuota = ? AND idPrestamo = ?`,
      [montoPago, idCuota, idPrestamo]
    );

    // Actualizar préstamo
    await connection.query(
      `UPDATE prestamo
       SET
          montoPagado = montoPagado + ?,
          saldoPendiente = saldoPendiente - ?,
          fechaActualizacion = CURDATE(),
          estado = 'PAGANDO'
       WHERE id = ?`,
      [montoPago, montoPago, idPrestamo]
    );

    // Calcular nuevos montos
    const nuevoMontoCuota =
      Number(cuota.montoPagado) + montoPago;

    const nuevoMontoPrestamo =
      Number(prestamo.montoPagado) + montoPago;

    // Marcar cuota como pagada
    if (nuevoMontoCuota >= Number(cuota.montoCuota)) {
      await connection.query(
        `UPDATE prestamo_cuota
         SET
            estado = 'PAGADA',
            fechaPago = NOW()
         WHERE idCuota = ? AND idPrestamo = ?`,
        [idCuota, idPrestamo]
      );
    }

    // Marcar préstamo como pagado
    if (nuevoMontoPrestamo >= Number(prestamo.montoTotal)) {
      await connection.query(
        `UPDATE prestamo
         SET estado = 'PAGADO', fechaPago = CURDATE()
         WHERE id = ?`,
        [idPrestamo]
      );
      if (prestamo.montoInteres > 0) {
        await connection.query(
          `INSERT INTO Administracion
          (cantidad, descripcion, tipoAdmin)
          VALUES (?,?,?)`,
          [
            prestamo.montoInteres,
            "Interes de Prestamo",
            1
          ]
        );
      }

      
      await pool.query(
        'UPDATE datos SET presupuesto = COALESCE(presupuesto, 0) + ? WHERE id = ?',
        [prestamo.montoTotal, userId]
      );
    }

    await connection.commit();

    return res.status(200).json({
      ok: true,
      message: "Pago registrado correctamente",
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Error al registrar pago:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const PostActividad = async (req,res)=>{
  const {userId} = req.params;
  const {titulo,descripcion,area,prioridad,personal, Lista} = req.body;
  const creadorAct = userId;
  try {
    const [result]= await pool.query(`
      INSERT INTO actividades (titulo,descripcion,area,prioridad,personal,creadorAct) VALUES(?,?,?,?,?,?)`,
    [titulo,descripcion,area,prioridad,personal,creadorAct])
    const idActividad = result.insertId;

    for (const List of Lista) {
        await pool.query('INSERT INTO tareas (descripcion,idActividad) VALUES (?,?)',[List.descripcion,idActividad])
      }
    return res.status(200).json({
      ok: true,
      message: "Pago registrado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}

const PostEvidencia = async (req, res) => {
  try {
    const {id} = req.params;
    const {titulo,descripcion} = req.body;
    const imagen = req.file ? req.file.filename : null;

    const query = "INSERT INTO evidencia(titulo,descripcion,imagen,actividadId) VALUES (?,?,?,?)";
    await pool.query(query, [titulo,descripcion,imagen,id]);
    return res.status(200).json({
      ok: true,
      message: "Pago registrado correctamente",
    });
  } catch (error) {
    console.error("Errorl:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const PostTarea = async(req,res) =>{
  const {idActividad} = req.params;
  const {descripcion} = req.body;
  const query = 'INSERT INTO tareas (descripcion, idActividad) VALUES (?,?)'
  try {
    await pool.query(query,[descripcion,idActividad])
    return res.status(200).json({
      ok: true,
      message: "Tarea registrada correctamente",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}

const generarCodigo = (longitud = 10) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';

  for (let i = 0; i < longitud; i++) {
    codigo += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }

  return codigo;
};

const PostProyecto = async (req, res) => {
  const { nombre, descripcion, responsable } = req.body;

  const codigo = generarCodigo(10);

  const query = `
    INSERT INTO proyectos (nombre, descripcion, responsable, codigo)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await pool.query(query, [
      nombre,
      descripcion,
      responsable,
      codigo,
    ]);

    return res.status(200).json({
      ok: true,
      message: "Proyecto registrado correctamente",
      codigo,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const PostEvento = async (req, res) => {
  const { nombre, descripcion, fechaEvento, tipo } = req.body;

  const codigo = generarCodigo(10);

  const query = `
    INSERT INTO evento (nombre, descripcion, fechaEvento, tipo, codigo)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    await pool.query(query, [
      nombre,
      descripcion,
      fechaEvento,
      tipo,
      codigo,
    ]);

    return res.status(200).json({
      ok: true,
      message: "Proyecto registrado correctamente",
      codigo,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

const PostProyectoPersonal = async (req,res) =>{
  const { idProyecto, idPersonal } = req.params;
  const { estado, solicitud } = req.body;
  const query = 'INSERT INTO proyectos_empleados(idProyecto, idPersonal, estado, solicitud) VALUES (?,?,?,?)'
  try {
    await pool.query(query,[idProyecto,idPersonal, estado, solicitud])
    return res.status(200).json({
      ok: true,
      message: "Proyecto registrado correctamente"
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}

const crearCampo = async (req, res) => {

    const { eventoId } = req.params;

    const {
        label,
        nombreInterno,
        tipo,
        required,
        placeholder,
        orden,
        opciones
    } = req.body;

    const conn = await pool.getConnection();

    try {

        await conn.beginTransaction();

        const [campo] = await conn.query(`
            INSERT INTO campo_formulario
            (
                evento_id,
                nombreInterno,
                label,
                tipo,
                required,
                placeholder,
                orden
            )
            VALUES (?,?,?,?,?,?,?)
        `,[
            eventoId,
            nombreInterno,
            label,
            tipo,
            required,
            placeholder,
            orden
        ]);

        const campoId = campo.insertId;

        if(
            ["select","radio","checkbox"].includes(tipo)
            && opciones?.length
        ){

            for(const opcion of opciones){

                await conn.query(`
                    INSERT INTO campo_opcion
                    (
                        campo_id,
                        texto,
                        valor,
                        orden
                    )
                    VALUES(?,?,?,?)
                `,[
                    campoId,
                    opcion.texto,
                    opcion.valor,
                    opcion.orden
                ]);

            }

        }

        await conn.commit();

        res.json({
            ok:true,
            campoId
        });

    } catch (error) {

        await conn.rollback();
        console.log('error', error);
        

        res.status(500).json(error);

    } finally {

        conn.release();

    }

}

const registrarParticipante = async (req, res) => {

    const {
        estado,
        codigoEvento,
        codigoRegistro,
        respuestas
    } = req.body;


    const connection = await pool.getConnection();


    try {

        await connection.beginTransaction();


        // Buscar evento
        const [evento] = await connection.query(
            `
            SELECT 
                id,
                tipo
            FROM evento
            WHERE codigo = ?
            `,
            [
                codigoEvento
            ]
        );


        if(evento.length === 0){

            await connection.rollback();

            return res.status(404).json({
                success:false,
                message:"Evento no encontrado"
            });

        }



        const eventoId = evento[0].id;

        const tipoRegistro = evento[0].tipo;



        /*
            1 = Público
            2 = Privado
        */


        let codigoId = null;



        // Validar código privado

        if(tipoRegistro === "2"){


            if(!codigoRegistro){

                await connection.rollback();

                return res.status(400).json({
                    success:false,
                    message:"Debe ingresar código de registro"
                });

            }



            const [codigo] = await connection.query(
                `
                SELECT id
                FROM codigo_registro
                WHERE evento_id = ?
                AND codigo = ?
                AND estado = 'DISPONIBLE'
                `,
                [
                    eventoId,
                    codigoRegistro
                ]
            );



            if(codigo.length === 0){


                await connection.rollback();


                return res.status(400).json({
                    success:false,
                    message:"Código inválido o ya utilizado"
                });


            }


            codigoId = codigo[0].id;


        }




        const codigoPer = generarCodigo(10);
        // Crear participante

        const [participante] = await connection.query(
            `
            INSERT INTO participante
            (
                evento_id,
                fechaRegistro,
                estado,
                codigo
            )
            VALUES
            (
                ?,
                NOW(),
                ?,
                ?
            )
            `,
            [
                eventoId,
                estado,
                codigoPer
            ]
        );



        const participanteId = participante.insertId;

         
        // Guardar respuestas

        if(respuestas && respuestas.length > 0){


            for(const respuesta of respuestas){


                await connection.query(
                    `
                    INSERT INTO respuesta_campo
                    (
                        participante_id,
                        campo_id,
                        valor
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        participanteId,
                        respuesta.campoId,
                        respuesta.valor
                    ]
                );


            }


        }




        // Marcar código como usado

        if(tipoRegistro === "2"){


            await connection.query(
                `
                UPDATE codigo_registro
                SET
                    estado='USADO',
                    participante_id=?
                WHERE id=?
                `,
                [
                    participanteId,
                    codigoId
                ]
            );


        }





        await connection.commit();


        const contenidoQR = `http://localhost:3000/verificar?codigo=${codigoPer}`;

        const qr = await QRCode.toDataURL(contenidoQR);

        return res.status(201).json({

            success:true,

            message:"Registro exitoso",

            participanteId,

            qr

        });



    } catch(error){


        await connection.rollback();


        console.error(error);



        return res.status(500).json({

            success:false,

            message:"Error al registrar participante"

        });



    } finally{


        connection.release();


    }

};

const generarCodigosEvento = async (req, res) => {

    try {
      const {evento_id} = req.params;
        const {
            cantidad
        } = req.body;


        if (!evento_id || !cantidad) {

            return res.status(400).json({
                message:"Evento y cantidad son obligatorios"
            });

        }


        const codigos = [];


        for(let i = 0; i < cantidad; i++){

            let codigo;

            let existe = true;


            // Evitar códigos repetidos

            while(existe){

                codigo = generarCodigo(10);


                const [resultado] = await pool.query(
                    `
                    SELECT id 
                    FROM codigo_registro
                    WHERE codigo = ?
                    `,
                    [codigo]
                );


                existe = resultado.length > 0;

            }


            codigos.push(codigo);


        }



        // Insertar todos los códigos

        const valores = codigos.map(codigo => [

            evento_id,
            codigo,
            "DISPONIBLE",
            null

        ]);



        await pool.query(

            `
            INSERT INTO codigo_registro
            (
                evento_id,
                codigo,
                estado,
                participante_id
            )
            VALUES ?
            `,

            [valores]

        );


        return res.status(201).json({

            message:"Códigos generados correctamente",

            cantidad:codigos.length,

            codigos,

        });



    } catch(error){

        console.log(error);


        return res.status(500).json({

            message:"Error generando códigos",

            error:error.message

        });

    }

};

module.exports={
  PostVenta,postPrenda,postRol,postPersonal,postTaller, postProduccion,PostInformePrenda,PostColor,
  PostMaterial, PostCliente, PostObservacion,PostAsistencia,PostNotificacines,postCanvas,postRegistro,postModulos,
  postMovimientos, postPagosPrestamo,PostActividad,PostEvidencia,PostTarea, PostProyecto, PostProyectoPersonal,
  PostEvento,crearCampo, registrarParticipante, generarCodigosEvento
}