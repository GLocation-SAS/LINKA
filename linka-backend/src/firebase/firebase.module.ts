import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: () => {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (!credentialsPath) {
          throw new Error('❌ Falta GOOGLE_APPLICATION_CREDENTIALS en el .env');
        }

        const fullPath = path.resolve(process.cwd(), credentialsPath);

        return admin.initializeApp({
          credential: admin.credential.cert(require(fullPath)),
        });
      },
    },
  ],
  exports: ['FIREBASE_APP'],
})
export class FirebaseModule {}
