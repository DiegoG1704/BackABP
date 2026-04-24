const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { postPrenda, postRol, postPersonal, postTaller, postProduccion, PostInformePrenda, PostColor, PostMaterial, PostCliente, PostVenta, PostObservacion, PostAsistencia, PostNotificacines } = require("../controller/ControllerPost.js");


const routerPost = Router();

routerPost.post('/postPrenda',verificarToken,postPrenda)

routerPost.post('/postRol',verificarToken,postRol)

routerPost.post('/postPersonal',verificarToken,postPersonal)

routerPost.post('/PostTaller',verificarToken,postTaller)

routerPost.post('/PostProduccion',verificarToken,postProduccion)

routerPost.post('/PostInformePrenda/:id/:area',verificarToken,PostInformePrenda)

routerPost.post('/PostColor',verificarToken,PostColor)

routerPost.post('/PostMaterial',verificarToken,PostMaterial)

routerPost.post('/PostCliente',verificarToken,PostCliente)

routerPost.post('/PostVenta',verificarToken,PostVenta)

routerPost.post('/PostObservacion/:idVenta',verificarToken,PostObservacion)

routerPost.post('/PostAsistencia/:personaId',verificarToken,PostAsistencia)

routerPost.post('/PostNotificaciones/:remitente',verificarToken,PostNotificacines)

module.exports = routerPost;