const { Router } = require("express");
const {
    getUsuario, loginUsuario, postRol, crearUsuario, getUsuariosId,FotoPerfil, upload,verificarToken,
    refreshToken,me,logoutUsuario,
    Notificaciones,
    CreateMensagge,
    posMetodo,
    postTelefono,
    postFechaPago,
    getGrupo,
    getMetodo,
    getFechPago,
    EditCampo,
    posGrupo,
    PostPago,
    editPersonal,
    Reiniciar,
    Suspender,
    getAfiliadosCount,
    subirUsuariosDesdeExcel,
    putTelefono,
    deleteTelefono,
    subirTelefonoDesdeExcel,
    subirFechasDesdeExcel,
    EditarEstadosDesdeExcel,
    EditarGrupoDesdeExcel,
    EditarDistritoDesdeExcel,
    AñoDesdeExcel,
} = require("../controller/UserController.js");

const router = Router();

router.post('/login', loginUsuario);
// Crear un nuevo usuario
router.post('/CreateUsuario',verificarToken, crearUsuario);

// Obtener lista de usuarios
router.get('/list',verificarToken, getUsuario);
// Obtener usuario por ID
router.get('/distritos',verificarToken, getUsuariosId);

// router.post('/CreateGrupo',verificarToken, postRol);

router.get('/getGrupos',verificarToken,getGrupo)

router.get('/getFechPago/:id',verificarToken,getFechPago)

router.get('/afiliadosCount',verificarToken,getAfiliadosCount)

router.patch('/editCampo/:id',verificarToken,EditCampo)

router.post ('/PostPago/:id',verificarToken,PostPago)

router.patch('/editPersonal/:id',verificarToken,editPersonal)
router.patch('/Reiniciar/:id',verificarToken,Reiniciar)
router.patch('/Suspender/:id',verificarToken,Suspender)

router.post("/subir-excel", upload.single("archivo"), subirUsuariosDesdeExcel);
router.post("/subir-telefono", upload.single("telefono"), subirTelefonoDesdeExcel);
router.post("/subir-fechas", upload.single("fechas"), subirFechasDesdeExcel);
router.put("/editar-estados", upload.single("estados"), EditarEstadosDesdeExcel);
router.put("/editar-grupo", upload.single("grupo"), EditarGrupoDesdeExcel);
router.put("/editar-distrito", upload.single("distrito"), EditarDistritoDesdeExcel);

router.get('/getMetodo',verificarToken,getMetodo)

router.post('/CreateMetodo',verificarToken, posMetodo);

router.post('/CreateGrupo',verificarToken, posGrupo);

router.post('/CreateTelefono/:id',postTelefono)

router.post('/CreateFechaPago/:id',verificarToken,postFechaPago)

router.put('/PutTelefono/:id',putTelefono)

router.put('/EditarAños',AñoDesdeExcel)

router.delete('/deletetelefono/:id', deleteTelefono); 

router.post('/Usuario/:id/uploadProfileImage', verificarToken, upload.single('image'), FotoPerfil);

router.get('/notificaciones/:usuarioId',Notificaciones)

router.post('/CreateNotificaciones', CreateMensagge)

router.post('/refresh-token',refreshToken)
// router.get("/me",verificarToken,me)
router.post("/logout",verificarToken,logoutUsuario)

module.exports = router;
