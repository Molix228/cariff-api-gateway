import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOrServiceTokenGuard } from 'src/auth/guards/api-or-service-token.guard';

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

@ApiTags('Images Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // axios.get('https://localhost:3000/api/upload/presigned?filename=test.jpg&fileType=image/jpeg')
  //returns filename: string, fileType: string
  @ApiOperation({
    summary: 'Get presigned URL for file upload',
    description:
      'Generates a presigned URL for uploading files to cloud storage',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully.',
    type: Object,
  })
  @UseGuards(JwtAuthGuard)
  @Get('presigned')
  async getPresignedUrl(
    @Req() req,
    @Query('filename') filename: string,
    @Query('fileType') fileType: string,
  ) {
    return this.uploadService.getPresignedUrl(
      filename,
      fileType,
      req.user.userId,
    );
  }

  @ApiOperation({
    summary: 'Upload images',
    description: 'Uploads images to cloud storage',
  })
  @ApiQuery({
    name: 'files',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Array of image files to upload',
  })
  @ApiOkResponse({ description: 'Images uploaded successfully.' })
  @UseGuards(ApiOrServiceTokenGuard)
  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@Req() req, @UploadedFiles() files: Express.Multer.File[]) {
    const userId = req.user ? req.user.userId : SYSTEM_USER_ID;
    return this.uploadService.uploadImages(files, userId);
  }
}
