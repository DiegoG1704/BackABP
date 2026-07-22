const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment'); 
const { queryPrenda, queryPrendaId, queryTallas, queryModelo, queryTalla, queryColor, queryMaterial,
queryRutas, queryRol, queryPersonal, queryTaller, queryProduccion, queryDetalleProduccion, queryDetallePrenda,
queryInformesPrendas, queryMe, queryRutasUser, 
queryInformPren,
queryclientes} = require("../querys/queryGet.js");


const getTalla =async(req,res) =>{
    try {
        const [results] = await pool.query(queryTalla);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener los tallas:', err);
        res.status(500).json({ message: 'Error al obtener los tallas' });
    }
}

const getColor =async(req,res)=>{
    try {
        const[result]=await pool.query(queryColor);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los colores:', err);
        res.status(500).json({ message: 'Error al obtener los colores' });
    }
}

const getMaterial =async(req,res)=>{
    try {
        const[result]=await pool.query(queryMaterial);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los materiales:', err);
        res.status(500).json({ message: 'Error al obtener los materiales' });
    }
}

const getRutas =async(req,res)=>{
    try {
        const[result]=await pool.query(queryRutas);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los materiales:', err);
        res.status(500).json({ message: 'Error al obtener los materiales' });
    }
}

const getClientes =async(req,res)=>{
    try {
        const[result]=await pool.query(queryclientes);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los materiales:', err);
        res.status(500).json({ message: 'Error al obtener los materiales' });
    }
}

const getPersonal =async(req,res)=>{
    try {
        const[result]=await pool.query(queryPersonal);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los materiales:', err);
        res.status(500).json({ message: 'Error al obtener los materiales' });
    }
}

const getTaller =async(req,res)=>{
    try {
        const[result]=await pool.query(queryTaller);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los materiales:', err);
        res.status(500).json({ message: 'Error al obtener los materiales' });
    }
}

const getModelo = async(req,res)=>{
    try {
        const [result]=await pool.query(queryModelo)
        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener los modelo:', err);
        res.status(500).json({ message: 'Error al obtener los modelo' });
    }
}

const getDetallesProduccion = async (req, res) => {
  try {
    const [rows] = await pool.query(queryProduccion);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener detalles de producción:', error);
    res.status(500).json({ error: 'Error al obtener detalles de producción' });
  }
};

