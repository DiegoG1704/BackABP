const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { DeleteCliente, DeleteTaller, deleteRol, DeletePlantilla, DeleteAdministracion, DeleteActividad, DeleteProyectoPers } = require("../controller/ControllerDelete.js");

const routerDelt = Router();

routerDelt.delete('/DeleteCliente/:id',verificarToken,DeleteCliente)

routerDelt.delete('/DeleteTaller/:id',verificarToken,DeleteTaller)

routerDelt.delete('/DeleteRol/:id',verificarToken,deleteRol)

routerDelt.delete('/DeletePlantilla/:id',verificarToken,DeletePlantilla)

// routerDelt.delete('/DeleteActividad/:id',verificarToken,DeletePlantilla)

routerDelt.delete('/DeleteAdministracion/:id/:userId',verificarToken,DeleteAdministracion)

routerDelt.delete('/DeleteActividad/:id',verificarToken,DeleteActividad)

routerDelt.delete('/DeleteProyectPers/:idProyecto/:idPersonal',verificarToken,DeleteProyectoPers)
module.exports = routerDelt;