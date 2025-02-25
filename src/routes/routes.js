import { Router } from "express";
import {
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
    Suspender
} from "../controller/UserController.js";

const router = Router();

router.post('/login', loginUsuario);
// Crear un nuevo usuario
router.post('/CreateUsuario', crearUsuario);

// Obtener lista de usuarios
router.get('/list', getUsuario);

// Obtener usuario por ID
router.get('/distritos', getUsuariosId);

router.post('/CreateGrupo', postRol);

router.get('/getGrupos',getGrupo)

router.get('/getFechPago/:id',getFechPago)

router.patch('/editCampo/:id',EditCampo)

router.post ('/PostPago/:id',PostPago)

router.patch('/editPersonal/:id',editPersonal)
router.patch('/Reiniciar/:id',Reiniciar)
router.patch('/Suspender/:id',Suspender)

router.get('/getMetodo',getMetodo)

router.post('/CreateMetodo', posMetodo);

router.post('/CreateGrupo', posGrupo);

router.post('/CreateTelefono/:id',verificarToken,postTelefono)

router.post('/CreateFechaPago/:id',verificarToken,postFechaPago)

router.post('/Usuario/:id/uploadProfileImage', verificarToken, upload.single('image'), FotoPerfil);

router.get('/notificaciones/:usuarioId',Notificaciones)

router.post('/CreateNotificaciones', CreateMensagge)

router.post('/refresh-token',refreshToken)
router.get("/me",verificarToken,me)
router.post("/logout",verificarToken,logoutUsuario)

export default router;