const getMe = async (req, res) => {
  const { id } = req.params;

  try {
    const [DatosUsuarios] = await pool.query(queryMe, [id]);

    if (DatosUsuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const idRol = DatosUsuarios[0].idRol;
    const idUsuario = DatosUsuarios[0].idUser;

    const [Rutas] = await pool.query(queryRutasUser, [idRol,idUsuario]);

    res.status(200).json({
      datosUsuario: DatosUsuarios[0],
      rutas: Rutas
    });
  } catch (error) {
    console.error('Error al obtener detalles de producción:', error);
    res.status(500).json({ error: 'Error al obtener detalles de producción' });
  }
};

const getDetallePrenda = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(queryDetallePrenda,[id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener detalles de producción:', error);
    res.status(500).json({ error: 'Error al obtener detalles de producción' });
  }
};

const getInformePrenda = async (req, res) => {
  const {idProduccion,area} = req.params;
  try {
    const [rows] = await pool.query(queryInformesPrendas,[idProduccion,area]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener detalles de producción:', error);
    res.status(500).json({ error: 'Error al obtener detalles de producción' });
  }
};

const getPrendasProduccion = async (req, res) => {
  const { id } = req.params;
  try {
    // Ejecutamos la consulta y obtenemos los datos
    const [rows] = await pool.query(queryDetalleProduccion, [id]);

    // Agrupamos los resultados por nombreTaller
    const agrupadosPorTaller = rows.reduce((acc, prenda) => {
      // Si el taller ya existe en el acumulador, añadimos la prenda
      if (!acc[prenda.nombreTaller]) {
        acc[prenda.nombreTaller] = {
          nombreTaller: prenda.nombreTaller,
          idProduccion:prenda.idProduccion,
          prendas: []
        };
      }
      // Agregamos la prenda al taller correspondiente
      acc[prenda.nombreTaller].prendas.push({
        id: prenda.idPrenda,
        idDetalle: prenda.idDetalle,
        idDetallePrenda: prenda.id,
        idProduccion:prenda.idProduccion,
        nombrePrenda: prenda.nombrePrenda,
        talla: prenda.talla,
        cantidad:prenda.cantidad,
        cantidadExt:prenda.cantidadExt,
        cantidadTotal:prenda.cantidadTotal
      });
      return acc;
    }, {});

    // Convertimos el objeto en un array de talleres
    const resultado = Object.values(agrupadosPorTaller);

    // Enviamos la respuesta con el formato deseado
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Error al obtener detalles de producción:', error);
    res.status(500).json({ error: 'Error al obtener detalles de producción' });
  }
};

const getRol = async (req, res) => {
    try {
        const [rows] = await pool.query(queryRol);

        const rolesMap = new Map();

        for (const row of rows) {
            const { rolId, rolNombre, vistaId, vistaNombre } = row;

            if (!rolesMap.has(rolId)) {
                rolesMap.set(rolId, {
                    id: rolId,
                    nombre: rolNombre,
                    vistas: []
                });
            }

            rolesMap.get(rolId).vistas.push({
                id: vistaId,
                nombre: vistaNombre
            });
        }

        const roles = Array.from(rolesMap.values());

        res.status(200).json(roles);
    } catch (err) {
        console.error('Error al obtener los roles:', err);
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
};

const getPrenda = async (req, res) => {
    try {
        const [prendas] = await pool.query(queryPrenda);

        for (const prenda of prendas) {
            const [tallas] = await pool.query(queryTallas, [prenda.id]);
            prenda.tallas = tallas.map(t => ({
                id: t.id,
                nombre: t.talla,
                cantidad: t.cantidad
            }));
        }

        res.status(200).json(prendas);
    } catch (err) {
        console.error('Error al obtener las prendas:', err);
        res.status(500).json({ message: 'Error al obtener las prendas', err });
    }
};

const getPrendaModelo = async (req,res)=>{
  const{idModelo}=req.params;
  const query = 'SELECT * FROM prenda WHERE idModelo = ?'
  try {
    const [prendas]= await pool.query(query,[idModelo])
    res.status(200).json(prendas);
  } catch (err) {
      console.error('Error al obtener las prendas:', err);
      res.status(500).json({ message: 'Error al obtener las prendas', err });
  }
}


const getPrendaId = async (req, res) => {
  const { id } = req.params;
  try {
    const [prendas] = await pool.query(queryPrendaId, [id]);

    for (const prenda of prendas) {
      const [tallas] = await pool.query(queryTallas, [prenda.id]);
      prenda.tallas = tallas.map(t => ({
        id: t.id,
        nombre: t.talla,
        cantidad: t.cantidad
      }));
    }

    res.status(200).json(prendas);
  } catch (err) {
    console.error('Error al obtener las prendas:', err);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
};

const getInforPrenda = async (req, res)=>{
  const {idDetallePrenda}= req.params
  try {
    const [result]= await pool.query(queryInformPren,[idDetallePrenda])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', err);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getPedidos = async (req, res)=>{
  const query = `
  SELECT 
    v.id,
    v.estado,
    DATE_FORMAT(v.fecha,'%d-%m-%Y') AS fecha,
    v.tipoVenta,
    c.nombre
  FROM 
    venta v
  LEFT JOIN
    venta_cliente vc ON vc.idVenta = v.id
  LEFT JOIN
    cliente c ON c.id = vc.idCliente
  WHERE 
    v.tipoVenta IN (1,3)
  ORDER BY 
      v.fecha DESC
  `
  try {
    const [result]= await pool.query(query)
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getPedidosId = async (req, res) => {
  const { id } = req.params;

  const queryVenta = `
    SELECT 
      v.id,
      v.idUsuario,
      v.tipoPago,
      v.total,
      v.estado,
      v.direccion AS direccionVenta,
      v.telefono AS telefonoVenta,
      v.tipoVenta,
      DATE_FORMAT(v.fecha,'%d-%m-%Y') AS fecha,
      c.documento,
      c.nombre,
      c.direccion AS direccionCliente,
      c.telefono AS telefonoCliente
    FROM venta v
    LEFT JOIN venta_cliente vc ON vc.idVenta = v.id
    LEFT JOIN cliente c ON c.id = vc.idCliente
    WHERE v.id = ?
  `;

  const queryPrendas = `
    SELECT 
      dv.id,
      dv.idPrenda,
      p.nombre,
      t.nombre AS talla,
      dv.cantidad
    FROM detalle_venta dv
    LEFT JOIN prenda p ON p.id = dv.idPrenda
    LEFT JOIN talla t ON t.id = dv.idTalla
    WHERE dv.idVenta = ?
  `;

  try {
    const [venta] = await pool.query(queryVenta, [id]);
    const [prendas] = await pool.query(queryPrendas, [id]);

    if (venta.length === 0) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.status(200).json({
      ...venta[0],
      prendas
    });

  } catch (error) {
    console.error("Error al obtener el pedido:", error);
    res.status(500).json({ message: "Error al obtener el pedido" });
  }
};

const getDetallesInforme = async (req,res)=>{
  const{id}=req.params
  const query = `
    SELECT 
      area,
      cantidad,
      cantMerma,
      estadoInforme,
      DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha 
    FROM 
      informe 
    WHERE 
      idDetallePrenda =?`
  try {
    const [result] = await pool.query(query,[id])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', err);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getPrendaSobreventa = async (req,res)=>{
  const query = `
  SELECT
    p.id AS idProduccion,
    dp.id AS idDetalle,
    d.talla AS idTalla,
    pd.id AS idPrenda,
    CONCAT(pd.nombre, ' - ', t.nombre) AS nombreCompleto,
    pd.nombre,
    t.nombre AS talla,
    dp.cantidad,
    m.precioU,
    m.precioM
  FROM
    produccion p
  LEFT JOIN
    detalle_produccion dp ON dp.idProduccion = p.id
  LEFT JOIN
    prenda pd ON pd.id = dp.idPrenda
  LEFT JOIN
    detalle_prenda d ON d.idDetalle = dp.id
  LEFT JOIN
    talla t ON d.talla = t.id
  LEFT JOIN
    modelo m ON m.id = pd.idModelo
  WHERE
    p.estado = 5
  `
  try {
    const [result] = await pool.query(query)
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getAsistencia =async(req,res) =>{
  const query = `
  SELECT
    DATE_FORMAT(a.fecha,'%d-%m-%Y') AS fecha,
    a.horaIngreso,
    a.horaSalida,
    a.Estado,
    d.nombres,
    r.nombre AS rol
  FROM
    asistencia a
  LEFT JOIN usuario u ON u.id = a.personaId
  LEFT JOIN datos d ON d.id = u.idDatos
  LEFT JOIN rol r ON r.id = d.idRol
  `
    try {
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener asistencia:', err);
        res.status(500).json({ message: 'Error al obtener los tallas' });
    }
}

const getAsistenciaId =async(req,res) =>{
  const {personaId} = req.params
  const query = ` SELECT
    DATE_FORMAT(a.fecha,'%d-%m-%Y') AS fecha,
    a.horaIngreso,
    a.horaSalida,
    a.Estado,
    d.nombres,
    r.nombre AS rol
  FROM
    asistencia a
  LEFT JOIN usuario u ON u.id = a.personaId
  LEFT JOIN datos d ON d.id = u.idDatos
  LEFT JOIN rol r ON r.id = d.idRol
  WHERE a.personaId = ?`
    try {
        const [results] = await pool.query(query,[personaId]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener asistencia:', err);
        res.status(500).json({ message: 'Error al obtener los tallas' });
    }
}

const getAsistenciaDash = async (req, res) => {
  const { personaId } = req.params;

  const query = `
    SELECT
      SUM(CASE WHEN a.estado = 1 THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN a.estado = 2 THEN 1 ELSE 0 END) AS tardanzas,
      SUM(CASE WHEN a.estado = 3 THEN 1 ELSE 0 END) AS faltas,
      SUM(CASE WHEN a.estado = 4 THEN 1 ELSE 0 END) AS permisos
    FROM asistencia a
    WHERE a.personaId = ?
  `;

  try {
    const [results] = await pool.query(query, [personaId]);
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Error al obtener asistencia:', err);
    res.status(500).json({ message: 'Error al obtener asistencia' });
  }
};

const getConfiguraciones = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'userId es requerido' });
  }

  const query = `
    SELECT 
      rc.id,
      c.descripcion AS configuracion,
      rc.estado
    FROM 
      rol_config rc
    LEFT JOIN
      configuraciones c ON c.id = rc.configId
    WHERE
      rc.userId = ?
  `;

  try {
    const [result] = await pool.query(query, [userId]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'No se encontraron configuraciones' });
    }

    res.status(200).json(result);

  } catch (err) {
    console.error('Error al obtener configuraciones:', err.message);
    res.status(500).json({ message: 'Error al obtener las configuraciones' });
  }
};

const getNotificaciones = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'userId es requerido' });
  }

  const query = `
    SELECT 
      n.*, d.nombres
    FROM 
      notificaciones n
    LEFT JOIN
      datos d ON d.id = n.remitente
    WHERE
      userId = ?
  `;

  try {
    const [result] = await pool.query(query, [userId]);

    res.status(200).json(result);

  } catch (err) {
    console.error('Error al obtener configuraciones:', err.message);
    res.status(500).json({ message: 'Error al obtener las configuraciones' });
  }
};

const getCanvas = async (req, res)=>{
  try {
    const [result]= await pool.query('SELECT * FROM canvas')
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', err);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getCanvasID = async (req, res)=>{
  const { id } = req.params;
  try {
    const [result]= await pool.query('SELECT * FROM canvas WHERE id = ?',[id])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', err);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getAdministracion = async (req, res)=>{
  const { id } = req.params;
  try {
    const [result]= await pool.query(
      `
      SELECT 
        *,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha  
      FROM 
        administracion 
      WHERE 
        tipoAdmin = ?
      ORDER BY id DESC;
      `,[id])
      const [resultFrecu]= await pool.query(
      `
      SELECT 
        *,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha  
      FROM 
        administracion 
      WHERE 
        tipoAdmin = ? AND tipoPago = 1
      ORDER BY id DESC;
      `,[id])
    res.status(200).json({result,resultFrecu})
  } catch (error) {
    console.error('Error al obtener las prendas:', err);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const getGestion = async (req, res) => {
  const queryGraficas = `
    SELECT 
      *,DATE_FORMAT(fecha,'%d-%m-%Y') AS fecha 
    FROM 
      administracion 
    WHERE 
      DATE(fecha) = CURDATE()
    ORDER BY id DESC;
  `
  const queryFrecuentes = `
    SELECT
    COALESCE(
        SUM(
            CASE
                WHEN tipoAdmin = 1 THEN
                    cantidad * CASE
                        WHEN FrecuenciaPago = 1 THEN 4
                        WHEN FrecuenciaPago = 2 THEN 1
                        WHEN FrecuenciaPago = 3 THEN (1/12)
                        ELSE 1
                    END
                ELSE 0
            END
        ),
        0
    ) AS ingresosMensuales,

    COALESCE(
        SUM(
            CASE
                WHEN tipoAdmin = 2 THEN
                    cantidad * CASE
                        WHEN FrecuenciaPago = 1 THEN 4
                        WHEN FrecuenciaPago = 2 THEN 1
                        WHEN FrecuenciaPago = 3 THEN (1/12)
                        ELSE 1
                    END
                ELSE 0
            END
        ),
        0
    ) AS egresosMensuales

FROM administracion
WHERE userId = 6
  AND tipoPago = 1;
  `

  const queryGraficasMensuales = `
    SELECT 
      DATE_FORMAT(fecha, '%m-%Y') AS mes,
      SUM(CASE WHEN tipoAdmin = 1 THEN cantidad ELSE 0 END) AS ingresos,
      SUM(CASE WHEN tipoAdmin = 2 THEN cantidad ELSE 0 END) AS egresos
    FROM administracion
    WHERE tipoAdmin IN (1,2)
    GROUP BY YEAR(fecha), MONTH(fecha)
    ORDER BY YEAR(fecha), MONTH(fecha);
  `

  const query = `
    SELECT
      CASE
        WHEN tipoAdmin = 1 THEN 'Ingresos'
        WHEN tipoAdmin = 2 THEN 'Egresos'
        WHEN tipoAdmin = 3 THEN 'Prestamos'
      END AS tipo,
      SUM(cantidad) AS total
    FROM administracion
    GROUP BY tipoAdmin
  `;

  try {
    const [result] = await pool.query(query);
    const [resultGraf] = await pool.query(queryGraficas);
    const [resultMens] = await pool.query(queryGraficasMensuales);
    const [resultFrec] = await pool.query(queryFrecuentes);
    const mensualFrec = {
      ingresosMensuales: Number(resultFrec[0].ingresosMensuales),
      egresosMensuales: Number(resultFrec[0].egresosMensuales),
    };
    res.status(200).json({result,resultGraf,resultMens,mensualFrec});

  } catch (error) {
    console.error('Error al obtener la gestión:', error);
    res.status(500).json({
      message: 'Error al obtener la gestión'
    });
  }
};

const getPaquetes = async (req, res) => {
  const querypack = `
    SELECT 
      id,
      nombre,
      descripcion,
      precio,
      icono,
      color
    FROM paquetes
  `;

  const querymodul = `
    SELECT 
      v.id,
      v.nombre,
      v.icono,
      v.descripcion
    FROM paquete_vistas pv
    LEFT JOIN vistas v ON v.id = pv.vistas
    WHERE pv.paquetes = ?
  `;

  try {
    // Obtener paquetes
    const [paquetes] = await pool.query(querypack);

    // Obtener módulos de cada paquete
    const paquetesConModulos = await Promise.all(
      paquetes.map(async (paquete) => {
        const [modulos] = await pool.query(querymodul, [paquete.id]);

        return {
          ...paquete,
          modulos
        };
      })
    );

    res.status(200).json(paquetesConModulos);

  } catch (error) {
    console.error('Error al obtener los paquetes:', error);

    res.status(500).json({
      message: 'Error al obtener los paquetes'
    });
  }
};

const getDetalesPrestamo = async (req, res) => {
  const { id } = req.params;

  const queryDetallePres = `
    SELECT
      p.*,
      DATE_FORMAT(p.fechaRegistro,'%d-%m-%Y') AS fechaRegistro
    FROM prestamo p
    WHERE p.idAdministracion = ?
  `;

  const queryCliente = `
    SELECT * FROM cliente WHERE id = ?
  `

  const queryPagoCuotas =`
    SELECT *,DATE_FORMAT(fechaPago,'%d-%m-%Y') AS fechaPago  FROM prestamo_pago WHERE idPrestamo = ? 
  `

  const queryDetalleCuota = `
    SELECT
      pc.*,
      DATE_FORMAT(pc.fechaVencimiento,'%d-%m-%Y') AS fechaVencimiento,
      DATE_FORMAT(pc.fechaRegistro,'%d-%m-%Y') AS fechaRegistro
    FROM prestamo_cuota pc
    WHERE pc.idPrestamo = ?
    ORDER BY pc.numeroCuota
  `;

  try {
    const [prestamoRows] = await pool.query(queryDetallePres, [id]);

    if (prestamoRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Préstamo no encontrado"
      });
    }

    const prestamo = prestamoRows[0];
    const [cliente] = await pool.query(
      queryCliente,
      [prestamo.idCliente]
    );

    const [cuotas] = await pool.query(
      queryDetalleCuota,
      [prestamo.id]
    );

    const [pagosCuotas] = await pool.query(queryPagoCuotas,[prestamo.id])

    res.status(200).json({
      success: true,
      prestamo,
      cuotas,cliente,pagosCuotas
    });

  } catch (err) {
    console.error("Error al obtener el préstamo:", err);

    res.status(500).json({
      success: false,
      message: "Error al obtener el préstamo"
    });
  }
};

const procesarVencimientos = async (req,res) => {
  const {userId}=req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [movimientos] = await connection.query(
      `SELECT *
      FROM administracion
      WHERE userId = ?
        AND tipoPago = 1
        AND fechaVenc <= NOW()`,
      [userId]
    );

    for (const mov of movimientos) {
      const { id,descripcion, cantidad, tipoAdmin, FrecuenciaPago } = mov;

      const [usuario] = await connection.query(
      `SELECT *
       FROM usuario
       WHERE id = ?`,
      [userId]
    );

    const user = usuario[0];

      // Actualizar presupuesto
      if (tipoAdmin === 1) {
        await connection.query(
          `UPDATE datos
           SET presupuesto = presupuesto + ?
           WHERE id = ?`,
          [cantidad, user.idDatos]
        );
        
      } else if (tipoAdmin === 2 || tipoAdmin === 3) {
        await connection.query(
          `UPDATE datos
           SET presupuesto = presupuesto - ?
           WHERE id = ?`,
          [cantidad, user.idDatos]
        );
      }

      let nuevaFecha = new Date(mov.fechaVenc);

      while (nuevaFecha <= new Date()) {
        switch (Number(FrecuenciaPago)) {
          case 1:
            nuevaFecha.setDate(nuevaFecha.getDate() + 7);
            break;

          case 2:
            nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
            break;

          case 3:
            nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
            break;

          default:
            throw new Error(
              `FrecuenciaPago inválida: ${FrecuenciaPago}`
            );
        }
      }

      await connection.query(
        `UPDATE administracion
        SET fechaVenc = ?
        WHERE id = ?`,
        [nuevaFecha, id]
      );
      await connection.query(
        `INSERT INTO Administracion
        (cantidad, descripcion, tipoAdmin,userId)
        VALUES (?,?,?,?)`,
        [
          cantidad,
          descripcion,
          tipoAdmin,
          userId
        ]
      );

      console.log("Nueva fecha:", nuevaFecha);
    }

    await connection.commit();

    res.status(200).json({
      ok: true,
      mensaje: 'Vencimientos procesados'
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getActividades = async(req,res) =>{
  try {
    const [result] = await pool.query(
      `SELECT 
          a.id,
          a.titulo,
          a.descripcion,
          s.nombre AS area,
          a.prioridad,
          a.creadorAct,
          p.nombres AS personal,
          c.nombres AS creador,
          DATE_FORMAT(a.fechaCreacion, '%d-%m-%Y') AS fechaCreacion,
          TIME_FORMAT(a.horaAsignacion, '%H:%i:%s') AS horaAsignacion,
          a.estado
      FROM actividades a
      LEFT JOIN datos p ON p.id = a.personal
      LEFT JOIN datos c ON c.id = a.creadorAct
      LEFT JOIN areas s ON s.id = a.area
      ORDER BY YEAR(a.fechaCreacion), MONTH(a.fechaCreacion)`);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener Actividades"
    });
  }
}

const getEvidenciaDatos = async( req,res) =>{
  const {actividadId} = req.params;
  const query = 'SELECT * FROM evidencia WHERE actividadId = ?'
  const queryTareas = 'SELECT * FROM tareas WHERE idActividad = ?'
  try {
    const [lista] = await pool.query(query,[actividadId])
    const [tareas] = await pool.query(queryTareas,[actividadId])
    res.status(200).json({lista,tareas});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener Actividades"
    });
  }
}

const getColumnas = async( req,res) =>{
  const query = 'SELECT * FROM columnas'
  try {
    const [result] = await pool.query(query)
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener columnas"
    });
  }
}

