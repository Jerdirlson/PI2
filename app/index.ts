import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import config from './config/config';

// Importar rutas
import authRoutes from './routes/auth.routes';

// Inicializar la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos MongoDB
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida');
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB', err);
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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
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
});

export default app;
