import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private s3: S3Client;
  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException('Missing AWS configuration');
    }

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async validateFileExists(fileUrl: string): Promise<boolean> {
    try {
      const urlParts = fileUrl.split('.com/');
      const key = urlParts[1];
      const bucket = this.configService.get<string>('AWS_S3_BUCKET');

      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3.send(command);
      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw new InternalServerErrorException('Error checking S3 file: ', error);
    }
  }

  async getPresignedUrl(filename: string, fileType: string, userId: string) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    if (!bucket) {
      throw new InternalServerErrorException('AWS S3 bucket not configured');
    }
    const key = `listings/${userId}/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(filename)}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60, // URL expiration time is 60 seconds
    });

    const fileUrl = `https://${bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl };
  }

  async uploadImages(images: Express.Multer.File[], userId: string) {
    if (!images || images.length === 0) {
      throw new InternalServerErrorException('No images provided for upload');
    }
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    if (!bucket) {
      throw new InternalServerErrorException('AWS S3 bucket not configured');
    }

    const uploadResults = images.map(async (image) => {
      const key = `listings/${userId}/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(image.originalname)}`;
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: image.buffer,
        ContentType: image.mimetype,
      });

      try {
        await this.s3.send(command);
        return `https://${bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${key}`;
      } catch (err) {
        throw new InternalServerErrorException('Failed to upload image', err);
      }
    });

    return Promise.all(uploadResults);
  }
}