const getEventos = async( req,res) =>{
  const query = 'SELECT * FROM evento'
  try {
    const [result] = await pool.query(query)
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener eventos"
    });
  }
}

const getCamposCode = async (req, res) => {
    const { evento_id } = req.params;

    const query = `
        SELECT
            cf.id,
            cf.evento_id,
            cf.nombreInterno,
            cf.label,
            cf.tipo,
            cf.required,
            cf.placeholder,
            cf.orden,

            co.id AS opcion_id,
            co.texto,
            co.valor,
            co.orden AS opcion_orden

        FROM campo_formulario cf
        INNER JOIN evento e
            ON e.id = cf.evento_id

        LEFT JOIN campo_opcion co
            ON co.campo_id = cf.id

        WHERE e.codigo = ?

        ORDER BY
            cf.orden,
            co.orden;
    `;

    try {
        const [rows] = await pool.query(query, [evento_id]);

        const campos = [];

        rows.forEach((row) => {

            let campo = campos.find(c => c.id === row.id);

            if (!campo) {
                campo = {
                    id: row.id,
                    evento_id: row.evento_id,
                    nombreInterno: row.nombreInterno,
                    label: row.label,
                    tipo: row.tipo,
                    required: row.required,
                    placeholder: row.placeholder,
                    orden: row.orden,
                    opciones: []
                };

                campos.push(campo);
            }

            if (row.opcion_id) {
                campo.opciones.push({
                    id: row.opcion_id,
                    texto: row.texto,
                    valor: row.valor,
                    orden: row.opcion_orden
                });
            }

        });

        res.status(200).json(campos);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al obtener los campos del formulario"
        });
    }
};

