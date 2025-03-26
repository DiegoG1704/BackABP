const express = require('express');
const { engine } = require('express-handlebars');
const morgan = require('morgan');
const path = require('path');
const { join, dirname } = path; // No hace falta calcular __dirname, ya está disponible
const usuarios = require('./routes/routes.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const app = express();
// const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();
const corsOptions = {
    origin: ['https://massalud.org.pe', 'http://localhost:3000','https://dniruc.apisperu.com','https://test.massalud.org.pe',"https://www.massalud.org.pe","http://localhost:5173"], // Orígenes permitidos
    methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE','PATCH'], // Métodos HTTP permitidos
    credentials: true, // Permite enviar cookies y encabezados de autorización
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejo de preflight
app.set('views', join(__dirname, 'views'));
app.engine('hbs', engine({
    defaultLayout: 'main',
    layoutsDir: join(app.get('views'), 'layouts'),
    partialsDir: join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Configurar la carpeta uploads como estática
app.use('/FilePdf', express.static(path.join(__dirname, '../FilePdf')));
app.use('/uploads', express.static('uploads'));

// Rutas
app.get('/', async (req, res) => {
    res.status(200).json({ message: 'hello world' });
});

app.use(usuarios);

// Estática
app.use(express.static(join(__dirname, 'public')));

module.exports = app;

