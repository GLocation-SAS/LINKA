import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthGuard implements CanActivate {
  private client = new OAuth2Client();

  // IDs válidos (ajusta según tu proyecto y frontend)
  private VALID_AUDIENCES = [
    '889141235256-1crjojfll6tmocs9jfgctudu0lvq49a6.apps.googleusercontent.com',
    'https://linka-backend-460321220051.us-central1.run.app' // tu Client ID de OAuth2 (frontend)
  ];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de autorización');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.VALID_AUDIENCES,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Token inválido');
      }

      // 👉 Guardamos el usuario en la request para usarlo en los controllers
      request.user = {
        uid: payload.sub,
        email: payload.email,
        name: payload.name,
      };

      return true;
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw new UnauthorizedException('Token inválido');
    }
  }
}