const getCamposPVCode = async (req, res) => {
    const { evento_id } = req.params;

    const query = `
        SELECT
            cf.id,
            cf.evento_id,
            cf.nombreInterno,
            cf.label,
            cf.tipo,
            cf.required,
            cf.placeholder,
            cf.orden,

            co.id AS opcion_id,
            co.texto,
            co.valor,
            co.orden AS opcion_orden,

            cr.id AS codigo_id,
            cr.estado AS estadoRegistro

        FROM campo_formulario cf
        INNER JOIN evento e
            ON e.id = cf.evento_id

        LEFT JOIN campo_opcion co
            ON co.campo_id = cf.id

        LEFT JOIN codigo_registro cr
            ON cr.evento_id = e.id

        WHERE cr.codigo = ?

        ORDER BY
            cf.orden,
            co.orden;
    `;

    try {
        const [rows] = await pool.query(query, [evento_id]);

        const campos = [];

        rows.forEach((row) => {

            let campo = campos.find(c => c.id === row.id);

            if (!campo) {
                campo = {
                    id: row.id,
                    evento_id: row.evento_id,
                    nombreInterno: row.nombreInterno,
                    label: row.label,
                    tipo: row.tipo,
                    required: row.required,
                    placeholder: row.placeholder,
                    orden: row.orden,
                    opciones: []
                };

                campos.push(campo);
            }

            if (row.opcion_id) {
                campo.opciones.push({
                    id: row.opcion_id,
                    texto: row.texto,
                    valor: row.valor,
                    orden: row.opcion_orden
                });
            }

        });

        res.status(200).json(campos);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al obtener los campos del formulario"
        });
    }
};

