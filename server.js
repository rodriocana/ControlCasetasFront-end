const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuración de la base de datos
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '', // Cambia esto por tu contraseña
  database: 'casetas',
});

// Middleware
app.use(cors());
app.use(express.json());

// Ruta para obtener socios
app.get('/socios', (req, res) => {
  const query = 'SELECT * FROM socios';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener socios' });
    } else {
      res.json(results);
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
