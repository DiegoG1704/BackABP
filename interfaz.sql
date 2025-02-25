-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-02-2025 a las 17:38:02
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `interfaz`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `afiliados`
--

CREATE TABLE `afiliados` (
  `id` int(11) NOT NULL,
  `dni` int(11) DEFAULT NULL,
  `ruc` varchar(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `fechaAfiliacion` datetime DEFAULT current_timestamp(),
  `direccion` varchar(100) DEFAULT NULL,
  `distritoId` int(11) DEFAULT NULL,
  `nombreBodega` varchar(50) DEFAULT NULL,
  `estadoSocio` enum('1','2','3') DEFAULT '1',
  `metodoAfiliacion` int(11) DEFAULT NULL,
  `estadoWhatsapp` enum('1','2','3') DEFAULT NULL,
  `estadoGrupo` int(11) DEFAULT NULL,
  `referencia` varchar(200) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `observaciones` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `distrito`
--

CREATE TABLE `distrito` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `distrito`
--

INSERT INTO `distrito` (`id`, `nombre`) VALUES
(1, 'Barranco'),
(2, 'Breña'),
(3, 'Cercado de Lima'),
(4, 'Chorrillos'),
(5, 'Comas'),
(6, 'El Agustino'),
(7, 'Jesús María'),
(8, 'La Molina'),
(9, 'La Victoria'),
(10, 'Lince'),
(11, 'Los Olivos'),
(12, 'Magdalena del Mar'),
(13, 'Miraflores'),
(14, 'Pueblo Libre'),
(15, 'San Bartolo'),
(16, 'San Isidro'),
(17, 'San Juan de Lurigancho'),
(18, 'San Juan de Miraflores'),
(19, 'San Luis'),
(20, 'San Martín de Porres'),
(21, 'San Miguel'),
(22, 'Santiago de Surco'),
(23, 'Surquillo'),
(24, 'Villa El Salvador'),
(25, 'Villa María del Triunfo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fechapago`
--

CREATE TABLE `fechapago` (
  `id` int(11) NOT NULL,
  `fecha` date DEFAULT current_timestamp(),
  `afiliadoId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grupo`
--

CREATE TABLE `grupo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grupo`
--

INSERT INTO `grupo` (`id`, `nombre`) VALUES
(1, 'ninguno'),
(2, 'Lima Norte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodoafiliacion`
--

CREATE TABLE `metodoafiliacion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodoafiliacion`
--

INSERT INTO `metodoafiliacion` (`id`, `nombre`) VALUES
(1, 'ninguno'),
(2, 'Evento'),
(3, 'Redes Sociales');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `telefono`
--

CREATE TABLE `telefono` (
  `id` int(11) NOT NULL,
  `numero` varchar(50) DEFAULT NULL,
  `afiliadoId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `usuario` varchar(50) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido`, `usuario`, `contraseña`) VALUES
(1, 'Admin', 'Admin', 'Admin123', 'Admin123');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `afiliados`
--
ALTER TABLE `afiliados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `distritoId` (`distritoId`),
  ADD KEY `metodoAfiliacion` (`metodoAfiliacion`),
  ADD KEY `estadoGrupo` (`estadoGrupo`);

--
-- Indices de la tabla `distrito`
--
ALTER TABLE `distrito`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `fechapago`
--
ALTER TABLE `fechapago`
  ADD PRIMARY KEY (`id`),
  ADD KEY `afiliadoId` (`afiliadoId`);

--
-- Indices de la tabla `grupo`
--
ALTER TABLE `grupo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `metodoafiliacion`
--
ALTER TABLE `metodoafiliacion`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `telefono`
--
ALTER TABLE `telefono`
  ADD PRIMARY KEY (`id`),
  ADD KEY `afiliadoId` (`afiliadoId`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `afiliados`
--
ALTER TABLE `afiliados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `distrito`
--
ALTER TABLE `distrito`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `fechapago`
--
ALTER TABLE `fechapago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `grupo`
--
ALTER TABLE `grupo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `metodoafiliacion`
--
ALTER TABLE `metodoafiliacion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `telefono`
--
ALTER TABLE `telefono`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `afiliados`
--
ALTER TABLE `afiliados`
  ADD CONSTRAINT `afiliados_ibfk_1` FOREIGN KEY (`distritoId`) REFERENCES `distrito` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `afiliados_ibfk_2` FOREIGN KEY (`metodoAfiliacion`) REFERENCES `metodoafiliacion` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `afiliados_ibfk_3` FOREIGN KEY (`estadoGrupo`) REFERENCES `grupo` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `fechapago`
--
ALTER TABLE `fechapago`
  ADD CONSTRAINT `fechapago_ibfk_1` FOREIGN KEY (`afiliadoId`) REFERENCES `afiliados` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `telefono`
--
ALTER TABLE `telefono`
  ADD CONSTRAINT `telefono_ibfk_1` FOREIGN KEY (`afiliadoId`) REFERENCES `afiliados` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