const getEventosCode = async( req,res) =>{
  const {codigo} = req.params;
  const query = 'SELECT * FROM evento WHERE codigo = ?'
  try {
    const [result] = await pool.query(query,[codigo])
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener eventos"
    });
  }
}

const getProyectosCodigo = async( req,res) =>{
  const {codigo} = req.params;
  const query = `
    SELECT 
      p.*,
      d.nombres
    FROM 
      proyectos p
    LEFT JOIN datos d ON d.id = p.responsable 
    WHERE p.codigo = ?`

  

  const queryPersonal = `
    SELECT 
      d.id,
      d.nombres,
      r.nombre AS rol,
      pe.estado,
      pe.solicitud,
      pe.fecha
    FROM
      proyectos_empleados pe
    LEFT JOIN datos d ON d.id = pe.idPersonal
    LEFT JOIN proyectos t ON t.id = pe.idProyecto
    LEFT JOIN rol r ON r.id = d.idRol
    WHERE t.codigo = ?
    `
  try {
    const [result] = await pool.query(query,[codigo])
    const [personal] = await pool.query(queryPersonal,[codigo])
    res.status(200).json({result,personal});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener columnas"
    });
  }
}

const getProyectos = async( req,res) =>{
  const query = `
    SELECT 
      p.*,
      d.nombres
    FROM 
      proyectos p
    LEFT JOIN datos d ON d.id = p.responsable`
  try {
    const [result] = await pool.query(query)
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener proyectos"
    });
  }
}

