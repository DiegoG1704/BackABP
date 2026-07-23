const { Router } = require("express");
const { verificarToken} = require("../controller/UserController.js");
const { 
    PostEvento,
    crearCampo,
    registrarParticipante,
    generarCodigosEvento} = require("../controller/ControllerPost.js");


const routerPost = Router();

routerPost.post('/PostEvento',verificarToken,PostEvento)

routerPost.post('/PostCampo/:eventoId',verificarToken,crearCampo);

routerPost.post('/PostGenerarCodigo/:evento_id',verificarToken,generarCodigosEvento)

routerPost.post('/registrarParticipante',registrarParticipante)
module.exports = routerPost;