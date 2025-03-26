const multer = require("multer");
const pool = require("../database.js");
const jwt = require('jsonwebtoken');

const crearUsuario = async (req, res) => {
    const {
      dni, ruc, nombre, apellido, direccion, distritoId, 
      nombreBodega, metodoAfiliacion, referencia, correo, 
      observaciones, telefono, estadoWhatsapp, estadoGrupo
    } = req.body;
  
    // Verificar campos obligatorios
    if (!dni || !ruc || !nombre || !apellido || !distritoId || !correo || !nombreBodega || !estadoWhatsapp || !estadoGrupo || !telefono) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
  
    // Verificar si el RUC ya está registrado
    const [existingRuc] = await pool.query('SELECT COUNT(*) AS count FROM Afiliados WHERE ruc = ?', [ruc]);
    if (existingRuc[0].count > 0) {
      return res.status(400).json({ error: 'El RUC ya está registrado.' });
    }
  
    const query = `
      INSERT INTO Afiliados (
        dni, ruc, nombre, apellido, direccion, distritoId, 
        nombreBodega, metodoAfiliacion, 
        estadoWhatsapp, estadoGrupo, referencia, correo, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const values = [
      dni, ruc, nombre, apellido, direccion, distritoId, 
      nombreBodega, metodoAfiliacion, estadoWhatsapp, estadoGrupo, 
      referencia, correo, observaciones
    ];
  
    // Iniciar la transacción
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
      // Insertar el usuario en Afiliados
      const [response] = await connection.query(query, values);
      const idUsuario = response.insertId;
  
      // Insertar el teléfono en la tabla telefono
      const [responseTelf] = await connection.query('INSERT INTO telefono(numero, afiliadoId) VALUES (?, ?)', [telefono, idUsuario]);
  
      // Si todo es exitoso, hacer commit
      await connection.commit();
      res.status(200).json({ message: 'Registro exitoso' });
  
    } catch (error) {
      // Si hay un error, hacer rollback
      await connection.rollback();
      console.error(error); // Opcional: para depuración
      res.status(500).json({ error: 'Hubo un error al registrar el usuario. Inténtelo más tarde.' });
    } finally {
      // Liberar la conexión
      connection.release();
    }
  };

  const getAfiliadosCount = async (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN estadoSocio IN (1, 2) THEN 1 ELSE 0 END) AS activos,
            SUM(CASE WHEN estadoSocio = 3 THEN 1 ELSE 0 END) AS suspendidos
        FROM Afiliados;
    `;
    
    try {
        const [results] = await pool.query(query);
        res.status(200).json({ activos: results[0].activos, suspendidos: results[0].suspendidos });
    } catch (err) {
        console.error('Error al obtener la cantidad de afiliados:', err);
        res.status(500).json({ message: 'Error al obtener la cantidad de afiliados' });
    }
};
  
