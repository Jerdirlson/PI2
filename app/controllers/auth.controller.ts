import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import config from '../config/config';

/**
 * Registrar un nuevo usuario
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado',
      });
    }

    // Crear nuevo usuario
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generar token
    const token = generateToken(user._id.toString());

    // Responder con el usuario y token (sin incluir la contraseña)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

/**
 * Iniciar sesión de usuario
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verificar que se proporcionaron email y contraseña
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y contraseña',
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email }).select('+password');
    
    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = generateToken(user._id.toString());

    // Responder con el usuario y token
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

/**
 * Obtener datos del usuario actual
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del usuario',
      error: error.message,
    });
  }
};

/**
 * Generar JWT
 */
const generateToken = (id: string): string => {
  return jwt.sign({ id }, config.JWT_SECRET as jwt.Secret, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}; 