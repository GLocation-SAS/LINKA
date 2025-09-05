import { Module, Global } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';

@Global()
@Module({
  providers: [
    {
      provide: 'BIGQUERY',
      useFactory: () => {
        return new BigQuery({
          keyFilename: 'src/config/bigquery-service-account.json',
          projectId: 'converso-346218', // cambia esto por tu projectId de Google Cloud
        });
      },
    },
  ],
  exports: ['BIGQUERY'],
})
export class BigqueryModule {}
