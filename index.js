// Importar las dependencias
const express = require("express");
const mysql = require("mysql2");
const serverless = require("serverless-http"); // Importar serverless-http
const app = express();

// Crear conexión con la base de datos en Amazon RDS
const db = mysql.createConnection({
  host: "testsalonapi.cr2a8g24okao.us-east-1.rds.amazonaws.com",
  user: "root", // Usuario de MySQL
  password: "Albert2004...", // Contraseña de MySQL
  database: "SalonDB", // Nombre de la base de datos correcto
  port: 3306,
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err);
    return;
  }
  console.log("Conexión exitosa con la base de datos MySQL en RDS");
});

// Middleware para manejar datos en formato JSON
app.use(express.json());

// Endpoint para recibir datos y guardarlos en la base de datos
app.post("/api/guardar", (req, res) => {
  const {
    nombre,
    apellido,
    cedula,
    numeroUsuario,
    paquetesDisponibles,
    enTransito,
    enMiami,
  } = req.body;

  // Validar que los campos principales no estén vacíos
  if (!nombre || !apellido || !cedula || !numeroUsuario) {
    return res.status(400).json({
      message:
        "Faltan datos requeridos: nombre, apellido, cédula o número de usuario.",
    });
  }

  // Validar que los campos de paquetes sean números
  if (
    typeof paquetesDisponibles !== "number" ||
    typeof enTransito !== "number" ||
    typeof enMiami !== "number"
  ) {
    return res
      .status(400)
      .json({ message: "Los valores de paquetes deben ser números." });
  }

  // Calcular el total de paquetes
  const totalPaquetes = paquetesDisponibles + enTransito + enMiami;

  // Guardar los datos en la base de datos
  const query = `INSERT INTO usuarios_paquetes (nombre, apellido, cedula, numeroUsuario, paquetesDisponibles, enTransito, enMiami, totalPaquetes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.execute(
    query,
    [
      nombre,
      apellido,
      cedula,
      numeroUsuario,
      paquetesDisponibles,
      enTransito,
      enMiami,
      totalPaquetes,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al insertar datos en la base de datos:", err);
        return res
          .status(500)
          .json({ message: "Error al guardar en la base de datos" });
      }

      // Enviar respuesta de éxito al cliente
      res.json({
        message:
          "Datos recibidos correctamente y almacenados en la base de datos.",
      });
    }
  );
});

// Endpoint para obtener todos los datos de la base de datos
app.get("/api/obtenerDatos", (req, res) => {
  const query = "SELECT * FROM usuarios_paquetes";

  db.execute(query, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de la base de datos:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los datos de la base de datos" });
    }

    // Enviar todos los resultados al cliente
    res.json(results);
  });
});

// Exportar el manejador para Lambda
module.exports.handler = serverless(app); // Convierte la app de Express en un handler de Lambda
