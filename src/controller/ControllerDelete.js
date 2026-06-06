const { pool } = require("../database.js");

const DeleteCliente = async (req, res)=>{
  const {id}= req.params
  const query = 'DELETE FROM cliente WHERE id = ?'
  try {
    const [result]= await pool.query(query,[id])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const DeleteTaller = async (req, res)=>{
  const {id}= req.params
  const query = 'DELETE FROM talleres WHERE id = ?'
  try {
    const [result]= await pool.query(query,[id])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const DeletePersonal = async (req, res)=>{
  const {id}= req.params
  const query = 'DELETE FROM cliente WHERE id = ?'
  try {
    const [result]= await pool.query(query,[id])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}

const DeletePlantilla = async (req, res)=>{
  const {id}= req.params
  const query = 'DELETE FROM canvas WHERE id = ?'
  try {
    const [result]= await pool.query(query,[id])
    res.status(200).json(result)
  } catch (error) {
    console.error('Error al obtener las prendas:', error);
    res.status(500).json({ message: 'Error al obtener las prendas' });
  }
}


const deleteRol = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Eliminar relaciones en rol_vistas
    await pool.query(
      'DELETE FROM rol_vistas WHERE idRol = ?',
      [id]
    );

    // 2️⃣ Eliminar el rol
    await pool.query(
      'DELETE FROM rol WHERE id = ?',
      [id]
    );

    res.json({ message: 'Rol eliminado correctamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error al eliminar rol',
      error: error.message
    });
  }
};


module.exports={
    DeleteCliente,DeleteTaller,deleteRol,DeletePlantilla
}