const getUsuario = async (req, res) => {
    const query = `
        SELECT 
            a.id, 
            a.dni, 
            a.ruc, 
            a.nombre, 
            a.apellido, 
            a.direccion,
            a.distritoId,
            a.estadoGrupo,
            a.metodoAfiliacion,
            d.nombre AS distrito,  -- Nombre del distrito
            a.nombreBodega, 
            a.estadoSocio, 
            ma.nombre AS metodoAfiliacionName,  -- Nombre del método de afiliación
            a.estadoWhatsapp, 
            g.nombre AS estadoGrupoName,  -- Nombre del estado del grupo
            a.referencia, 
            a.correo, 
            a.observaciones, 
            a.fechaAfiliacion,
            -- Subconsulta para obtener los teléfonos
            (SELECT GROUP_CONCAT(t.numero ORDER BY t.id ASC) 
             FROM Telefono t 
             WHERE t.afiliadoId = a.id) AS telefonos
        FROM 
            Afiliados a
        JOIN 
            Distrito d 
        ON 
            a.distritoId = d.id
        LEFT JOIN 
            MetodoAfiliacion ma 
        ON 
            a.metodoAfiliacion = ma.id
        LEFT JOIN 
            Grupo g 
        ON 
            a.estadoGrupo = g.id;
    `;

    try {
        const [results] = await pool.query(query);

        // Mapea los estados (estadoSocio, estadoWhatsapp, estadoGrupo) a nombres legibles
        const EstadoSocioMap = {
            1: 'Nuevo',
            2: 'Renovo',
            3: 'Suspendido',
            // Agregar más estados si es necesario
        };

        const EstadoWhatsappMap = {
            1: 'Activo',
            2: 'Inactivo',
            // Agregar más estados si es necesario
        };

        const resultsWithStates = await Promise.all(
            results.map(async (afiliado) => {
                // Verificar si tiene más de un pago
                const [pagoResult] = await pool.query(
                    `SELECT COUNT(*) AS pagosCount FROM fechapago WHERE afiliadoId = ?`,
                    [afiliado.id]
                );
                const pagosCount = pagoResult[0].pagosCount;

                // Si tiene más de un pago y su estadoSocio no es 2 (Renovo), actualizar el estado
                if (pagosCount > 1 && afiliado.estadoSocio !== 2) {
                    // Actualizar el estadoSocio a 2 (Renovo)
                    await pool.query(
                        `UPDATE Afiliados SET estadoSocio = 2 WHERE id = ?`,
                        [afiliado.id]
                    );
                    afiliado.estadoSocio = 2; // Actualizar el estadoSocio en el objeto
                }

                // Formatear la fecha y convertir el teléfono de cadena a array
                return {
                    ...afiliado,
                    fechaAfiliacion: afiliado.fechaAfiliacion.toISOString().split('T')[0], // Formatear fecha a 'YYYY-MM-DD'
                    telefonos: afiliado.telefonos ? afiliado.telefonos.split(',') : [],
                    estadoSocio: EstadoSocioMap[afiliado.estadoSocio] || 'Estado desconocido',
                    estadoWhatsapp: EstadoWhatsappMap[afiliado.estadoWhatsapp] || 'Estado desconocido',
                };
            })
        );

        res.status(200).json(resultsWithStates);
    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

const EditCampo = async (req, res) => {
    const { id } = req.params;
    const { campo, valor } = req.body; // Obtenemos el campo y valor desde el cuerpo de la solicitud

    // Construimos la consulta de actualización dinámica
    const query = `UPDATE afiliados SET ${campo} = ? WHERE id = ?`;

    try {
        // Ejecutamos la consulta SQL
        const response = await pool.query(query, [valor, id]);

        res.status(200).json({ message: 'Éxito al actualizar el campo' });
    } catch (error) {
        console.error('Error al editar el usuario:', error);
        res.status(500).json({ message: 'Error al editar el usuario' });
    }
};

const getGrupo =async(req,res) =>{
    const query ='SELECT * FROM grupo'
    try {
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener los grupos:', err);
        res.status(500).json({ message: 'Error al obtener los grupos' });
    }
}

const getMetodo = async(req,res) =>{
    const query ='SELECT * FROM metodoafiliacion'
    try {
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener los grupos:', err);
        res.status(500).json({ message: 'Error al obtener los metodoafiliacion' });
    }
}

const getFechPago = async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM fechapago WHERE afiliadoId = ?';

    try {
        const [result] = await pool.query(query, [id]);

        // Verificar si no hay resultados
        if (result.length === 0) {
            return res.status(404).json({ message: 'Fecha de pago no encontrada' });
        }

        // Formatear la fecha en 'DD-MM-YYYY' y calcular el último año
        const formattedResult = result.map(item => {
            const fecha = new Date(item.fecha);  // Fecha en formato Date
            const day = String(fecha.getDate()).padStart(2, '0');
            const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son base 0
            const year = fecha.getFullYear();

            return {
                ...item,
                fecha: `${day}-${month}-${year}` // Formatear la fecha
            };
        });

        // Calcular el último año (fecha más reciente)
        const mostRecentDate = formattedResult.reduce((latest, current) => {
            const latestDate = new Date(latest.fecha.split('-').reverse().join('-'));
            const currentDate = new Date(current.fecha.split('-').reverse().join('-'));
            return currentDate > latestDate ? current : latest;
        });

        // Responder con los datos formateados
        return res.status(200).json({
            pagos: formattedResult,  // Lista de pagos con fechas formateadas
            ultimoAño: mostRecentDate.fecha // Última fecha de pago
        });

    } catch (error) {
        console.error('Error al obtener la fecha de pago:', error);
        res.status(500).json({ message: 'Error al obtener la fecha de pago' });
        res.status(404).json({ message: 'Error al obtener la fecha de pago' });
    }
};

const getUsuariosId = async (req, res) => {
    const query = 'SELECT * FROM Distrito';

    try {
        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Error al obtener los usuarios:', err);
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

const PostPago = async (req, res) => {
    const { id } = req.params;
    const query = 'INSERT INTO fechapago (afiliadoId) VALUES (?)';  // NOW() para insertar la fecha actual
    try {
        // Ejecutamos la consulta con el id recibido
        const [result] = await pool.query(query, [id]);  // El id se pasa como un array
        res.status(200).json({ message: 'Éxito al registrar el pago' });
    } catch (error) {
        console.error('Error al registrar el pago:', error);
        res.status(500).json({ message: 'Error al registrar el pago' });
    }
};

const editPersonal = async (req, res) => {
    const { id } = req.params;
    const { dni, ruc, nombre, apellido } = req.body;
    
    // La consulta SQL corregida
    const query = 'UPDATE afiliados SET dni = ?, ruc = ?, nombre = ?, apellido = ? WHERE id = ?';

    try {
        // Ejecutando la consulta
        const result = await pool.query(query, [dni, ruc, nombre, apellido, id]);
        res.status(200).json({ message: 'Éxito' });
    } catch (error) {
        // Manejando el error correctamente
        console.error('Error al actualizar los datos:', error);
        res.status(500).json({ message: 'Error al actualizar los datos' });
    }
};

const Reiniciar = async (req, res) => {
    const { id } = req.params;  // Obtenemos el ID del socio desde los parámetros de la URL
    const estadoSocio = 1;  // Establecemos el estado del socio a "activo" (1)
    
    // La consulta SQL para actualizar el estado del socio
    const query = 'UPDATE afiliados SET estadoSocio = ? WHERE id = ?';

    try {
        // Ejecutamos la consulta con los parámetros proporcionados
        const result = await pool.query(query, [estadoSocio, id]);

        // Verificamos si se actualizó algún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Socio no encontrado' });  // Si no se encontró el socio con ese ID
        }

        // Si la actualización es exitosa, respondemos con un mensaje de éxito
        res.status(200).json({ message: 'Estado del socio actualizado exitosamente' });
    } catch (error) {
        // En caso de error, se maneja de forma adecuada
        console.error('Error al actualizar los datos:', error);
        res.status(500).json({ message: 'Error al actualizar los datos' });
    }
};

const Suspender = async (req, res) => {
    const { id } = req.params;  // Obtenemos el ID del socio desde los parámetros de la URL
    const estadoSocio = 3;  // Establecemos el estado del socio a "activo" (1)
    
    // La consulta SQL para actualizar el estado del socio
    const query = 'UPDATE afiliados SET estadoSocio = ? WHERE id = ?';

    try {
        // Ejecutamos la consulta con los parámetros proporcionados
        const result = await pool.query(query, [estadoSocio, id]);

        // Verificamos si se actualizó algún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Socio no encontrado' });  // Si no se encontró el socio con ese ID
        }

        // Si la actualización es exitosa, respondemos con un mensaje de éxito
        res.status(200).json({ message: 'Estado del socio actualizado exitosamente' });
    } catch (error) {
        // En caso de error, se maneja de forma adecuada
        console.error('Error al actualizar los datos:', error);
        res.status(500).json({ message: 'Error al actualizar los datos' });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);  // Guardar la imagen con nombre único
    }
});

