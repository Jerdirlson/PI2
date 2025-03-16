import mongoose from 'mongoose';
import User from './models/User'; // Importa otros modelos aquí
import config from './config/config';

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Insertar un usuario de ejemplo
    await User.create({
      name: "Juan",
      email: "juan@example.com",
      password: "contraseña123",
    });

    // Insertar otros datos de prueba aquí

    console.log('Datos insertados correctamente');
    process.exit();
  } catch (error) {
    console.error('Error insertando datos', error);
    process.exit(1);
  }
};

connectDB().then(seedData); 