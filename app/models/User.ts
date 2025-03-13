import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// Definir la interfaz para el documento de usuario
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Definir el esquema de usuario
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nombre es requerido'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido'],
    },
    password: {
      type: String,
      required: [true, 'Contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pre-save para hashear la contraseña
UserSchema.pre<IUser>('save', async function (next) {
  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified('password')) return next();

  try {
    // Generar un salt
    const salt = await bcrypt.genSalt(10);
    // Hashear la contraseña con el salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Crear y exportar el modelo de usuario
export default mongoose.model<IUser>('User', UserSchema); 