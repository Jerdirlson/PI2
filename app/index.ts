import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import config from './config/config';
import { connectToMemoryDB } from './config/mongo-memory';
import authRoutes from './routes/auth.routes';

// Inicializar la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para loguear todas las peticiones
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url} - Cuerpo:`, req.body);
  next();
});

// Conectar a la base de datos MongoDB (local o en memoria)
const connectToDB = async () => {
  try {
    // Intenta conectar a MongoDB local
    console.log('Intentando conectar a MongoDB local...');
    await mongoose.connect(config.MONGO_URI);
    console.log('Conexión a MongoDB local establecida');
  } catch (localErr: any) {
    console.error('Error al conectar a MongoDB local:', localErr.message);
    
    try {
      console.log('Intentando conectar a MongoDB en memoria...');
      // Si falla, usa MongoDB en memoria
      await connectToMemoryDB();
    } catch (memErr) {
      console.error('Error al conectar a MongoDB en memoria:', memErr);
      process.exit(1);
    }
  }
};

// Ejecutar la conexión a la base de datos
connectToDB().catch(err => {
  console.error('Error fatal al conectar a cualquier base de datos:', err);
  process.exit(1);
});

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API funcionando correctamente',
  });
});

// Middleware para manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error del servidor:', err);
  
  // Devolver información detallada sobre el error (solo en desarrollo)
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? 'Error interno' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Middleware para rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Iniciar el servidor
const PORT = config.SERVER_PORT;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`API disponible en: http://localhost:${PORT}`);
});

export default app;
