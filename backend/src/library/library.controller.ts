import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findAll(@Query('studentId') studentId?: string) {
    return this.libraryService.findAll(studentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryService.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/library',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: any) {
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Post()
  create(@Body() data: any) {
    return this.libraryService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.libraryService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryService.delete(id);
  }

  @Get(':id/permissions')
  getPermissions(@Param('id') id: string) {
    return this.libraryService.getPermissions(id);
  }

  @Post(':id/permissions')
  addPermission(@Param('id') id: string, @Body('programId') programId: string) {
    return this.libraryService.addPermission(id, programId);
  }

  @Delete(':id/permissions/:programId')
  removePermission(@Param('id') id: string, @Param('programId') programId: string) {
    return this.libraryService.removePermission(id, programId);
  }
}
