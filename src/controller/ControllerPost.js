const multer = require("multer");
const { pool } = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const { default: axios } = require("axios");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

//--------------------------------------------------------
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

const PostEvento = async (req, res) => {
    const { nombre, descripcion, fechaEvento, tipo, cupos } = req.body;

    const codigo = generarCodigo(10);

    const query = `
    INSERT INTO evento (nombre, descripcion, fechaEvento, tipo, cupos, codigo)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    try {
        await pool.query(query, [
            nombre,
            descripcion,
            fechaEvento,
            tipo,
            cupos,
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

const PostEmpresa = async (req, res) => {
    const { evento_id } = req.params;
    const { nombre, cupos } = req.body;
    const codigo = uuidv4().replace(/-/g, "").slice(0, 10);

    const query = `
    INSERT INTO empresa (codigo, nombre, cupos, evento_id)
    VALUES (?, ?, ?, ?)
  `;

    try {
        await pool.query(query, [
            codigo,
            nombre,
            cupos,
            evento_id
        ]);

        return res.status(200).json({
            ok: true,
            message: "empresa registrado correctamente"
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

const crearCampo = async (req, res) => {

    const { eventoId } = req.params;

    const {
        label,
        nombreInterno,
        tipo,
        required,
        placeholder,
        orden,
        opciones,
        tipoFormulario
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
                orden,
                tipoFormulario
            )
            VALUES (?,?,?,?,?,?,?,?)
        `, [
            eventoId,
            nombreInterno,
            label,
            tipo,
            required,
            placeholder,
            orden,
            tipoFormulario
        ]);

        const campoId = campo.insertId;

        if (
            ["select", "radio", "checkbox"].includes(tipo)
            && opciones?.length
        ) {

            for (const opcion of opciones) {

                await conn.query(`
                    INSERT INTO campo_opcion
                    (
                        campo_id,
                        texto,
                        valor,
                        orden
                    )
                    VALUES(?,?,?,?)
                `, [
                    campoId,
                    opcion.texto,
                    opcion.valor,
                    opcion.orden
                ]);

            }

        }

        await conn.commit();

        res.json({
            ok: true,
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
        tipo,
        dni,
        nombres,
        apellidos,
        correo,
        estado,
        codigoEmpresa,
        codigoEvento,
        codigoRegistro,
        respuestas
    } = req.body;


    const connection = await pool.getConnection();


    try {

        const normalizar = (texto) =>
            texto
                ?.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .replace(/\s+/g, " ")
                .toUpperCase();

        await connection.beginTransaction();
        if (Number(tipo) === 1) {
            try {
                const { data } = await axios.get(
                    `https://api.perudevs.com/api/v1/dni/complete?document=${dni}&key=${process.env.PERUDEV}`
                );

                if (!data.resultado) {
                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message: "No se pudo validar el DNI."
                    });
                }
                const nombresApi = data.resultado.nombres;

                const apellidosApi =
                    `${data.resultado.apellido_paterno} ${data.resultado.apellido_materno}`;
                if (
                    normalizar(nombresApi) !== normalizar(nombres) ||
                    normalizar(apellidosApi) !== normalizar(apellidos)
                ) {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message: "Los nombres o apellidos no coinciden con el DNI.",
                        datosReniec: {
                            nombres: data.resultado.nombres,
                            apellidos: `${data.resultado.apellido_paterno} ${data.resultado.apellido_materno}`
                        }
                    });

                }
            } catch (error) {
                await connection.rollback();

                return res.status(500).json({
                    success: false,
                    message: "Error al consultar el servicio de validación de DNI."
                });
            }
        }


        // Buscar evento
        const [evento] = await connection.query(
            `
            SELECT 
                *,
                DATE_FORMAT(fechaEvento, '%d-%m-%Y') AS FechaEvento
            FROM evento
            WHERE codigo = ?
            `,
            [
                codigoEvento
            ]
        );


        if (evento.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Evento no encontrado"
            });

        }

        const eventoId = evento[0].id;
        const tipoRegistro = evento[0].tipo;
        const cupos = evento[0].cupos;
        const Titulo = evento[0].nombre;
        const Descripcion = evento[0].descripcion;
        const fechaEvento = evento[0].FechaEvento;

        let empresa = null;

        if (codigoEmpresa) {
            const [result] = await connection.query(
                `SELECT * FROM empresa WHERE codigo = ?`, [codigoEmpresa]
            )

            if (result.length === 0) {

                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Empresa no encontrada"
                });

            }

            empresa = result[0];


            if (empresa.cupos === 0) {

                await connection.rollback();

                return res.status(404).json({
                    success: false,
                    message: "Link sin cupos"
                });

            }
        }
        /*
            1 = Público
            2 = Privado
        */


        let codigoId = null;

        // Validar código privado

        if (tipoRegistro === "2" && !codigoEmpresa) {


            if (!codigoRegistro) {

                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Debe ingresar código de registro"
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



            if (codigo.length === 0) {


                await connection.rollback();


                return res.status(400).json({
                    success: false,
                    message: "Código inválido o ya utilizado"
                });


            }


            codigoId = codigo[0].id;


        }

        const [participanteExistente] = await connection.query(
            `
            SELECT id
            FROM participante
            WHERE evento_id = ?
            AND dni = ?
            LIMIT 1
            `,
            [eventoId, dni]
        );

        if (participanteExistente.length > 0) {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "El participante ya se encuentra registrado en este evento."
            });

        }

        if (tipoRegistro === "1" && cupos <= 0) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "El evento ya no tiene cupos."
            });
        }

        if (tipoRegistro === "1" && cupos > 0 && !codigoEmpresa) {


            const [updateEvento] = await connection.query(
                `
                UPDATE evento
                SET cupos = cupos -1
                WHERE codigo=?
                AND cupos>0
            `,
                [codigoEvento]
            );

            if (updateEvento.affectedRows === 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "El evento ya no tiene cupos."
                });
            }



        }

        const codigoPer = uuidv4().replace(/-/g, "").slice(0, 10);
        // Crear participante

        const [participante] = await connection.query(
            `
            INSERT INTO participante
            (
                evento_id,
                fechaRegistro,
                estado,
                codigo,
                dni,
                nombres,
                apellidos
            )
            VALUES
            (
                ?,
                NOW(),
                ?,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                eventoId,
                estado,
                codigoPer,
                dni,
                nombres,
                apellidos
            ]
        );

        const participanteId = participante.insertId;

        if (codigoEmpresa) {

            const idEmpresa = empresa.id

            await connection.query(`
                INSERT INTO empresa_participante(idParticipante,idEmpresa)
                VALUES (?,?)
                `, [participanteId, idEmpresa])

            const [updateEmpresa] = await connection.query(
                `
            UPDATE empresa
            SET cupos = cupos - 1
            WHERE codigo = ?
            AND cupos > 0
            `,
                [codigoEmpresa]
            );

            if (updateEmpresa.affectedRows === 0) {
                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "La empresa ya no tiene cupos."
                });
            }

        }


        // Guardar respuestas

        if (respuestas && respuestas.length > 0) {


            for (const respuesta of respuestas) {


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

        if (tipoRegistro === "2" && !codigoEmpresa) {


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

        const qr = await QRCode.toDataURL(codigoPer);

        if (tipoRegistro !== "2") {

            const qrBase64 = qr.replace(/^data:image\/png;base64,/, "");

            await resend.emails.send({

                from: "ADB <noreply@massalud.org.pe>",
                to: correo,
                subject: `Confirmación de inscripción - ${Titulo}`,

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
                        <h2>${Titulo}</h2>

                        <p>
                            <strong>Descripción:</strong><br>
                            ${Descripcion}
                        </p>

                        <p>
                            <strong>Fecha del evento:</strong><br>
                            ${fechaEvento}
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
        }


        return res.status(201).json({

            success: true,

            message: "Registro exitoso",

            participanteId,

            qr

        });



    } catch (error) {


        await connection.rollback();


        console.error(error);



        return res.status(500).json({

            success: false,

            message: "Error al registrar participante"

        });



    } finally {


        connection.release();


    }

};



const generarCodigosEvento = async (req, res) => {

    try {
        const { evento_id } = req.params;
        const {
            cantidad
        } = req.body;


        if (!evento_id || !cantidad) {

            return res.status(400).json({
                message: "Evento y cantidad son obligatorios"
            });

        }


        const codigos = [];


        for (let i = 0; i < cantidad; i++) {

            let codigo;

            let existe = true;


            // Evitar códigos repetidos

            while (existe) {

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

            message: "Códigos generados correctamente",

            cantidad: codigos.length,

            codigos,

        });



    } catch (error) {

        console.log(error);


        return res.status(500).json({

            message: "Error generando códigos",

            error: error.message

        });

    }

};

module.exports = {
    PostEvento, crearCampo, registrarParticipante, generarCodigosEvento, PostEmpresa
}