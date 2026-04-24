const queryPrenda = `
        SELECT 
            a.id,
            a.nombre,
            c.nombre AS color,
            a.genero,
            a.idModelo,
            a.stock,
            m.precioU,
            m.precioM
        FROM 
            prenda a
        JOIN
            color c ON a.idColor = c.id
        JOIN
            modelo m ON m.id = a.idModelo
    `;

const queryclientes = `
    SELECT * FROM cliente
`

const queryPrendaId = `
    SELECT 
        a.id,
        a.nombre,
        c.nombre AS color,
        a.genero,
        a.idModelo,
        a.stock,
        m.precioU,
        m.precioM
    FROM 
        prenda a
    JOIN
        color c ON a.idColor = c.id
    LEFT JOIN
        modelo m ON m.id = a.idModelo
    WHERE
        a.idModelo = ?
  `;

const queryTallas = `
    SELECT
        t.id,
        t.nombre as talla,
        pt.cantidad
    FROM
        prenda_talla pt
    JOIN
        talla t ON pt.idTalla = t.id
    WHERE
        pt.idPrenda = ?
  `;

const queryRol = `
    SELECT 
        r.id AS rolId,
        r.nombre AS rolNombre,
        v.id AS vistaId,
        v.nombre AS vistaNombre
    FROM rol r
    JOIN rol_vistas rv ON r.id = rv.idRol
    JOIN vistas v ON v.id = rv.idVistas
    ORDER BY r.id
    `;

const queryPersonal = `
    SELECT 
        p.id,
        p.nombres,
        p.dni,
        r.nombre AS rol,
        p.estado,
        DATE_FORMAT(p.fecha,'%d-%m-%Y') AS fecha,
        u.usuario,
        u.contraseña,
        CONCAT(p.nombres, ' - ', r.nombre) AS nombre_rol
    FROM usuario u
    JOIN datos p ON p.id = u.idDatos
    JOIN rol r ON p.idRol = r.id
`;

const queryModelo=`
    SELECT 
        a.id,
        a.nombre,
        a.precioU,
        a.precioM,
        m.nombre AS material
    FROM   
        modelo a
    JOIN
        material m ON a.idMaterial = m.id
    `;

const queryColor=`SELECT * FROM color`

const queryTalla=`SELECT * FROM talla`

const queryMaterial=`SELECT * FROM material`

const queryRutas=`SELECT * FROM vistas`

const queryTaller = `
    SELECT 
        t.id,
        d.id AS idEncargado,
        t.nombre AS nombre_taller,
        t.direccion,
        d.dni,
        d.nombres AS nombre_encargado,
        d.telefono,
        r.nombre AS rol,
        d.estado,
        DATE_FORMAT(d.fecha,'%d-%m-%Y') AS fecha
    FROM talleres t
    JOIN datos d ON d.id = t.idEncargado
    JOIN rol r ON r.id = d.idRol
`;

const queryProduccion = `
    SELECT 
        p.id AS idProduccion,
        p.codigo AS codigoProduccion,
        DATE_FORMAT(p.fecha_inicio, '%d-%m-%Y') AS fecha,
        p.estado,
        p.area,
        SUM(d.cantidad) AS cantidad,
        m.nombre AS nombreModelo,
        COUNT(d.id) AS totalDetalles
    FROM 
        produccion p
    LEFT JOIN 
        detalle_produccion d ON d.idProduccion = p.id
    LEFT JOIN 
        modelo m ON m.id = p.idModelo
    GROUP BY 
        p.id, p.codigo, p.fecha_inicio, p.estado, p.area, m.nombre
    ORDER BY 
        p.fecha_inicio DESC;
    `

