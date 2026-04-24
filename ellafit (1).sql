-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-04-2026 a las 01:17:53
-- Versión del servidor: 10.4.10-MariaDB
-- Versión de PHP: 7.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ellafit`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencia`
--

CREATE TABLE `asistencia` (
  `id` int(11) NOT NULL,
  `personaId` int(11) DEFAULT NULL,
  `fecha` date DEFAULT current_timestamp(),
  `horaIngreso` time DEFAULT current_timestamp(),
  `horaSalida` time DEFAULT NULL,
  `Estado` enum('1','2','3','4') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `asistencia`
--

INSERT INTO `asistencia` (`id`, `personaId`, `fecha`, `horaIngreso`, `horaSalida`, `Estado`) VALUES
(1, 2, '2026-03-17', '09:56:05', NULL, '2'),
(2, 4, '2026-03-17', '10:00:19', NULL, '2'),
(3, 2, '2026-03-18', '10:00:24', NULL, '2'),
(4, 4, '2026-03-18', '10:03:08', NULL, '2'),
(5, 2, '2026-03-21', '17:06:12', NULL, '2'),
(6, 4, '2026-03-23', '10:53:43', NULL, '2'),
(7, 4, '2026-04-02', '20:52:28', NULL, '2'),
(8, 1, '2026-04-11', '15:44:55', NULL, '2'),
(9, 1, '2026-04-12', '20:52:12', NULL, '2'),
(10, 1, '2026-04-15', '15:34:54', NULL, '2'),
(11, 1, '2026-04-18', '22:00:39', NULL, '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id` int(11) NOT NULL,
  `tipodocumento` enum('1','2') DEFAULT NULL,
  `documento` varchar(15) DEFAULT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `telefono` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id`, `tipodocumento`, `documento`, `nombre`, `direccion`, `telefono`) VALUES
(1, '2', '12345678123', 'Juan Pérez', 'Calle 123 av. San Martin', 987654321),
(2, '2', '87654321', 'Ana García', 'Av. Siempre Viva 456', 123456789),
(3, '1', '72217845', 'DIEGO ELMER', 'AV. JAVIER PRADO ESTE NRO. 1066 URB. CORPAC LIMA LIMA SAN ISIDRO', 987741621),
(4, '2', '72213457981', 'FLOR ROSARIO', 'Jr. Carlos Raygada #103 Urb. Condevilla', 999458378),
(8, '2', '72216892336', 'Carmen Rosa', 'Mz L Lt 3 Sagrada Corazón De Jesús', 999458378);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `color`
--

CREATE TABLE `color` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `color`
--

INSERT INTO `color` (`id`, `nombre`) VALUES
(1, 'Rojo'),
(2, 'Azul'),
(3, 'Verde'),
(4, 'Negro'),
(5, 'Blanco'),
(7, 'gris');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones`
--

CREATE TABLE `configuraciones` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `configuraciones`
--

INSERT INTO `configuraciones` (`id`, `descripcion`) VALUES
(1, 'Modo Claro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datos`
--

CREATE TABLE `datos` (
  `id` int(11) NOT NULL,
  `nombres` varchar(50) DEFAULT NULL,
  `estado` enum('1','2','3') DEFAULT '1',
  `dni` int(11) DEFAULT NULL,
  `telefono` int(20) DEFAULT NULL,
  `idRol` int(11) DEFAULT NULL,
  `fecha` date NOT NULL DEFAULT current_timestamp(),
  `correo` varchar(50) DEFAULT NULL,
  `fotoPerfil` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `datos`
--

INSERT INTO `datos` (`id`, `nombres`, `estado`, `dni`, `telefono`, `idRol`, `fecha`, `correo`, `fotoPerfil`) VALUES
(1, 'Carlos Cavalier', '1', 23456789, 987654321, 1, '2025-05-12', NULL, '1775190049170-IMG_0797.JPG'),
(2, 'Alexandra de la Cruz Carranza', '1', 34567890, 999458360, 2, '2025-05-12', 'Ejemplo45@gmail.com', '1775327841269-AltaSalud.jpg'),
(4, 'John Llave 2', '1', 27440013, 999458372, 7, '2025-05-13', 'dgst1704@gmail.com', '1775846268041-Gemini_Generated_Image_7axk987axk987axk.png'),
(5, 'MILAGROS JULIA TERESA', '1', 27440013, 999458377, 1, '2025-05-14', NULL, NULL),
(6, 'RICARDO GERMAN', '1', 29607137, 978787878, 1, '2025-05-14', NULL, NULL),
(7, 'ALEJANDRA', '1', 29607137, 999458378, 1, '2026-03-16', NULL, NULL),
(8, 'Matias Capuñay Soto', '1', 72217894, 982919282, 1, '2026-03-23', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_prenda`
--

CREATE TABLE `detalle_prenda` (
  `id` int(11) NOT NULL,
  `idDetalle` int(11) NOT NULL,
  `cantidad` int(20) DEFAULT NULL,
  `cantidadExt` int(20) DEFAULT NULL,
  `talla` int(20) DEFAULT NULL,
  `cantidadTotal` int(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `detalle_prenda`
--

INSERT INTO `detalle_prenda` (`id`, `idDetalle`, `cantidad`, `cantidadExt`, `talla`, `cantidadTotal`) VALUES
(2, 5, NULL, NULL, 1, NULL),
(3, 6, NULL, NULL, 1, NULL),
(4, 7, NULL, NULL, 1, NULL),
(5, 8, NULL, NULL, 1, NULL),
(6, 9, NULL, NULL, 1, NULL),
(7, 10, NULL, NULL, 1, NULL),
(8, 11, NULL, NULL, 1, NULL),
(9, 12, 123, 11, 1, 134),
(10, 13, 134, 11, 3, 145),
(11, 14, 100, 10, 3, 110),
(12, 15, 120, 10, 2, 90),
(13, 16, 200, 20, 1, 120),
(14, 17, 100, 10, 3, 100),
(15, 18, 100, 10, 2, 110),
(16, 19, 120, 20, 1, 135),
(17, 20, 100, 50, 3, 150),
(18, 21, 120, 10, 1, 123),
(19, 22, 100, 10, 1, 110),
(20, 23, 100, 10, 1, 100),
(21, 24, 100, 10, 2, 100),
(22, 25, 100, 10, 3, 100),
(23, 26, 100, 10, 4, 100),
(24, 27, 100, 10, 1, 100),
(25, 28, 100, 10, 2, 100),
(26, 29, 100, 10, 3, 100),
(27, 30, 100, 10, 4, 100),
(28, 31, 100, 10, 1, 105),
(29, 32, 100, 10, 2, 100),
(30, 33, 100, 10, 3, 100),
(31, 34, 100, 10, 4, 109);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_produccion`
--

CREATE TABLE `detalle_produccion` (
  `id` int(11) NOT NULL,
  `idProduccion` int(11) DEFAULT NULL,
  `idPrenda` int(11) DEFAULT NULL,
  `idResponsable` int(10) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `cantidadReservada` int(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `detalle_produccion`
--

INSERT INTO `detalle_produccion` (`id`, `idProduccion`, `idPrenda`, `idResponsable`, `cantidad`, `cantidadReservada`) VALUES
(5, 4, 17, 1, 44, NULL),
(6, 4, 12, 2, 48, NULL),
(7, 4, 16, 2, 35, NULL),
(8, 5, 12, 1, 150, NULL),
(9, 5, 16, 2, 140, NULL),
(10, 6, 18, 1, 390, NULL),
(11, 6, 19, 2, 390, NULL),
(12, 7, 1, 1, 134, NULL),
(13, 7, 19, 1, 145, NULL),
(14, 7, 3, 1, 110, NULL),
(15, 8, 19, 1, 130, 7),
(16, 8, 19, 1, 220, 7),
(17, 8, 19, 1, 110, 7),
(18, 9, 2, 1, 110, NULL),
(19, 9, 3, 1, 140, NULL),
(20, 9, 18, 2, 150, NULL),
(21, 10, 21, 1, 130, NULL),
(22, 10, 23, 1, 110, NULL),
(23, 11, 21, 1, 110, 1),
(24, 11, 21, 1, 110, 1),
(25, 11, 21, 1, 110, 1),
(26, 11, 21, 1, 110, 1),
(27, 11, 22, 2, 110, NULL),
(28, 11, 22, 2, 110, NULL),
(29, 11, 22, 2, 110, NULL),
(30, 11, 22, 2, 110, NULL),
(31, 12, 12, 1, 110, NULL),
(32, 12, 12, 1, 110, NULL),
(33, 12, 12, 1, 110, NULL),
(34, 12, 12, 1, 110, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id` int(11) NOT NULL,
  `idVenta` int(11) DEFAULT NULL,
  `idPrenda` int(11) DEFAULT NULL,
  `idTalla` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id`, `idVenta`, `idPrenda`, `idTalla`, `cantidad`) VALUES
(1, 1, 1, NULL, 10),
(2, 1, 2, NULL, 5),
(3, 2, 3, NULL, 8),
(4, 3, 1, 1, 5),
(5, 3, 2, 2, 4),
(6, 4, 1, 1, 5),
(7, 5, 21, 1, 5),
(8, 6, 21, 1, 5),
(9, 9, 12, 2, 5),
(11, 14, 22, 1, 1),
(12, 15, 22, 1, 1),
(13, 20, 22, 1, 1),
(14, 22, 22, 1, 1),
(15, 25, 21, 1, 1),
(16, 25, 21, 2, 1),
(17, 25, 21, 3, 1),
(18, 25, 21, 4, 1),
(19, 27, 22, 2, 5),
(20, 27, 21, 2, 5),
(21, 29, 22, 2, 5),
(22, 29, 22, 1, 5),
(23, 30, 19, 3, 1),
(24, 30, 21, 3, 1),
(25, 31, 19, 3, 1),
(26, 32, 22, 4, 1),
(27, 34, 22, 1, 1),
(28, 35, 19, 3, 5),
(29, 37, 23, 1, 5),
(30, 41, 21, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe`
--

CREATE TABLE `informe` (
  `id` int(11) NOT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `area` enum('2','3','4') DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT NULL,
  `idDetallePrenda` int(20) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `cantMerma` int(11) DEFAULT NULL,
  `estadoInforme` enum('1','2','3') NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `informe`
--

INSERT INTO `informe` (`id`, `idUsuario`, `area`, `fecha`, `idDetallePrenda`, `cantidad`, `cantMerma`, `estadoInforme`) VALUES
(18, 4, '2', '2026-01-20 18:15:17', 12, 130, 120, '2'),
(19, 4, '3', '2026-01-22 01:08:21', 12, 100, 5, '2'),
(20, 4, '4', '2026-01-22 01:19:20', 12, 90, 5, '2'),
(21, 4, '2', '2026-01-20 21:53:22', 13, 220, 10, '2'),
(22, 4, '3', '2026-01-22 01:08:31', 13, 120, 0, '2'),
(23, 4, '4', '2026-01-22 01:19:29', 13, 120, 0, '2'),
(24, 4, '2', '2026-01-21 16:37:18', 14, 110, 10, '2'),
(25, 4, '3', '2026-01-22 01:08:55', 14, 100, 5, '2'),
(26, 4, '4', '2026-01-22 01:19:35', 14, 100, 0, '2'),
(27, 4, '2', '2026-01-23 00:49:12', 15, 110, 0, '2'),
(28, 4, '3', '2026-01-23 01:06:35', 15, 110, 0, '2'),
(29, 4, '4', '2026-01-23 01:08:04', 15, 110, 0, '2'),
(30, 4, '2', '2026-01-23 00:49:24', 16, 140, 5, '2'),
(31, 4, '3', '2026-01-23 01:06:47', 16, 135, 5, '2'),
(32, 4, '4', '2026-01-23 01:07:41', 16, 135, 0, '2'),
(33, 4, '2', '2026-01-23 00:49:34', 17, 150, 10, '2'),
(34, 4, '3', '2026-01-23 01:07:00', 17, 150, 100, '2'),
(35, 4, '4', '2026-01-23 01:07:56', 17, 150, 100, '2'),
(36, 4, '2', '2026-01-23 16:31:39', 18, 130, 0, '2'),
(37, 4, '3', '2026-01-23 16:32:11', 18, 125, 2, '2'),
(38, 4, '4', '2026-01-23 16:32:36', 18, 123, 0, '2'),
(39, 4, '2', '2026-01-23 16:31:45', 19, 110, 0, '2'),
(40, 4, '3', '2026-01-23 16:32:20', 19, 110, 0, '2'),
(41, 4, '4', '2026-01-23 16:32:49', 19, 110, 0, '2'),
(42, 4, '2', '2026-01-25 00:14:44', 20, 100, 0, '2'),
(43, 4, '3', '2026-01-25 00:15:32', 20, 100, 0, '2'),
(44, 4, '4', '2026-01-25 00:16:28', 20, 100, 0, '2'),
(45, 4, '2', '2026-01-25 00:14:50', 21, 100, 0, '2'),
(46, 4, '3', '2026-01-25 00:15:37', 21, 100, 0, '2'),
(47, 4, '4', '2026-01-25 00:16:33', 21, 100, 0, '2'),
(48, 4, '2', '2026-01-25 00:14:55', 22, 100, 0, '2'),
(49, 4, '3', '2026-01-25 00:15:51', 22, 100, 0, '2'),
(50, 4, '4', '2026-01-25 00:16:39', 22, 100, 0, '2'),
(51, 4, '2', '2026-01-25 00:15:01', 23, 100, 0, '2'),
(52, 4, '3', '2026-01-25 00:15:59', 23, 100, 0, '2'),
(53, 4, '4', '2026-01-25 00:16:44', 23, 100, 0, '2'),
(54, 4, '2', '2026-01-25 00:15:06', 24, 100, 0, '2'),
(55, 4, '3', '2026-01-25 00:16:05', 24, 100, 0, '2'),
(56, 4, '4', '2026-01-25 00:16:51', 24, 100, 0, '2'),
(57, 4, '2', '2026-01-25 00:15:12', 25, 100, 0, '2'),
(58, 4, '3', '2026-01-25 00:16:11', 25, 100, 0, '2'),
(59, 4, '4', '2026-01-25 00:16:57', 25, 100, 0, '2'),
(60, 4, '2', '2026-01-25 00:15:17', 26, 100, 0, '2'),
(61, 4, '3', '2026-01-25 00:16:16', 26, 100, 0, '2'),
(62, 4, '4', '2026-01-25 00:17:02', 26, 100, 0, '2'),
(63, 4, '2', '2026-01-25 00:15:23', 27, 100, 0, '2'),
(64, 4, '3', '2026-01-25 00:16:20', 27, 100, 0, '2'),
(65, 4, '4', '2026-01-25 00:17:06', 27, 100, 0, '2'),
(66, 4, '2', '2026-03-05 02:40:05', 28, 105, 5, '2'),
(67, NULL, '3', NULL, 28, NULL, NULL, '1'),
(68, NULL, '4', NULL, 28, NULL, NULL, '1'),
(69, 4, '2', '2026-03-05 02:40:20', 29, 100, 5, '2'),
(70, NULL, '3', NULL, 29, NULL, NULL, '1'),
(71, NULL, '4', NULL, 29, NULL, NULL, '1'),
(72, 4, '2', '2026-03-05 02:40:31', 30, 100, 6, '2'),
(73, NULL, '3', NULL, 30, NULL, NULL, '1'),
(74, NULL, '4', NULL, 30, NULL, NULL, '1'),
(75, 4, '2', '2026-03-05 02:40:48', 31, 109, 0, '2'),
(76, NULL, '3', NULL, 31, NULL, NULL, '1'),
(77, NULL, '4', NULL, 31, NULL, NULL, '1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `material`
--

CREATE TABLE `material` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `material`
--

INSERT INTO `material` (`id`, `nombre`) VALUES
(1, 'Algodón'),
(2, 'Poliéster'),
(5, 'Seda');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelo`
--

CREATE TABLE `modelo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `precioU` int(11) DEFAULT NULL,
  `precioM` int(11) DEFAULT NULL,
  `idMaterial` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `modelo`
--

INSERT INTO `modelo` (`id`, `nombre`, `precioU`, `precioM`, `idMaterial`) VALUES
(1, 'Beckan', 100, 150, 1),
(2, 'Bern', 120, 170, 1),
(11, 'Beckam', 12, 18, 2),
(13, 'startModel', 12, 18, 1),
(14, 'adidas', 20, 40, 1),
(16, 'Nike', 100, 120, 1),
(17, 'I-run', 100, 180, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `mensaje` varchar(500) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `estado` enum('1','2') NOT NULL DEFAULT '1',
  `fechaEnvio` datetime NOT NULL DEFAULT current_timestamp(),
  `titulo` varchar(200) DEFAULT NULL,
  `remitente` int(11) DEFAULT NULL,
  `archivo` varchar(300) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `notificaciones`
--

INSERT INTO `notificaciones` (`id`, `mensaje`, `userId`, `estado`, `fechaEnvio`, `titulo`, `remitente`, `archivo`) VALUES
(1, 'Prueba de notificaciones', 1, '2', '2026-04-11 00:00:00', 'Prueba', 4, NULL),
(2, 'Preuba de envio de acctividades a la usuaria alexandra de la cruz carranza', 2, '2', '2026-04-13 16:01:29', 'Trabajo de Almacen', 1, NULL),
(3, 'revisa la produccon q se realizo con camisas', 4, '2', '2026-04-15 15:25:45', 'Revisa la Produccion', 1, NULL),
(4, 'Prueba realizada correctamente revisar area de cortes', 4, '2', '2026-04-15 16:29:16', 'prueba echa', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observacion`
--

CREATE TABLE `observacion` (
  `id` int(11) NOT NULL,
  `idVenta` int(11) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `observacion`
--

INSERT INTO `observacion` (`id`, `idVenta`, `descripcion`) VALUES
(1, 1, 'Cliente satisfecho con la calidad'),
(2, 2, 'Entrega pendiente por falta de stock'),
(3, 26, NULL),
(4, 26, NULL),
(5, 25, 'prueba');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observacion_personal`
--

CREATE TABLE `observacion_personal` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(1000) NOT NULL,
  `idPersonal` int(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `observacion_personal`
--

INSERT INTO `observacion_personal` (`id`, `descripcion`, `idPersonal`) VALUES
(1, 'prueba', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prenda`
--

CREATE TABLE `prenda` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `idColor` int(11) DEFAULT NULL,
  `genero` enum('Varon','Mujer') DEFAULT NULL,
  `idModelo` int(11) DEFAULT NULL,
  `stock` int(10) DEFAULT NULL,
  `merma` int(20) DEFAULT NULL,
  `imagen` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `prenda`
--

INSERT INTO `prenda` (`id`, `nombre`, `idColor`, `genero`, `idModelo`, `stock`, `merma`, `imagen`) VALUES
(1, 'Camiseta Deportiva', 1, 'Varon', 1, 20, NULL, NULL),
(2, 'Pantalón Deportivo', 2, 'Mujer', 1, 60, NULL, NULL),
(3, 'Sudadera Deportiva', 3, 'Varon', 2, 70, NULL, NULL),
(12, 'Beckam-Verde-Mujer', 3, 'Mujer', 11, 0, NULL, NULL),
(15, 'startModel-Azul-Mujer', 2, 'Mujer', 13, 0, NULL, NULL),
(16, 'startModel-Verde-Varón', 3, 'Varon', 13, 0, NULL, NULL),
(17, 'startModel-Negro-Varón', 4, 'Varon', 13, 0, NULL, NULL),
(18, 'adidas-Rojo-Varón', 1, 'Varon', 14, 0, NULL, NULL),
(19, 'adidas-Azul-Varón', 2, 'Varon', 14, 0, NULL, NULL),
(21, 'Nike-Negro-Varón', 4, 'Varon', 16, 0, NULL, NULL),
(22, 'Nike-Negro-Mujer', 4, 'Mujer', 16, 0, NULL, NULL),
(23, 'Nike-Blanco-Varón', 5, 'Varon', 16, 0, NULL, NULL),
(24, 'Nike-Blanco-Varón', 5, 'Varon', 16, 0, NULL, NULL),
(25, 'I-run-Azul-Varón', 2, 'Varon', 17, 0, NULL, NULL),
(26, 'I-run-Rojo-Varón', 1, 'Varon', 17, 0, NULL, NULL),
(27, 'I-run-Negro-Varón', 4, 'Varon', 17, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prenda_talla`
--

CREATE TABLE `prenda_talla` (
  `id` int(11) NOT NULL,
  `idPrenda` int(11) DEFAULT NULL,
  `idTalla` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `prenda_talla`
--

INSERT INTO `prenda_talla` (`id`, `idPrenda`, `idTalla`, `cantidad`) VALUES
(28, 12, 2, 107),
(29, 12, 3, 22),
(30, 15, 1, 0),
(31, 15, 2, 0),
(32, 15, 3, 0),
(33, 15, 4, 0),
(34, 16, 1, 111),
(35, 16, 2, 42),
(36, 16, 3, 10),
(37, 16, 4, 12),
(38, 17, 1, 11),
(39, 17, 2, 11),
(40, 17, 3, 11),
(41, 17, 4, 11),
(42, 18, 1, 120),
(43, 18, 2, 120),
(44, 18, 3, 150),
(45, 18, 4, 50),
(46, 19, 1, 240),
(47, 19, 2, 205),
(48, 19, 3, 200),
(49, 19, 4, 50),
(51, 21, 1, 221),
(52, 21, 2, 94),
(53, 21, 3, 99),
(54, 21, 4, 99),
(55, 22, 1, 90),
(56, 22, 2, 90),
(57, 22, 3, 100),
(58, 22, 4, 100),
(59, 23, 1, 105),
(60, 23, 2, 0),
(61, 23, 3, 0),
(62, 23, 4, 0),
(63, 24, 1, 0),
(64, 24, 2, 0),
(65, 24, 3, 0),
(66, 24, 4, 0),
(67, 25, 1, 0),
(68, 25, 2, 0),
(69, 25, 3, 0),
(70, 25, 4, 0),
(71, 26, 1, 0),
(72, 26, 2, 0),
(73, 26, 3, 0),
(74, 26, 4, 0),
(75, 27, 1, 0),
(76, 27, 2, 0),
(77, 27, 3, 0),
(78, 27, 4, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `produccion`
--

CREATE TABLE `produccion` (
  `id` int(11) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `fecha_inicio` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('1','2','3','4','5') DEFAULT '1',
  `area` enum('1','2','3','4','5') DEFAULT '1',
  `idModelo` int(11) DEFAULT NULL,
  `fechaFin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `produccion`
--

INSERT INTO `produccion` (`id`, `codigo`, `fecha_inicio`, `estado`, `area`, `idModelo`, `fechaFin`) VALUES
(4, 'A001', '2025-05-24 02:35:53', '4', '2', 2, NULL),
(5, 'A002', '2026-01-16 16:33:10', '1', '1', 1, NULL),
(6, 'A003', '2026-01-16 23:00:29', '1', '1', 14, NULL),
(7, 'A004', '2026-01-18 01:21:07', '3', '2', 2, NULL),
(8, 'A005', '2026-01-20 16:00:05', '5', '5', 14, '2026-01-22'),
(9, 'A006', '2026-01-22 23:51:40', '5', '5', 2, '2026-01-22'),
(10, 'A007', '2026-01-23 16:29:51', '5', '5', 16, '2026-01-23'),
(11, 'A008', '2026-01-25 00:12:28', '5', '5', 16, '2026-01-24'),
(12, 'A009', '2026-03-02 21:14:06', '2', '3', 11, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Empleado'),
(5, 'Supervisor general'),
(6, 'Ventas'),
(7, 'Admin General');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_config`
--

CREATE TABLE `rol_config` (
  `id` int(11) NOT NULL,
  `configId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `estado` enum('1','2') DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `rol_config`
--

INSERT INTO `rol_config` (`id`, `configId`, `userId`, `estado`) VALUES
(1, 1, 2, '2'),
(2, 1, 4, '2'),
(3, 1, 1, '2'),
(4, 1, 8, '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_vistas`
--

CREATE TABLE `rol_vistas` (
  `id` int(11) NOT NULL,
  `idRol` int(11) DEFAULT NULL,
  `idVistas` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `rol_vistas`
--

INSERT INTO `rol_vistas` (`id`, `idRol`, `idVistas`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 2),
(5, 2, 3),
(6, 5, 10),
(7, 5, 8),
(8, 5, 9),
(9, 6, 3),
(10, 6, 4),
(11, 6, 5),
(12, 6, 6),
(13, 7, 1),
(14, 7, 3),
(15, 7, 5),
(16, 7, 7),
(17, 7, 9),
(18, 7, 11),
(19, 7, 2),
(20, 7, 4),
(21, 7, 6),
(22, 7, 8),
(23, 7, 10),
(24, 7, 12),
(25, 2, 10),
(30, 1, 4),
(31, 1, 13),
(32, 1, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talla`
--

CREATE TABLE `talla` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `talla`
--

INSERT INTO `talla` (`id`, `nombre`) VALUES
(1, 'S'),
(2, 'M'),
(3, 'L'),
(4, 'XL');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `talleres`
--

CREATE TABLE `talleres` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `ruc` varchar(16) DEFAULT NULL,
  `idEncargado` int(11) DEFAULT NULL,
  `imagen` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `talleres`
--

INSERT INTO `talleres` (`id`, `nombre`, `direccion`, `ruc`, `idEncargado`, `imagen`) VALUES
(1, 'Taller M.A', 'AV. JAVIER PRADO ESTE NRO. 1066 URB. CORPAC LIMA LIMA SAN ISIDRO', '0', 5, NULL),
(2, 'Textiles Encanto', 'Jr. Carlos Raygada #103 Urb. Condevilla', '0', 6, NULL),
(3, 'Taller M.A.G', 'MzA lote 20 los claveles Lurin II', '0', 7, NULL),
(4, 'EllaFit ', 'la victoria calle 32 ', '123322222419', 4, '1775846410175-plantillaNegocio.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `usuario` varchar(20) DEFAULT NULL,
  `contraseña` varchar(20) DEFAULT NULL,
  `idDatos` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `usuario`, `contraseña`, `idDatos`) VALUES
(1, 'carlosm', 'pass123', 1),
(2, 'laural', 'pass123', 2),
(4, 'Admin123', 'Admin123', 4),
(5, 'matias', 'Matias123', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `idUsuario` int(11) DEFAULT NULL,
  `tipoPago` enum('1','2') DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `estado` enum('1','2','3','4') NOT NULL DEFAULT '1',
  `direccion` varchar(500) DEFAULT NULL,
  `telefono` int(20) DEFAULT NULL,
  `tipoVenta` enum('1','2','3') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id`, `fecha`, `idUsuario`, `tipoPago`, `total`, `estado`, `direccion`, `telefono`, `tipoVenta`) VALUES
(1, '2025-05-09 02:44:53', 1, '1', 5000, '1', NULL, NULL, NULL),
(2, '2025-05-09 02:44:53', 2, '2', 3000, '1', NULL, NULL, NULL),
(3, '2026-02-24 18:41:58', 4, '1', 1062, '1', '', 0, '2'),
(4, '2026-02-24 21:31:31', 4, '1', 590, '1', 'Calle Prueba 32', 999888777, '1'),
(5, '2026-02-25 16:03:11', 4, '1', 590, '1', '', 0, '2'),
(6, '2026-02-25 16:11:57', 4, '1', 590, '1', '', 0, '2'),
(9, '2026-02-25 23:48:49', 4, '1', 71, '1', '', 0, '2'),
(14, '2026-02-25 23:51:25', 4, '1', 118, '1', 'Calle prueba 123', 988921104, '1'),
(15, '2026-02-25 23:55:48', 4, '1', 118, '1', '', 0, '2'),
(20, '2026-02-26 00:19:50', 4, '1', 118, '1', '', 0, '2'),
(21, '2026-02-26 00:19:50', 4, '1', 118, '2', '', 0, '2'),
(22, '2026-02-26 00:21:00', 4, '1', 118, '1', '', 0, '2'),
(25, '2026-03-02 17:15:15', 4, '1', 472, '4', 'Avenida Prueba Calle 32 ', 999111222, '1'),
(26, '2026-03-02 17:15:15', 4, '1', 472, '4', 'Avenida Prueba Calle 32 ', 999111222, '1'),
(27, '2026-03-02 17:22:33', 4, '1', 1180, '1', 'Calle 32', 989898989, '1'),
(28, '2026-03-02 17:22:33', 4, '1', 1180, '1', 'Calle 32', 989898989, '1'),
(29, '2026-03-02 17:29:30', 4, '1', 1180, '3', 'Calle Prueba 32', 987987987, '1'),
(30, '2026-03-05 03:55:57', 4, '', 142, '3', NULL, 999933311, '3'),
(31, '2026-03-05 04:05:27', 4, '2', 24, '3', 'Alameda', 987789789, '3'),
(32, '2026-03-05 04:10:38', 4, '', 118, '3', 'calle almada', 888777990, '3'),
(34, '2026-03-16 16:50:49', 4, '1', 118, '1', '', 0, '2'),
(35, '2026-03-23 15:02:28', 4, '2', 118, '3', 'Direccion 123', 2147483647, '3'),
(37, '2026-03-23 15:37:41', 4, '1', 590, '3', 'direccion45', 998291983, '1'),
(41, '2026-04-19 03:02:39', 1, '1', 118, '1', '', 0, '2');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta_cliente`
--

CREATE TABLE `venta_cliente` (
  `id` int(11) NOT NULL,
  `idVenta` int(11) DEFAULT NULL,
  `idCliente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `venta_cliente`
--

INSERT INTO `venta_cliente` (`id`, `idVenta`, `idCliente`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, NULL),
(4, 4, NULL),
(5, 5, NULL),
(6, 6, NULL),
(9, 9, NULL),
(14, 14, 4),
(15, 15, 4),
(18, 21, NULL),
(20, 26, 4),
(21, 28, 4),
(22, 29, 3),
(23, 30, 3),
(24, 31, 4),
(25, 32, 2),
(26, 35, 2),
(28, 37, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vistas`
--

CREATE TABLE `vistas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) DEFAULT NULL,
  `ruta` varchar(50) DEFAULT NULL,
  `icono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `vistas`
--

INSERT INTO `vistas` (`id`, `nombre`, `ruta`, `icono`) VALUES
(1, 'Produccion', '/Principal', 'pi pi-th-large'),
(2, 'Productos', '/Principal/Page/Productos', 'pi pi-box'),
(3, 'Almacen', '/Principal/Page/Almacen', 'pi pi-warehouse'),
(4, 'Interfaz de Venta', '/Principal/Page/Ventas', 'pi pi-shopping-cart'),
(5, 'Preventas', '/Principal/Page/Pedidos', 'pi pi-send'),
(6, 'Gestion Envios', '/Principal/Page/GestionEnvios', 'pi pi-truck'),
(7, 'Gestión de Roles', '/Principal/Page/GestionRoles', 'pi pi-briefcase'),
(8, 'Personales', '/Principal/Page/Personal', 'pi pi-users'),
(9, 'Confirmacion', '/Principal/Page/ConfirmacionPedido', 'pi pi-clipboard'),
(10, 'Asistencia', '/Principal/Page/Asistencia', 'pi pi-address-book'),
(11, 'Talleres', '/Principal/Page/Talleres', 'pi pi-shop'),
(12, 'Clientes', '/Principal/Page/Cliente', 'pi pi-users'),
(13, 'Documentos', '/Principal/Page/Documentos', 'pi pi-book');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asistencia_ibfk_1` (`personaId`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `color`
--
ALTER TABLE `color`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `datos`
--
ALTER TABLE `datos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `datos_ibfk_1` (`idRol`);

--
-- Indices de la tabla `detalle_prenda`
--
ALTER TABLE `detalle_prenda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prenda_detalle_ibfk_1` (`idDetalle`),
  ADD KEY `prenda_detalle_ibfk_2` (`talla`);

--
-- Indices de la tabla `detalle_produccion`
--
ALTER TABLE `detalle_produccion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProduccion` (`idProduccion`),
  ADD KEY `idPrenda` (`idPrenda`),
  ADD KEY `detalle_produccion_ibfk_3` (`idResponsable`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idVenta` (`idVenta`),
  ADD KEY `idPrenda` (`idPrenda`),
  ADD KEY `detalle_venta_ibfk_3` (`idTalla`);

--
-- Indices de la tabla `informe`
--
ALTER TABLE `informe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `informe_ibfk_1` (`idUsuario`),
  ADD KEY `informe_ibfk_2` (`idDetallePrenda`);

--
-- Indices de la tabla `material`
--
ALTER TABLE `material`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modelo`
--
ALTER TABLE `modelo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modelo_ibfk_1` (`idMaterial`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifiaciones_ibfk_1` (`userId`),
  ADD KEY `notifiaciones_ibfk_2` (`remitente`);

--
-- Indices de la tabla `observacion`
--
ALTER TABLE `observacion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idVenta` (`idVenta`);

--
-- Indices de la tabla `observacion_personal`
--
ALTER TABLE `observacion_personal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personal_ibfk_1` (`idPersonal`);

--
-- Indices de la tabla `prenda`
--
ALTER TABLE `prenda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idColor` (`idColor`),
  ADD KEY `prenda_ibfk_1` (`idModelo`);

--
-- Indices de la tabla `prenda_talla`
--
ALTER TABLE `prenda_talla`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prenda_talla_ibfk_1` (`idPrenda`),
  ADD KEY `prenda_talla_ibfk_2` (`idTalla`);

--
-- Indices de la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produccion_modelo_ibfk_1` (`idModelo`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `rol_config`
--
ALTER TABLE `rol_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rol_config_ibfk_2` (`configId`),
  ADD KEY `rol_config_ibfk_1` (`userId`);

--
-- Indices de la tabla `rol_vistas`
--
ALTER TABLE `rol_vistas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idRol` (`idRol`),
  ADD KEY `idVistas` (`idVistas`);

--
-- Indices de la tabla `talla`
--
ALTER TABLE `talla`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `talleres`
--
ALTER TABLE `talleres`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taller_ibfk_1` (`idEncargado`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idDatos` (`idDatos`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `venta_cliente`
--
ALTER TABLE `venta_cliente`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idVenta` (`idVenta`),
  ADD KEY `idCliente` (`idCliente`);

--
-- Indices de la tabla `vistas`
--
ALTER TABLE `vistas`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistencia`
--
ALTER TABLE `asistencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `color`
--
ALTER TABLE `color`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `datos`
--
ALTER TABLE `datos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `detalle_prenda`
--
ALTER TABLE `detalle_prenda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `detalle_produccion`
--
ALTER TABLE `detalle_produccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `informe`
--
ALTER TABLE `informe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de la tabla `material`
--
ALTER TABLE `material`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `modelo`
--
ALTER TABLE `modelo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `observacion`
--
ALTER TABLE `observacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `observacion_personal`
--
ALTER TABLE `observacion_personal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `prenda`
--
ALTER TABLE `prenda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `prenda_talla`
--
ALTER TABLE `prenda_talla`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT de la tabla `produccion`
--
ALTER TABLE `produccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `rol_config`
--
ALTER TABLE `rol_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `rol_vistas`
--
ALTER TABLE `rol_vistas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `talla`
--
ALTER TABLE `talla`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `talleres`
--
ALTER TABLE `talleres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `venta_cliente`
--
ALTER TABLE `venta_cliente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `vistas`
--
ALTER TABLE `vistas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asistencia`
--
ALTER TABLE `asistencia`
  ADD CONSTRAINT `asistencia_ibfk_1` FOREIGN KEY (`personaId`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `datos`
--
ALTER TABLE `datos`
  ADD CONSTRAINT `datos_ibfk_1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`id`);

--
-- Filtros para la tabla `detalle_prenda`
--
ALTER TABLE `detalle_prenda`
  ADD CONSTRAINT `prenda_detalle_ibfk_1` FOREIGN KEY (`idDetalle`) REFERENCES `detalle_produccion` (`id`),
  ADD CONSTRAINT `prenda_detalle_ibfk_2` FOREIGN KEY (`talla`) REFERENCES `talla` (`id`);

--
-- Filtros para la tabla `detalle_produccion`
--
ALTER TABLE `detalle_produccion`
  ADD CONSTRAINT `detalle_produccion_ibfk_1` FOREIGN KEY (`idProduccion`) REFERENCES `produccion` (`id`),
  ADD CONSTRAINT `detalle_produccion_ibfk_2` FOREIGN KEY (`idPrenda`) REFERENCES `prenda` (`id`),
  ADD CONSTRAINT `detalle_produccion_ibfk_3` FOREIGN KEY (`idResponsable`) REFERENCES `talleres` (`id`);

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`id`),
  ADD CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`idPrenda`) REFERENCES `prenda` (`id`),
  ADD CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`idTalla`) REFERENCES `talla` (`id`);

--
-- Filtros para la tabla `informe`
--
ALTER TABLE `informe`
  ADD CONSTRAINT `informe_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `datos` (`id`),
  ADD CONSTRAINT `informe_ibfk_2` FOREIGN KEY (`idDetallePrenda`) REFERENCES `detalle_prenda` (`id`);

--
-- Filtros para la tabla `modelo`
--
ALTER TABLE `modelo`
  ADD CONSTRAINT `modelo_ibfk_1` FOREIGN KEY (`idMaterial`) REFERENCES `material` (`id`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notifiaciones_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `datos` (`id`),
  ADD CONSTRAINT `notifiaciones_ibfk_2` FOREIGN KEY (`remitente`) REFERENCES `datos` (`id`);

--
-- Filtros para la tabla `observacion`
--
ALTER TABLE `observacion`
  ADD CONSTRAINT `observacion_ibfk_1` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`id`);

--
-- Filtros para la tabla `observacion_personal`
--
ALTER TABLE `observacion_personal`
  ADD CONSTRAINT `personal_ibfk_1` FOREIGN KEY (`idPersonal`) REFERENCES `datos` (`id`);

--
-- Filtros para la tabla `prenda`
--
ALTER TABLE `prenda`
  ADD CONSTRAINT `prenda_ibfk_1` FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`id`),
  ADD CONSTRAINT `prenda_ibfk_2` FOREIGN KEY (`idColor`) REFERENCES `color` (`id`);

--
-- Filtros para la tabla `prenda_talla`
--
ALTER TABLE `prenda_talla`
  ADD CONSTRAINT `prenda_talla_ibfk_1` FOREIGN KEY (`idPrenda`) REFERENCES `prenda` (`id`),
  ADD CONSTRAINT `prenda_talla_ibfk_2` FOREIGN KEY (`idTalla`) REFERENCES `talla` (`id`);

--
-- Filtros para la tabla `produccion`
--
ALTER TABLE `produccion`
  ADD CONSTRAINT `produccion_modelo_ibfk_1` FOREIGN KEY (`idModelo`) REFERENCES `modelo` (`id`);

--
-- Filtros para la tabla `rol_config`
--
ALTER TABLE `rol_config`
  ADD CONSTRAINT `rol_config_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `datos` (`id`),
  ADD CONSTRAINT `rol_config_ibfk_2` FOREIGN KEY (`configId`) REFERENCES `configuraciones` (`id`);

--
-- Filtros para la tabla `rol_vistas`
--
ALTER TABLE `rol_vistas`
  ADD CONSTRAINT `rol_vistas_ibfk_1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`id`),
  ADD CONSTRAINT `rol_vistas_ibfk_2` FOREIGN KEY (`idVistas`) REFERENCES `vistas` (`id`);

--
-- Filtros para la tabla `talleres`
--
ALTER TABLE `talleres`
  ADD CONSTRAINT `taller_ibfk_1` FOREIGN KEY (`idEncargado`) REFERENCES `datos` (`id`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`idDatos`) REFERENCES `datos` (`id`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `datos` (`id`);

--
-- Filtros para la tabla `venta_cliente`
--
ALTER TABLE `venta_cliente`
  ADD CONSTRAINT `venta_cliente_ibfk_1` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`id`),
  ADD CONSTRAINT `venta_cliente_ibfk_2` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
