import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt/jwt-auth.guard';
import { CoupleService } from './couple.service';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { QueryCoupleDto } from './dto/query-couple.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coupleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoupleDto: UpdateCoupleDto) {
    return this.coupleService.update(+id, updateCoupleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coupleService.remove(+id);
  }
}