const upload = multer({ storage: storage });

const FotoPerfil = async (req, res) => {
    try {
        const Id = req.params.id;
        const imagePath = req.file.filename;  // Obtener el nombre del archivo guardado

        // Actualizar la ruta de la imagen en la base de datos
        const query = 'UPDATE Usuarios SET fotoPerfil = ? WHERE Id = ?';
        const [result] = await pool.query(query, [imagePath, Id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(201).json({ fotoPerfil: imagePath, message: 'Éxito' });
    } catch (err) {
        console.error("Error actualizando la imagen de perfil:", err);
        res.status(500).send("Error al actualizar la imagen de perfil");
    }
};

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '5h' });
}

// const loginUsuario = async (req, res) => {
//     const { usuario, contraseña } = req.body;

//     if (!usuario || !contraseña) {
//         return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
//     }

//     const query = 'SELECT * FROM Usuario WHERE usuario = ?';

//     try {
//         // Buscar el usuario por nombre de usuario
//         const [rows] = await pool.query(query, [usuario]);

//         if (rows.length === 0) {
//             return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
//         }

//         const usuarioDb = rows[0];  // Cambié el nombre para evitar conflicto

//         // Comparar la contraseña proporcionada con la almacenada (sin encriptación)
//         if (contraseña !== usuarioDb.contraseña) {
//             return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
//         }