const getEventoCodigo = async(req,res) =>{
  const {codigo} = req.params;
  // LEFT JOIN participante p ON p.evento_id = e.id
  try {
    const [result] = await pool.query(`
      SELECT 
        cr.* 
      FROM codigo_registro cr
      LEFT JOIN evento e ON e.id = cr.evento_id
      WHERE e.codigo = ?
      `,[codigo])
      res.status(200).json(result);
  } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Error al obtener Actividades"
      });
  }
}

const getActividadesProyect = async(req,res) =>{
  const {codigo} = req.params;
  try {
    const [result] = await pool.query(
      `SELECT 
          a.id,
          a.titulo,
          a.descripcion,
          s.nombre AS area,
          a.prioridad,
          a.creadorAct,
          p.nombres AS personal,
          c.nombres AS creador,
          DATE_FORMAT(a.fechaCreacion, '%d-%m-%Y') AS fechaCreacion,
          TIME_FORMAT(a.horaAsignacion, '%H:%i:%s') AS horaAsignacion,
          a.estado
      FROM proyect_activi pa
      LEFT JOIN proyectos y ON y.id = pa.idProyecto
      LEFT JOIN actividades a ON a.id = pa.idActividad
      LEFT JOIN datos p ON p.id = a.personal
      LEFT JOIN datos c ON c.id = a.creadorAct
      LEFT JOIN areas s ON s.id = a.area
      WHERE y.codigo = ?`,[codigo]);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: "Error al obtener Actividades"
    });
  }
}

