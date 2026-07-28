const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { getConfiguraciones,getEventos,getEventosCode,getCamposCode,getParticipantes,getEventoCodigo,
    getCamposPVCode,verificarParticipante, getMe,
    getEmpresa,
    getComprobacion} = require("../controller/ControllerGet.js");

const routerGet = Router();

routerGet.get('/getConfiguraciones/:userId',verificarToken,getConfiguraciones)

routerGet.get('/getEventoCode/:codigo',getEventosCode)

routerGet.get('/getEventos',verificarToken,getEventos)

routerGet.get('/getCampos/:evento_id',getCamposCode)

routerGet.get('/getCamposPrivado/:evento_id',getCamposPVCode)

routerGet.get('/getParticipantes/:codigo',verificarToken,getParticipantes)

routerGet.get('/getEventoCodigo/:codigo',verificarToken,getEventoCodigo)

routerGet.get("/getVerificar/:codigo", verificarParticipante);

routerGet.get("/getEmpresa/:evento_id",verificarToken, getEmpresa);

routerGet.get('/getComprobacion/:codigo',getComprobacion)

routerGet.get('/me/:id',getMe)
module.exports = routerGet;