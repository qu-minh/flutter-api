import { Injectable } from '@nestjs/common';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';
import { Couple } from './entities/couple.entity';

@Injectable()
export class CoupleService {
  async create(createCoupleDto: CreateCoupleDto): Promise<Couple> {
    // return Couple.create(createCoupleDto).save();
    return {} as Couple;
  }

  findAll() {
    return `This action returns all couple`;
  }

  findOne(id: number) {
    return `This action returns a #${id} couple`;
  }

  update(id: number, updateCoupleDto: UpdateCoupleDto) {
    return `This action updates a #${id} couple`;
  }

  remove(id: number) {
    return `This action removes a #${id} couple`;
  }
}
