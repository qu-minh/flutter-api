import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { SkipResponseWrap } from 'src/common/decorators/skip-response-wrap.decorator';
import { CoupleImageKind } from 'src/common/enums';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { CoupleService } from './couple.service';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { QueryCoupleDto } from './dto/query-couple.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';
import { UploadCoupleImageDto } from './dto/upload-couple-image.dto';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  private validateImageFile(file?: Express.Multer.File) {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ ảnh jpeg/png/webp.');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCoupleDto: CreateCoupleDto, @Req() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }
    return this.coupleService.createCouple(createCoupleDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryCoupleDto) {
    return this.coupleService.findAllCouple(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coupleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoupleDto: UpdateCoupleDto) {
    return this.coupleService.updateCouple(id, updateCoupleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadImage(
    @Param('id') id: string,
    @Body() dto: UploadCoupleImageDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
  ) {
    return this.coupleService.uploadCoupleImage({
      coupleId: id,
      kind: dto.kind,
      file,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'malePartnerAvatar', maxCount: 1 },
        { name: 'femalePartnerAvatar', maxCount: 1 },
        { name: 'backgroundImageUrl', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      malePartnerAvatar?: Express.Multer.File[];
      femalePartnerAvatar?: Express.Multer.File[];
      backgroundImageUrl?: Express.Multer.File[];
    },
  ) {
    const male = files?.malePartnerAvatar?.[0];
    const female = files?.femalePartnerAvatar?.[0];
    const background = files?.backgroundImageUrl?.[0];

    if (!male && !female && !background) {
      throw new BadRequestException('Vui lòng upload ít nhất 1 ảnh.');
    }

    this.validateImageFile(male);
    this.validateImageFile(female);
    this.validateImageFile(background);

    return this.coupleService.uploadCoupleImages({
      coupleId: id,
      files: {
        [CoupleImageKind.MalePartnerAvatar]: male,
        [CoupleImageKind.FemalePartnerAvatar]: female,
        [CoupleImageKind.BackgroundImageUrl]: background,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @SkipResponseWrap()
  @Get(':id/image/:kind')
  async getImage(
    @Param('id') id: string,
    @Param('kind', new ParseEnumPipe(CoupleImageKind)) kind: CoupleImageKind,
    @Res({ passthrough: true }) res: Response,
  ) {
    const image = await this.coupleService.getCoupleImage({
      coupleId: id,
      kind,
    });

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(image.originalName)}"`,
    );
    res.setHeader('Cache-Control', 'private, max-age=3600');

    return new StreamableFile(image.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coupleService.remove(+id);
  }
}
