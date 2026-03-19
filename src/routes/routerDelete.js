const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { DeleteCliente, DeleteTaller, deleteRol } = require("../controller/ControllerDelete.js");

const routerDelt = Router();

routerDelt.delete('/DeleteCliente/:id',verificarToken,DeleteCliente)

routerDelt.delete('/DeleteTaller/:id',verificarToken,DeleteTaller)

routerDelt.delete('/DeleteRol/:id',verificarToken,deleteRol)
module.exports = routerDelt;