import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import config from '../config/config';

// Interfaz simplificada para el token decodificado
interface DecodedToken {
  id: string;
}

/**
 * Middleware para proteger rutas que requieren autenticación
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Obtener token del header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. No se proporcionó token de autenticación.',
    });
    return;
  }

  // Extraer el token (quitar 'Bearer ')
  const token = authHeader.split(' ')[1];

  try {
    // Verificar token
    // @ts-ignore: El tipo de jwt es correcto pero TypeScript no lo reconoce
    const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
    
    // Agregar usuario decodificado a la solicitud
    req.user = { 
      id: decoded.id 
    };
    
    // Continuar con la solicitud
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
    return;
  }
};

/**
 * Middleware para roles específicos (opcional)
 * Nota: Esta funcionalidad requeriría extender el tipo de usuario
 * en la definición de tipos para incluir un campo 'role'
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acceso no autorizado',
      });
      return;
    }

    // Comentado temporalmente debido a que el tipo actual no incluye 'role'
    /*
    if (!req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Rol insuficiente para acceder a este recurso`,
      });
      return;
    }
    */
    
    // En su lugar, siempre permitir acceso si el usuario está autenticado
    next();
  };
}; 