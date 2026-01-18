import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoupleService } from './couple.service';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';

@Controller('couple')
export class CoupleController {
  constructor(private readonly coupleService: CoupleService) {}

  @Post()
  create(@Body() createCoupleDto: CreateCoupleDto) {
    return this.coupleService.create(createCoupleDto);
  }

  @Get()
  findAll() {
    return this.coupleService.findAll();
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
