const { pool } = require("../database.js");
const bcrypt = require("bcryptjs");

const crearUsuario = async () => {
    try {
        const hashedPassword = await bcrypt.hash("pass123", 10);

        const [rows] = await pool.query('SELECT id FROM usuario WHERE usuario = ?', ['Erick']);

        if (rows.length > 0) {
            await pool.query('UPDATE usuario SET contraseña = ?, usuario = ? WHERE usuario = ?', [hashedPassword, 'Erick', 'Erick']);
            console.log('Usuario "Erick" actualizado con contraseña "pass123" (hasheada)');
        } else {
            await pool.query(
                'INSERT INTO usuario (usuario, contraseña, usuario,idDatos = ?) VALUES (?, ?, ?, ?)',
                ['Erick', hashedPassword, 'Erick', 1]
            );
            console.log('Usuario "Erick" creado con contraseña "pass123" (hasheada)');
        }
    } catch (error) {
        console.error('Error al crear el usuario:', error);
    } finally {
        await pool.end();
    }
};

crearUsuario();