const getParticipantes = async (req, res) => {

    const { codigo } = req.params;

    const query = `
        SELECT
            p.id AS participante_id,
            p.fechaRegistro,
            p.estado,
            p.codigo,
            cf.id AS campo_id,
            cf.label,
            cf.nombreInterno,
            cf.tipo,

            rc.valor

        FROM participante p

        INNER JOIN respuesta_campo rc
            ON rc.participante_id = p.id

        INNER JOIN campo_formulario cf
            ON cf.id = rc.campo_id

        LEFT JOIN evento e
            ON e.id = p.evento_id

        WHERE e.codigo = ?

        ORDER BY
            p.id,
            cf.orden;
    `;

    try {

        const [rows] = await pool.query(query, [codigo]);

        const participantes = [];

        rows.forEach(row => {

            let participante = participantes.find(
                p => p.id === row.participante_id
            );

            if (!participante) {

                participante = {
                    id: row.participante_id,
                    fechaRegistro: row.fechaRegistro,
                    codigo:row.codigo,
                    estado: row.estado,
                    respuestas: {}
                };

                participantes.push(participante);
            }

            participante.respuestas[row.nombreInterno] = {
                label: row.label,
                valor: row.valor,
                tipo: row.tipo
            };

        });

        res.json(participantes);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error al obtener participantes"
        });

    }

};

