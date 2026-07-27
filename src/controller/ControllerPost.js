const multer = require("multer");
const {pool} = require("../database.js");
const jwt = require('jsonwebtoken');
const csv = require("csv-parser");
const xlsx = require("xlsx");
const path = require('path');
const fs = require("fs");
const moment = require('moment');
const QRCode = require("qrcode");

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
        console.log("evento", evento);


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
  PostEvento,crearCampo, registrarParticipante, generarCodigosEvento
}