const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');
const { queryMe, queryRutasUser } = require("../querys/queryGet.js");

//--------------------------------------------------------------------

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

module.exports={
    getConfiguraciones,getEventos,getEventosCode,getCamposCode,getParticipantes,getEventoCodigo,
    getCamposPVCode,verificarParticipante, getMe
}