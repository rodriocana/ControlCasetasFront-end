const mysql = require('mysql2');  // Usamos el cliente mysql2

const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.168.210.102',  // Dirección de tu base de datos
  user: process.env.DB_USER || 'caseta_lama',      // Usuario de la base de datos
  password: process.env.DB_PASS || 'caseta_lama',  // Contraseña de la base de datos
  database: process.env.DB_NAME || 'caseta_lama',  // Nombre de la base de datos
  port: process.env.DB_PORT || 3306,                // Puerto de conexión, por defecto es 3306
  connectionLimit: 5,                               // Límite de conexiones simultáneas
  acquireTimeout: 5000                              // Tiempo máximo de espera para obtener una conexión
});

// Función que maneja la solicitud
module.exports = async (req, res) => {
  // Consulta de registros
  if (req.url.includes('/api/getRecords')) {
    pool.query('SELECT * FROM registros', (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error de la base de datos", error: err });
      }
      return res.status(200).json(results);  // Devuelve los registros obtenidos de la base de datos
    });
  }

  // Consulta de socios
  if (req.url.includes('/api/socios')) {
    const query = `
      SELECT
        socios.idsocio,
        socios.nombre,
        socios.apellido,
        socios.telefono,
        socios.direccion,
        socios.email,
        socios.invitaciones,
        socios.poblacion,
        socios.dni
      FROM
        socios
    `;

    pool.query(query, (err, rows) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res.status(500).json({ error: 'Error al obtener los socios' });
      }

      return res.status(200).json(rows);  // Enviar los datos de los socios como JSON
    });
  }
};