//         // Crear el payload del token con información relevante del usuario
//         const tokenPayload = {
//             id: usuarioDb.id,
//             nombre: usuarioDb.nombre,
//             apellido: usuarioDb.apellido,
//         };

//         // Generar Access Token y Refresh Token
//         const accessToken = generateAccessToken(tokenPayload);
//         const refreshToken = generateRefreshToken(tokenPayload);

//         // Configuración para el refreshToken (5 horas)
//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 5 * 60 * 60 * 1000,  // 5 horas
//             sameSite: 'None',
//         });

//         // Configuración para el accessToken (1 hora)
//         res.cookie('accessToken', accessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             maxAge: 1 * 60 * 60 * 1000,  // 1 hora
//             sameSite: 'None',
//         });

//         // Responder con éxito, incluyendo los datos del usuario y el access token generado
//         return res.status(200).json({
//             success: true,
//             message: 'Bienvenido',
//             token: accessToken,  // Enviar el accessToken en la respuesta
//         });

//     } catch (error) {
//         console.error('Error del servidor:', error);
//         res.status(500).json({ message: 'Error del servidor' });
//     }
// };

const loginUsuario = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    if (username !== 'username' || password !== 'username') {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

    try {
        // Crear un objeto de payload para el token (puede incluir información adicional)
        const payload = { username };

        // Crear el token con una clave secreta (idealmente debería ser una clave más segura)
        const token = jwt.sign(payload, 'Diego123', { expiresIn: '1h' }); // El token expira en 1 hora

        // Responder con el token
        return res.status(200).json({
          access_token: token,  // Devolver el token generado
        });

    } catch (error) {
        console.error('Error del servidor:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};
// const verificarToken = async (req, res, next) => {
//     const { accessToken } = req.cookies;  // Obtenemos el accessToken desde las cookies

//     if (!accessToken) {
//         // Si no hay accessToken, intentamos renovar el token
//         const tokenRenovado = await refreshToken(req, res);  // Llamamos a refreshToken asincrónicamente

//         if (!tokenRenovado) {
//             return res.status(401).json({ message: 'No autorizado, no se pudo renovar el token' });
//         }

//         // Si el token se renovó correctamente, procedemos al siguiente middleware
//         return next();  // Añadimos "return" para evitar que se ejecute código posterior
//     } else {
//         // Si hay un accessToken, verificamos su validez
//         jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
//             if (err) {
//                 return res.status(401).json({ message: 'Token inválido o expirado', error: err.message });
//             }

//             // Si el token es válido, guardamos la información del usuario decodificada en req.usuario
//             req.usuario = decoded;  // Guardamos los datos del usuario decodificados
//             console.log("Usuario verificado:", req.usuario);

//             // Continuamos con el siguiente middleware o ruta
//             return next();  // Añadimos "return" aquí para evitar que se ejecute código posterior
//         });
//     }
// };

const verificarToken = (req, res, next) => {
    // Obtener el token del encabezado Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }
  
    try {
      // Verificar el token utilizando la clave secreta
      const decoded = jwt.verify(token, 'Diego123');
  
      // Almacenar los datos del usuario decodificados en el request (opcional)
      req.user = decoded;
  
      // Continuar con la siguiente función de middleware o ruta
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Token no válido' });
    }
  };

const postTelefono = async (req, res) => {
    const { id } = req.params; // El id del afiliado
    try {
      const { numero } = req.body; // El número de teléfono que se recibe en el cuerpo de la solicitud
  
      // Insertar el número de teléfono en la tabla Telefono
      const sql = 'INSERT INTO Telefono (numero, afiliadoId) VALUES (?, ?)';
      const [results] = await pool.query(sql, [numero, id]);
  
      res.status(201).json({ message: 'Teléfono agregado exitosamente' });
    } catch (error) {
      console.error('Error inserting data:', error);
      return res.status(500).json({ error: 'Error inserting data' });
    }
  };

const postFechaPago = async (req, res) => {
    const { id } = req.params; // El id del afiliado
    try {
      // Obtener la fecha de hoy en formato 'YYYY-MM-DD'
      const today = new Date();
      const fecha = today.toISOString().split('T')[0]; // Esto obtiene solo la parte de la fecha 'YYYY-MM-DD'
  
      // Insertar la fecha en la tabla FechaPago
      const sql = 'INSERT INTO fechaPago (fecha, afiliadoId) VALUES (?, ?)';
      const [results] = await pool.query(sql, [fecha, id]);
  
      res.status(201).json({ 
        message: 'Fecha agregada exitosamente', 
        fechaIngresada: fecha // Imprimir la fecha ingresada
      });
    } catch (error) {
      console.error('Error inserting data:', error);
      return res.status(500).json({ error: 'Error inserting data' });
    }
  };  

const postRol = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Insert data into the database
        const sql = 'INSERT INTO Grupo (nombre) VALUES (?)';
        const [results] = await pool.query(sql, [nombre]);

        res.status(201).json({message: 'Grupo creado exitosamente' });
    } catch (error) {
        console.error('Error inserting data:', error);
        return res.status(500).json({ error: 'Error inserting data' });
    }
};

const posGrupo = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Insert data into the database
        const sql = 'INSERT INTO grupo (nombre) VALUES (?)';
        const [results] = await pool.query(sql, [nombre]);

        res.status(201).json({message: 'metodo de afiliacion creado exitosamente' });
    } catch (error) {
        console.error('Error inserting data:', error);
        return res.status(500).json({ error: 'Error inserting data' });
    }
};

