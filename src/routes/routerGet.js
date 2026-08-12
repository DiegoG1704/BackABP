const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { getConfiguraciones,getEventos,getEventosCode,getCamposCode,getParticipantes,getEventoCodigo,
    getCamposPVCode,verificarParticipante, getMe,
    getEmpresa,
    getComprobacion,
    getFechaEvento,
    getParticipantesRegistro,
    getParticipanteRegistroByCode} = require("../controller/ControllerGet.js");

const routerGet = Router();

routerGet.get('/getConfiguraciones/:userId',verificarToken,getConfiguraciones)

routerGet.get('/getEventoCode/:codigo',getEventosCode)

routerGet.get('/getEventos',verificarToken,getEventos)

routerGet.get('/getCampos/:evento_id/:tipoFormulario',getCamposCode)

routerGet.get('/getCamposPrivado/:evento_id',getCamposPVCode)

routerGet.get('/getParticipantes/:codigo',verificarToken,getParticipantes)

routerGet.get('/getEventoCodigo/:codigo',verificarToken,getEventoCodigo)

routerGet.get("/getVerificar/:codigo", verificarParticipante);

routerGet.get("/getEmpresa/:evento_id",verificarToken, getEmpresa);

routerGet.get('/getFechaEvento/:evento_id',verificarToken, getFechaEvento)

routerGet.get('/getParticipantesRegistro/:fecha_evento_id',verificarToken, getParticipantesRegistro)

routerGet.get('/getParticipanteRegistroByCode/:codigo/:fecha_evento_id',verificarToken, getParticipanteRegistroByCode)

routerGet.get('/getComprobacion/:codigo',getComprobacion)

routerGet.get('/me',verificarToken,getMe)
module.exports = routerGet;