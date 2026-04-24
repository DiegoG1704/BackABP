const { Router } = require("express");
const { verificarToken,upload } = require("../controller/UserController.js");
const { putAreasEstados, putInformes, putEstadosPedidos, PutCliente, putPersonal, putEstadoPersonal, putEditTaller, putRol, putCorreo, updateConfiguracion, updatePassword, putCampoNeg, putCampo, FotoPerfil, FotoTaller, putLeido } = require("../controller/Contollerput.js");

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

routerPut.put('/EditCampo/:id',verificarToken,putCampo)

routerPut.put('/EditCampoNeg/:id',verificarToken,putCampoNeg)

routerPut.put('/AgregarCorreo/:id',verificarToken,putCorreo)

routerPut.put('/putEstadoConfig/:id',verificarToken,updateConfiguracion)

routerPut.put('/CambioPassword/:id',verificarToken,updatePassword)

routerPut.put('/putLeido/:id',verificarToken,putLeido)

routerPut.put('/CambioFotoPerfil/:id',verificarToken,upload.single('perfilUsuario'),FotoPerfil)

routerPut.put('/CambioFotoNegocio/:id',verificarToken,upload.single('perfilNegocio'),FotoTaller)
module.exports = routerPut;