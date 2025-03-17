declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
  }
}

// Definiciones de tipo para el usuario en la request
declare namespace Express {
  export interface Request {
    user?: {
      id: string;
    };
  }
} 