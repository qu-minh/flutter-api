import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
import { SetCouplePasswordDto } from './dto/set-couple-password.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';
import { UploadCoupleImageDto } from './dto/upload-couple-image.dto';
import { VerifyCouplePasswordDto } from './dto/verify-couple-password.dto';

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
  async create(@Body() createCoupleDto: CreateCoupleDto, @Req() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }
    const created = await this.coupleService.createCouple(
      createCoupleDto,
      userId,
    );

    return {
      ...created,
      password: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryCoupleDto, @Req() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.findAllCouple(query, userId);
  }

  // Public QR flow (no JWT): access by shareToken
  @Get('share/:token')
  getPublicByShareToken(
    @Param('token') token: string,
    @Headers('x-couple-password') couplePassword?: string,
  ) {
    return this.coupleService.getPublicCoupleByShareToken({
      shareToken: token,
      password: couplePassword,
    });
  }

  @Post('share/:token/verify-password')
  verifyPasswordByShareToken(
    @Param('token') token: string,
    @Body() dto: VerifyCouplePasswordDto,
  ) {
    return this.coupleService.verifyCouplePasswordByShareToken({
      shareToken: token,
      password: dto.password,
    });
  }

  @Patch('share/:token/password')
  setInitialPasswordByShareToken(
    @Param('token') token: string,
    @Body() dto: SetCouplePasswordDto,
    @Headers('x-couple-password') currentPassword?: string,
  ) {
    return this.coupleService.setCouplePasswordByShareToken({
      shareToken: token,
      newPassword: dto.password,
      currentPassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req,
    @Headers('x-couple-password') couplePassword?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.findOne({
      id,
      userId,
      password: couplePassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCoupleDto: UpdateCoupleDto,
    @Req() req,
    @Headers('x-couple-password') couplePassword?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.updateCouple({
      id,
      userId,
      password: couplePassword,
      dto: updateCoupleDto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  setPassword(
    @Param('id') id: string,
    @Body() dto: SetCouplePasswordDto,
    @Req() req,
    @Headers('x-couple-password') currentPassword?: string,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.setCouplePassword({
      coupleId: id,
      userId,
      newPassword: dto.password,
      currentPassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/verify-password')
  verifyPassword(
    @Param('id') id: string,
    @Body() dto: VerifyCouplePasswordDto,
    @Req() req,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.verifyCouplePassword({
      coupleId: id,
      userId,
      password: dto.password,
    });
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
    @Req() req,
    @Headers('x-couple-password') couplePassword: string | undefined,
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
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.uploadCoupleImage({
      coupleId: id,
      kind: dto.kind,
      file,
      userId,
      password: couplePassword,
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
    @Req() req,
    @Headers('x-couple-password') couplePassword: string | undefined,
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

    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    return this.coupleService.uploadCoupleImages({
      coupleId: id,
      files: {
        [CoupleImageKind.MalePartnerAvatar]: male,
        [CoupleImageKind.FemalePartnerAvatar]: female,
        [CoupleImageKind.BackgroundImageUrl]: background,
      },
      userId,
      password: couplePassword,
    });
  }

  @UseGuards(JwtAuthGuard)
  @SkipResponseWrap()
  @Get(':id/image/:kind')
  async getImage(
    @Param('id') id: string,
    @Param('kind', new ParseEnumPipe(CoupleImageKind)) kind: CoupleImageKind,
    @Headers('x-couple-password') couplePassword: string | undefined,
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    const image = await this.coupleService.getCoupleImage({
      coupleId: id,
      kind,
      userId,
      password: couplePassword,
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
