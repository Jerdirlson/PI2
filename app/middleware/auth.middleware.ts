import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Obtener token del header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. No se proporcionó token de autenticación.',
    });
  }

  // Extraer el token (quitar 'Bearer ')
  const token = authHeader.split(' ')[1];

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Agregar usuario decodificado a la solicitud
    req.user = decoded;
    
    // Continuar con la solicitud
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};

/**
 * Middleware para roles específicos (opcional)
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.role} no tiene permiso para acceder a este recurso`,
      });
    }
    
    next();
  };
}; 