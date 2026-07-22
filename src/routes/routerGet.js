const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { getColor, getTalla, getPrenda, getModelo, getPrendaId, getMaterial, getRutas, getRol, getPersonal
    , getTaller, getDetallesProduccion, getPrendasProduccion, getDetallePrenda, getInformePrenda, getMe, getInforPrenda, 
    getDetallesInforme, getPrendaModelo, getClientes, getPedidos, getPedidosId, getPrendaSobreventa, getAsistencia, 
    getAsistenciaId, getAsistenciaDash, getConfiguraciones, getNotificaciones, getCanvas, getCanvasID, getPaquetes, 
    getAdministracion, getDetalesPrestamo,
    getPrestamoPagos,
    getGestion,
    procesarVencimientos,
    getActividades,
    getEvidenciaDatos,getProyectos,
    getColumnas,
    getProyectosCodigo,
    getActividadesProyect,
    getEventos,
    getEventosCode,
    getCamposCode,
    getParticipantes,
    getEventoCodigo,
    getCamposPVCode,
    verificarParticipante} = require("../controller/ControllerGet.js");

const routerGet = Router();

routerGet.get('/getColor',verificarToken,getColor)

routerGet.get('/getTallas',verificarToken,getTalla)

routerGet.get('/getPrenda',verificarToken,getPrenda)

routerGet.get('/getModelo',verificarToken,getModelo)

routerGet.get('/getPrendaModelo/:idModelo',verificarToken,getPrendaModelo)

routerGet.get('/getMaterial',verificarToken,getMaterial)

routerGet.get('/getPrenda/:id',verificarToken,getPrendaId)

routerGet.get('/getRutas',verificarToken,getRutas)

routerGet.get('/getTaller',verificarToken,getTaller)

routerGet.get('/getRoles',verificarToken,getRol)

routerGet.get('/getPersonal',verificarToken,getPersonal)

routerGet.get('/getDetalleProduccion',verificarToken,getDetallesProduccion)

routerGet.get('/getPrendasProduccion/:id',verificarToken,getPrendasProduccion)

routerGet.get('/getDetallePrenda/:id',verificarToken,getDetallePrenda)

routerGet.get('/getInforme/:idProduccion/:area',verificarToken,getInformePrenda)

routerGet.get('/getInformePrenda/:idDetallePrenda',verificarToken,getInforPrenda)

routerGet.get('/getDetallesInforme/:id',verificarToken,getDetallesInforme)

routerGet.get('/getClientes',verificarToken,getClientes)

routerGet.get('/getPedidos',verificarToken,getPedidos)

routerGet.get('/getPlantillas',verificarToken,getCanvas)

routerGet.get('/getPlantillasID/:id',verificarToken,getCanvasID)

routerGet.get('/getPedidos/:id',verificarToken,getPedidosId)

routerGet.get('/getSobreventa',verificarToken,getPrendaSobreventa)

routerGet.get('/getAsistencia',verificarToken,getAsistencia)

routerGet.get('/getAsistencia/general/:personaId',verificarToken,getAsistenciaId)

routerGet.get('/getAsistencia/dashboard/:personaId',verificarToken,getAsistenciaDash)

routerGet.get('/getConfiguraciones/:userId',verificarToken,getConfiguraciones)

routerGet.get('/getNotificaciones/:userId',verificarToken,getNotificaciones)

routerGet.get('/getPaquetes',verificarToken,getPaquetes)

routerGet.get('/getAdministracion/:id',verificarToken,getAdministracion)

routerGet.get('/getDetallePrestamo/:id',verificarToken,getDetalesPrestamo)

routerGet.get('/procesarVencimientos/:userId',verificarToken,procesarVencimientos)

routerGet.get('/getGestion',verificarToken,getGestion)

routerGet.get('/getActividades',verificarToken,getActividades)

routerGet.get('/getEvidencia/:actividadId',verificarToken,getEvidenciaDatos)

routerGet.get('/getColumnas',verificarToken,getColumnas)

routerGet.get('/getProyectos',verificarToken,getProyectos)

routerGet.get('/getProyectosCodigo/:codigo',verificarToken,getProyectosCodigo)

routerGet.get('/getActividadCodigo/:codigo',verificarToken,getActividadesProyect)

routerGet.get('/getEventoCode/:codigo',getEventosCode)

routerGet.get('/getEventos',verificarToken,getEventos)

routerGet.get('/getCampos/:evento_id',getCamposCode)

routerGet.get('/getCamposPrivado/:evento_id',getCamposPVCode)

routerGet.get('/getParticipantes/:codigo',verificarToken,getParticipantes)

routerGet.get('/getEventoCodigo/:codigo',verificarToken,getEventoCodigo)

routerGet.get("/getVerificar/:codigo", verificarParticipante);

routerGet.get('/me/:id',getMe)
module.exports = routerGet;