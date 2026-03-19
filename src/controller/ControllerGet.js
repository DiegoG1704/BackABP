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

    const [Rutas] = await pool.query(queryRutasUser, [idRol]);

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

module.exports={
    getColor,getTalla,getPrenda,getModelo,getPrendaId,getMaterial,getRutas,getRol,getPersonal,
    getTaller,getDetallesProduccion,getPrendasProduccion,getDetallePrenda,getInformePrenda,getMe,
    getInforPrenda,getDetallesInforme,getPrendaModelo,getClientes,getPedidos,getPedidosId,getPrendaSobreventa,
    getAsistencia,getAsistenciaId, getAsistenciaDash
}