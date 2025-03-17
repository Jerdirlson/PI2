import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import config from '../config/config';
import User from '../models/User';

// Interfaz para información de usuario en respuestas
interface UserResponse {
  id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

/**
 * Registrar un nuevo usuario
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Iniciando registro de usuario ===');
    const { name, email, password } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !password) {
      console.log('Error de validación: Campos requeridos faltantes');
      res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos (nombre, email, contraseña)',
      });
      return;
    }

    console.log(`Datos recibidos: nombre=${name}, email=${email}, password=****`);

    // Verificar si el usuario ya existe
    console.log('Verificando si el usuario ya existe...');
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      console.log(`Usuario con email ${email} ya existe`);
      res.status(400).json({
        success: false,
        message: 'Este email ya está registrado',
      });
      return;
    }

    // Crear nuevo usuario
    console.log('Creando nuevo usuario...');
    const user = await User.create({
      name,
      email,
      password,
    });

    // Asegurar que _id esté definido
    const userId = user._id as mongoose.Types.ObjectId;
    console.log(`Usuario creado con ID: ${userId}`);

    // Generar token
    console.log('Generando token JWT...');
    const token = generateToken(userId.toString());

    // Responder con el usuario y token (sin incluir la contraseña)
    console.log('Registro completado exitosamente');
    const userResponse: UserResponse = {
      id: userId,
      name: user.name,
      email: user.email
    };
    
    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};

/**
 * Iniciar sesión de usuario
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Iniciando proceso de login ===');
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Error de validación: Email o contraseña no proporcionados');
      res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña',
      });
      return;
    }

    console.log(`Intentando login con email: ${email}`);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`Usuario con email ${email} no encontrado`);
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    console.log('Verificando contraseña...');
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Contraseña incorrecta');
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
      return;
    }

    console.log('Login exitoso, generando token...');
    const userId = user._id as mongoose.Types.ObjectId;
    const token = generateToken(userId.toString());

    console.log(`Usuario ${user.name} (${user.email}) autenticado correctamente`);
    
    const userResponse: UserResponse = {
      id: userId,
      name: user.name,
      email: user.email
    };
    
    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};

/**
 * Obtener datos del usuario actual
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Obteniendo datos de usuario ===');
    
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: 'No autorizado',
      });
      return;
    }
    
    console.log(`ID de usuario: ${req.user.id}`);
    const user = await User.findById(req.user.id);

    if (!user) {
      console.log(`Usuario con ID ${req.user.id} no encontrado`);
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    console.log(`Datos de usuario ${user.name} obtenidos correctamente`);
    
    const userResponse: UserResponse = {
      id: user._id as mongoose.Types.ObjectId,
      name: user.name,
      email: user.email
    };
    
    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
      },
    });
  } catch (error: any) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};

/**
 * Generar JWT
 */
const generateToken = (id: string): string => {
  const secretKey = config.JWT_SECRET;
  if (!secretKey) {
    throw new Error('JWT_SECRET no está definido');
  }
  
  // @ts-ignore: El tipo de jwt es correcto pero TypeScript no lo reconoce
  return jwt.sign({ id }, secretKey, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}; 