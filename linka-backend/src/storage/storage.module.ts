import { Module, Global } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Global()
@Module({
  providers: [
    {
      provide: 'STORAGE',
      useFactory: () => {
        return new Storage({
          keyFilename: 'src/config/bigquery-service-account.json', // mismo service account
          projectId: 'converso-346218',
        });
      },
    },
    {
      provide: 'BUCKET_NAME',
      useValue: 'videos_example_converso', // 👈 tu bucket
    },
  ],
  exports: ['STORAGE', 'BUCKET_NAME'],
})
export class StorageModule {}