const queryDetalleProduccion = `
    SELECT 
        d.id,
        p.nombre AS nombrePrenda,
        t.nombre AS nombreTaller,
        p.id AS idPrenda,
        d.cantidad,
        d.cantidadExt,
        d.cantidadTotal,
        tl.nombre AS talla,
        dp.cantidad,
        dp.idProduccion,
        dp.id AS idDetalle
    FROM
        detalle_prenda d
    LEFT JOIN
        detalle_produccion dp ON dp.id = d.idDetalle
    LEFT JOIN
        prenda p ON p.id = dp.idPrenda
    LEFT JOIN
        talleres t ON t.id = dp.idResponsable
    LEFT JOIN
        talla tl ON tl.id = d.talla
    WHERE
        dp.idProduccion = ?
`

const queryInformesPrendas = `
    SELECT 
        d.id,
        p.nombre AS nombrePrenda,
        t.nombre AS nombreTaller,
        t.direccion,
        pd.codigo,
        pd.id AS idProduccion,
        DATE_FORMAT(pd.fecha_inicio, '%d-%m-%Y') AS fechaInicio,
        pd.area,
        pd.estado,
        p.id AS idPrenda,
        d.cantidad,
        d.cantidadExt,
        tl.nombre AS talla,
        tl.id AS tallaId,
        dp.id AS idDetalle,
        d.cantidadTotal,
        i.estadoinforme,
        i.cantidad AS cantInfor,
        i.cantMerma,
        i.id AS idInforme
    FROM
        detalle_prenda d
    LEFT JOIN
        detalle_produccion dp ON dp.id = d.idDetalle
    LEFT JOIN
        prenda p ON p.id = dp.idPrenda
    LEFT JOIN
        talleres t ON t.id = dp.idResponsable
    LEFT JOIN
        produccion pd ON pd.id = dp.idProduccion
    LEFT JOIN
        informe i ON i.idDetallePrenda = d.id
    LEFT JOIN
        talla tl ON tl.id = d.talla
    WHERE
        pd.estado = 2 AND dp.idProduccion=? AND i.area =?
`

const queryDetallePrenda = `
    SELECT 
        d.id,
        p.id AS idPrenda,
        p.nombre AS nombrePrenda,
        t.nombre AS nombreTaller,
        d.cantidad,
        d.cantidadExt,
        d.talla,
        d.cantidadTotal
    FROM
        detalle_prenda d
    LEFT JOIN
        detalle_produccion dp ON dp.id = d.idDetalle
    LEFT JOIN
        prenda p ON p.id = dp.idPrenda
    LEFT JOIN
        talleres t ON t.id = dp.idResponsable
    WHERE
        d.id=?
`

const queryMe =`
    SELECT
        d.id,
        d.nombres,
        d.estado,
        d.telefono,
        d.dni,
        d.idRol,
        d.correo,
        d.fotoPerfil,
        r.nombre AS rol,
        rc.estado AS estadoModo,
        t.id As tallerId,
        t.nombre AS nombreTaller,
        t.imagen AS imagenTaller,
        t.direccion,
        t.ruc
    FROM
        usuario u
    LEFT JOIN
        datos d ON d.id = u.idDatos
    LEFT JOIN
        rol r ON r.id = d.idRol
    LEFT JOIN
        rol_config rc ON rc.userId = d.id
    LEFT JOIN
        talleres t ON t.idEncargado = d.id
    WHERE
        u.id=?
`;

const queryRutasUser =`
    SELECT
        v.nombre,
        v.ruta,
        v.icono
    FROM
        rol_vistas rv
    LEFT JOIN
        rol r ON r.id = rv.idRol
    LEFT JOIN
        vistas v ON v.id = rv.idVistas
    WHERE
        rv.idRol = ?
`

const queryInformPren = 'SELECT * FROM informe WHERE idDetallePrenda =?'

module.exports={
    queryPrenda,queryPrendaId,queryTallas,queryModelo,queryColor,queryTalla,queryMaterial,queryRutas,queryRol,queryPersonal,
    queryTaller,queryProduccion,queryDetalleProduccion,queryDetallePrenda,queryInformesPrendas,queryMe,queryRutasUser,
    queryInformPren,queryclientes
}