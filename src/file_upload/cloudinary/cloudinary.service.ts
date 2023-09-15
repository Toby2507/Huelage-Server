import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as toStream from 'buffer-to-stream';

import { FileUploadService } from '../file_upload.interface';
import { File } from '../../common/interfaces/file.interface';

@Injectable()
export class CloudinaryService extends FileUploadService {
  async uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImages(files: File[]) {
    const urls = await Promise.all(
      files.map(async (file): Promise<string> => {
        return await this.uploadImage(file);
      }),
    );
    return urls;
  }
}