const posMetodo = async (req, res) => {
    try {
        const { nombre } = req.body;

        // Insert data into the database
        const sql = 'INSERT INTO metodoafiliacion (nombre) VALUES (?)';
        const [results] = await pool.query(sql, [nombre]);

        res.status(201).json({message: 'metodo de afiliacion creado exitosamente' });
    } catch (error) {
        console.error('Error inserting data:', error);
        return res.status(500).json({ error: 'Error inserting data' });
    }
};

const logoutUsuario= async (req, res) => {
    try {
        // Eliminar las cookies de acceso y refresco
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        });

        // Responder con éxito
        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error al hacer logout:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }


}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return false;  // Si no hay refresh token, no podemos renovar
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateAccessToken({ id: decoded.id, correo: decoded.correo });

        // Si los encabezados ya fueron enviados, no hacemos nada más
        if (res.headersSent) {
            return false;
        }

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Solo en producción, usar https
            sameSite: 'None',
            maxAge: 1 * 60 * 60 * 1000, // 1 hora
        });

        // Retornar un valor para indicar que el token fue renovado
        return true;
    } catch (err) {
        // Si ocurre un error al verificar el refreshToken, no renovar el accessToken
        return false;
    }
};

const me = async (req, res) => {
    const user = req.usuario; // Los datos del usuario decodificados desde el JWT

    try {
        // Consultar la base de datos para obtener la información del usuario, incluyendo rol_id, dirección y teléfono
        const [rows] = await pool.query(`
            SELECT 
                u.id AS usuarioId, 
                u.correo, 
                u.nombres, 
                u.apellidos, 
                u.fotoPerfil, 
                u.clinica_id, 
                r.nombre AS rol,
                v.id AS vistaId, 
                v.nombre AS vistaNombre, 
                v.logo, 
                v.ruta,
                u.estado AS estado,  
                u.estadoPr AS estadoPr,  
                u.codigo AS codigo,
                u.direccion,  -- Agregar el campo dirección
                u.telefono    -- Agregar el campo teléfono
            FROM 
                Usuarios u
            LEFT JOIN 
                Roles r ON u.rol_id = r.id
            LEFT JOIN 
                Vistas v ON r.id = v.rol_id
            WHERE 
                u.id = ?;
        `, [user?.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Extraer la información del usuario
        const usuario = rows[0];

        // Agrupar las vistas en un array
        const vistas = rows.map(row => ({
            id: row.vistaId,
            nombre: row.vistaNombre,
            logo: row.logo,
            ruta: row.ruta
        }));

        // Devolver los datos del usuario, las vistas, estado, estadoPr, código, rol_id, dirección y teléfono
        res.status(200).json({
            id: usuario.usuarioId,
            correo: usuario.correo,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            fotoPerfil: usuario.fotoPerfil,
            rol: usuario.rol,
            rol_id: usuario.rol_id,  // Incluir rol_id
            clinica_id: usuario.clinica_id || null, 
            estado: usuario.estado || 'No disponible', 
            estadoPr: usuario.estadoPr || 'No disponible', 
            codigo: usuario.codigo || 'No disponible', 
            direccion: usuario.direccion || 'No disponible',  // Incluir dirección
            telefono: usuario.telefono || 'No disponible',  // Incluir teléfono
            vistas: vistas 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
}

const Notificaciones = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        // Obtener las notificaciones más recientes (3), ordenadas por fecha
        const [notificaciones] = await pool.query(
            'SELECT * FROM Notificaciones WHERE es_global = TRUE OR usuario_id = ?',
            [usuarioId]
        );

        // Formatear la fecha de cada notificación para que sea solo "YYYY-MM-DD"
        const notificacionesFormateadas = notificaciones.map(notification => {
            const fecha = new Date(notification.fecha);
            // Obtener el formato "YYYY-MM-DD"
            const fechaFormateada = fecha.toISOString().split('T')[0];
            return {
                ...notification,
                fecha: fechaFormateada
            };
        });

        // Enviar las notificaciones con la fecha formateada
        res.status(200).json(notificacionesFormateadas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
};

const CreateMensagge = async (req, res) => {
    const { mensaje } = req.body;

    try {
        // Crear notificación global
        await pool.query('INSERT INTO Notificaciones (mensaje, es_global) VALUES (?, ?)', [mensaje, true]);

        res.status(200).send({ message: 'Notificación global enviada exitosamente' });
    } catch (error) {
        res.status(500).send({ error: 'Error al enviar notificación global' });
    }
};

module.exports = {
    getUsuario, loginUsuario, postRol, crearUsuario, getUsuariosId,FotoPerfil,verificarToken,
    refreshToken,me,logoutUsuario,
    Notificaciones,
    CreateMensagge,
    getAfiliadosCount,
    posMetodo,
    postTelefono,
    postFechaPago,
    getGrupo,
    getMetodo,
    getFechPago,
    EditCampo,
    posGrupo,
    PostPago,
    editPersonal,
    Reiniciar,
    Suspender,upload,
};