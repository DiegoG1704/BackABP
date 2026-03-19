const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { putAreasEstados, putInformes, putEstadosPedidos, PutCliente, putPersonal, putEstadoPersonal, putEditTaller, putRol } = require("../controller/Contollerput.js");

const routerPut = Router();

routerPut.put('/EditarProduccion/:id',verificarToken,putAreasEstados)

routerPut.put('/EditarInforme/:id',verificarToken,putInformes)

routerPut.put('/CambiarEstadoPedido/:id/:estado',verificarToken,putEstadosPedidos)

routerPut.put('/EditarCliente/:id',verificarToken,PutCliente)

routerPut.put('/EditarPersonal/:id',verificarToken,putPersonal)

routerPut.put('/EditarEstadoPers/:id',verificarToken,putEstadosPedidos)

routerPut.put('/CambiarPersonal/:id',verificarToken,putEstadoPersonal)

routerPut.put('/EditTaller/:id',verificarToken,putEditTaller)

routerPut.put('/EditRol/:id',verificarToken,putRol)
module.exports = routerPut;