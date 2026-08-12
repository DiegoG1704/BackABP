const { Router } = require("express");
const { verificarToken} = require("../controller/UserController.js");
const { 
    PostEvento,
    crearCampo,
    registrarParticipante,
    generarCodigosEvento,
    PostEmpresa,
    PostFechaEvento,
    subirInvitados} = require("../controller/ControllerPost.js");


const routerPost = Router();

routerPost.post('/PostEvento',verificarToken,PostEvento)

routerPost.post('/PostEmpresa/:evento_id',verificarToken, PostEmpresa)

routerPost.post('/PostCampo/:eventoId',verificarToken,crearCampo);

routerPost.post('/PostGenerarCodigo/:evento_id',verificarToken,generarCodigosEvento)

routerPost.post('/registrarParticipante',registrarParticipante)

routerPost.post('/PostFechaEvento/:idEvento',verificarToken,PostFechaEvento)

routerPost.post('/SubirInvitados',subirInvitados)
module.exports = routerPost;