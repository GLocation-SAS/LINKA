import { Injectable } from '@nestjs/common';
import { GoogleAuth } from 'google-auth-library';

@Injectable()
export class AuthService {
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth();
  }

  async generateIdToken(targetUrl: string): Promise<string> {
    try {
      const client = await this.auth.getIdTokenClient(targetUrl);
      const token = await client.idTokenProvider.fetchIdToken(targetUrl);
      return token;
    } catch (error) {
      console.error('Error al generar token:', error);
      throw new Error('No se pudo generar el token');
    }
  }
}
