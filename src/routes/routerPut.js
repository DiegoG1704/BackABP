const { Router } = require("express");
const { verificarToken,upload } = require("../controller/UserController.js");
const { 
    putCampo,putCampoNeg,  FotoPerfil,putCorreo,updateConfiguracion,updatePassword,FotoTaller,putCampoProyect,
    PutEstadoCambio,
    putCuposEmpresa} = require("../controller/Contollerput.js");

const routerPut = Router();

routerPut.put('/EditCampo/:id',verificarToken,putCampo)

routerPut.put('/EditCampoNeg/:id',verificarToken,putCampoNeg)

routerPut.put('/AgregarCorreo/:id',verificarToken,putCorreo)

routerPut.put('/putEstadoConfig/:id',verificarToken,updateConfiguracion)

routerPut.put('/CambioPassword/:id',verificarToken,updatePassword)

routerPut.put('/CambioFotoPerfil/:id',verificarToken,upload.single('perfilUsuario'),FotoPerfil)

routerPut.put('/CambioFotoNegocio/:id',verificarToken,upload.single('perfilNegocio'),FotoTaller)

routerPut.put('/PutProyectoCampo/:id',verificarToken,putCampoProyect)

routerPut.put('/PutEstadoParticipante/:id',verificarToken,PutEstadoCambio)

routerPut.put('/PutCuposEmpresa/:id',verificarToken,putCuposEmpresa)
module.exports = routerPut;