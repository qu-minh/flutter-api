import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { QueryCoupleDto } from './dto/query-couple.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';
import { Couple } from './entities/couple.entity';

@Injectable()
export class CoupleService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
  ) {}

  async createCouple(dto: CreateCoupleDto, userId: string) {
    const couple = this.coupleRepository.create({
      ...dto,
      date: dto.date ? new Date(dto.date) : undefined,
      malePartnerAvatar: dto.malePartnerAvatar,
      birthDayMalePartner: dto.birthDayMalePartner
        ? new Date(dto.birthDayMalePartner)
        : undefined,
      femalePartnerAvatar: dto.femalePartnerAvatar,
      birthDayFemalePartner: dto.birthDayFemalePartner
        ? new Date(dto.birthDayFemalePartner)
        : undefined,
      backgroundImageUrl: dto.backgroundImageUrl,
      createdByUserId: userId,
    });

    return this.coupleRepository.save(couple);
  }

  async findAllCouple(query: QueryCoupleDto): Promise<{
    items: Couple[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const q = query?.q;

    const skip = (page - 1) * limit;

    const where = q
      ? [
          { malePartnerName: ILike(`%${q}%`) },
          { femalePartnerName: ILike(`%${q}%`) },
        ]
      : undefined;

    const [items, total] = await this.coupleRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { date: 'DESC' },
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
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
