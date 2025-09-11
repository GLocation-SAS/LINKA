import { Inject, Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class UploadsService {
    constructor(
        @Inject('STORAGE') private readonly storage: Storage,
        @Inject('BUCKET_NAME') private readonly bucketName: string,
    ) { }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);

        const blob = bucket.file(`${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype,
        });

        return new Promise<string>((resolve, reject) => {
            blobStream.on('error', (err) => reject(err));
            blobStream.on('finish', async () => {
                const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${blob.name}`;
                resolve(publicUrl);
            });

            blobStream.end(file.buffer);
        });
    }

    async generateSignedUrl(
        fileName: string,
        contentType: string,
        expiresInMinutes = 527040,
    ): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(fileName);

        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + expiresInMinutes * 60 * 1000, // Ej: 15 minutos
            contentType,
        });

        return url;
    }
}
