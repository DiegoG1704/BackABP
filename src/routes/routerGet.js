const { Router } = require("express");
const { verificarToken } = require("../controller/UserController.js");
const { getColor, getTalla, getPrenda, getModelo, getPrendaId, getMaterial, getRutas, getRol, getPersonal, getTaller, getDetallesProduccion, getPrendasProduccion, getDetallePrenda, getInformePrenda, getMe, getInforPrenda, getDetallesInforme, getPrendaModelo, getClientes, getPedidos, getPedidosId, getPrendaSobreventa, getAsistencia, getAsistenciaId, getAsistenciaDash} = require("../controller/ControllerGet.js");

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

routerGet.get('/getPedidos/:id',verificarToken,getPedidosId)

routerGet.get('/getSobreventa',verificarToken,getPrendaSobreventa)

routerGet.get('/getAsistencia',verificarToken,getAsistencia)

routerGet.get('/getAsistencia/general/:personaId',verificarToken,getAsistenciaId)

routerGet.get('/getAsistencia/dashboard/:personaId',verificarToken,getAsistenciaDash)

routerGet.get('/me/:id',getMe)
module.exports = routerGet;