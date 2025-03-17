import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const connectToMemoryDB = async (): Promise<void> => {
  // Crear una instancia de MongoDB en memoria
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  console.log('Conectando a MongoDB en memoria...');
  
  try {
    await mongoose.connect(uri);
    console.log('Conexión a MongoDB en memoria establecida');
    
    // Crear algunos datos de prueba si es necesario
    // await seedDatabase();
    
  } catch (error) {
    console.error('Error al conectar a MongoDB en memoria:', error);
    throw error;
  }
};

export const disconnectMemoryDB = async (): Promise<void> => {
  if (mongoServer) {
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('MongoDB en memoria detenido');
  }
};

export default { connectToMemoryDB, disconnectMemoryDB }; 