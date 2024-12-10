const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/route.js');
const nodemallier = require ('nodemailer')

require('dotenv').config();

const app = express();

// Middleware
app.use(cors(
    {origin:'http://localhost:5173',

    }
));



app.use(express.json());

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api', userRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5006;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));



