const verificarParticipante = async (req, res) => {

    const { codigo } = req.params;
    const estado = 'ACTIVO'

    const connection = await pool.getConnection();

    try {

        // Buscar participante
        const [participante] = await connection.query(
            `
            SELECT
                p.id,
                p.codigo,
                p.estado,
                p.fechaRegistro,
                e.nombre AS evento
            FROM participante p
            INNER JOIN evento e
                ON e.id = p.evento_id
            WHERE p.estado = ? AND p.codigo = ?
            `,
            [estado,codigo]
        );

        if (participante.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Código QR inválido"
            });

        }

        const participanteId = participante[0].id;

        // Obtener respuestas del formulario
        const [respuestas] = await connection.query(
            `
            SELECT
                cf.label,
                cf.nombreInterno,
                cf.tipo,
                rc.valor
            FROM respuesta_campo rc
            INNER JOIN campo_formulario cf
                ON cf.id = rc.campo_id
            WHERE rc.participante_id = ?
            ORDER BY cf.orden
            `,
            [participanteId]
        );

        return res.status(200).json({

            success: true,

            participante: participante[0],

            respuestas

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Error al verificar participante"

        });

    } finally {

        connection.release();

    }

};

module.exports={
    getColor,getTalla,getPrenda,getModelo,getPrendaId,getMaterial,getRutas,getRol,getPersonal,
    getTaller,getDetallesProduccion,getPrendasProduccion,getDetallePrenda,getInformePrenda,getMe,
    getInforPrenda,getDetallesInforme,getPrendaModelo,getClientes,getPedidos,getPedidosId,getPrendaSobreventa,
    getAsistencia,getAsistenciaId, getAsistenciaDash,getConfiguraciones,getNotificaciones,getCanvas,getCanvasID,
    getPaquetes,getAdministracion,getDetalesPrestamo,getGestion,procesarVencimientos,getActividades,getEvidenciaDatos,
    getColumnas,getProyectos,getProyectosCodigo, getActividadesProyect, getEventos, getEventosCode, getCamposCode,
    getParticipantes, getEventoCodigo, getCamposPVCode, verificarParticipante
}