const { Router } = require("express");
const { verificarToken, upload } = require("../controller/UserController.js");
const { postPrenda, postRol, postPersonal, postTaller, postProduccion, PostInformePrenda, PostColor, PostMaterial, 
    PostCliente, PostVenta, PostObservacion, PostAsistencia, PostNotificacines, postCanvas, postRegistro, 
    postModulos, postMovimientos, 
    postPagosPrestamo,
    PostActividad,
    PostEvidencia,
    PostTarea,PostProyecto,
    PostProyectoPersonal,
    PostEvento,
    crearCampo,
    registrarParticipante,
    generarCodigosEvento} = require("../controller/ControllerPost.js");


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

routerPost.post('/PostCanvas',verificarToken,postCanvas)

routerPost.post('/PostRegistro',verificarToken,postRegistro)

routerPost.post('/PostCompra',verificarToken,postModulos)

routerPost.post('/PostMovimientos/:tipoAdmin',verificarToken,postMovimientos)

routerPost.post('/PostPagoPrestamo',verificarToken,postPagosPrestamo)

routerPost.post('/PostActividad/:userId',verificarToken,PostActividad)

routerPost.post('/PostEvidencia/:id',verificarToken,upload.single('evidencia'),PostEvidencia)

routerPost.post('/PostTarea/:idActividad',verificarToken,PostTarea)

routerPost.post('/PostProyecto',verificarToken,PostProyecto)

routerPost.post('/PostEvento',verificarToken,PostEvento)

routerPost.post('/PostCampo/:eventoId',verificarToken,crearCampo);

routerPost.post('/PostProyectoPersonal/:idProyecto/:idPersonal',verificarToken,PostProyectoPersonal)

routerPost.post('/PostGenerarCodigo/:evento_id',verificarToken,generarCodigosEvento)

routerPost.post('/registrarParticipante',registrarParticipante)
module.exports = routerPost;