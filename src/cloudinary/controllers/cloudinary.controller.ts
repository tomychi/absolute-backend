import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload-image/:folderName')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @Param('folderName') folderName: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.cloudinaryService.uploadImage(file, folderName);
  }
}
