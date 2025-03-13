import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración del servidor
const SERVER_PORT = process.env.PORT || 3000;

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_por_defecto';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Configuración de la base de datos MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth_db';

export default {
  SERVER_PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  MONGO_URI
}; 