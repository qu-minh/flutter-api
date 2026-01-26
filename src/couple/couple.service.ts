import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { CoupleImageKind } from 'src/common/enums';
import { User } from 'src/user/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { CreateCoupleDto } from './dto/create-couple.dto';
import { QueryCoupleDto } from './dto/query-couple.dto';
import { UpdateCoupleDto } from './dto/update-couple.dto';
import { CoupleImage } from './entities/couple-image.entity';
import { Couple } from './entities/couple.entity';

@Injectable()
export class CoupleService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Couple)
    private readonly coupleRepository: Repository<Couple>,
    @InjectRepository(CoupleImage)
    private readonly coupleImageRepository: Repository<CoupleImage>,
  ) {}

  private buildCoupleImageUrl(coupleId: string, kind: CoupleImageKind) {
    return `/couple/${coupleId}/image/${kind}`;
  }

  private async getOwnedCoupleWithPasswordHash(params: {
    coupleId: string;
    userId: string;
  }) {
    const couple = await this.coupleRepository
      .createQueryBuilder('couple')
      .addSelect('couple.passwordHash')
      .where('couple.id = :id', { id: params.coupleId })
      .andWhere('couple.createdByUserId = :userId', { userId: params.userId })
      .getOne();

    if (!couple) {
      throw new NotFoundException(
        `Không tìm thấy ID Couple ${params.coupleId}`,
      );
    }

    if (!couple.shareToken) {
      const shareToken = randomUUID();
      await this.coupleRepository.update(couple.id, { shareToken });
      couple.shareToken = shareToken;
    }

    return couple;
  }

  private async getCoupleByShareTokenWithPasswordHash(shareToken: string) {
    const couple = await this.coupleRepository
      .createQueryBuilder('couple')
      .addSelect('couple.passwordHash')
      .where('couple.shareToken = :shareToken', { shareToken })
      .getOne();

    if (!couple) {
      throw new NotFoundException('Không tìm thấy couple từ QR.');
    }

    return couple;
  }

  private sanitizePublicCouple(couple: Couple) {
    const { createdByUserId, passwordHash, ...rest } = couple as any;
    return {
      ...rest,
      password: null,
    };
  }

  private async assertCouplePasswordIfSet(params: {
    coupleId: string;
    userId: string;
    password?: string;
  }) {
    const couple = await this.getOwnedCoupleWithPasswordHash({
      coupleId: params.coupleId,
      userId: params.userId,
    });

    if (!couple.passwordHash) {
      return;
    }

    if (!params.password) {
      throw new UnauthorizedException('Vui lòng nhập mật khẩu couple.');
    }

    const ok = await bcrypt.compare(params.password, couple.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Mật khẩu couple không đúng.');
    }
  }

  async createCouple(dto: CreateCoupleDto, userId: string) {
    const couple = this.coupleRepository.create({
      shareToken: randomUUID(),
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

  async getPublicCoupleByShareToken(params: {
    shareToken: string;
    password?: string;
  }) {
    const couple = await this.getCoupleByShareTokenWithPasswordHash(
      params.shareToken,
    );

    if (!couple.passwordHash) {
      throw new UnauthorizedException(
        'Couple chưa có mật khẩu. Vui lòng tạo mật khẩu để truy cập.',
      );
    }

    if (couple.passwordHash) {
      if (!params.password) {
        throw new UnauthorizedException('Vui lòng nhập mật khẩu couple.');
      }

      const ok = await bcrypt.compare(params.password, couple.passwordHash);
      if (!ok) {
        throw new UnauthorizedException('Mật khẩu couple không đúng.');
      }
    }

    return this.sanitizePublicCouple(couple);
  }

  async setCouplePasswordByShareToken(params: {
    shareToken: string;
    newPassword: string;
    currentPassword?: string;
  }) {
    const couple = await this.getCoupleByShareTokenWithPasswordHash(
      params.shareToken,
    );

    if (couple.passwordHash) {
      if (!params.currentPassword) {
        throw new UnauthorizedException(
          'Vui lòng nhập mật khẩu couple hiện tại.',
        );
      }

      const ok = await bcrypt.compare(
        params.currentPassword,
        couple.passwordHash,
      );
      if (!ok) {
        throw new UnauthorizedException('Mật khẩu couple hiện tại không đúng.');
      }
    }

    const hashed = await bcrypt.hash(params.newPassword, 10);
    await this.coupleRepository.update(couple.id, {
      passwordHash: hashed,
    });

    return {
      coupleId: couple.id,
      hasPassword: true,
    };
  }

  async verifyCouplePasswordByShareToken(params: {
    shareToken: string;
    password: string;
  }) {
    const couple = await this.getCoupleByShareTokenWithPasswordHash(
      params.shareToken,
    );

    if (!couple.passwordHash) {
      return {
        verified: false,
        hasPassword: false,
        coupleId: couple.id,
      };
    }

    const verified = await bcrypt.compare(params.password, couple.passwordHash);
    return {
      verified,
      hasPassword: true,
      coupleId: couple.id,
    };
  }

  async findAllCouple(
    query: QueryCoupleDto,
    userId: string,
  ): Promise<{
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
          { createdByUserId: userId, malePartnerName: ILike(`%${q}%`) },
          { createdByUserId: userId, femalePartnerName: ILike(`%${q}%`) },
        ]
      : { createdByUserId: userId };

    const [items, total] = await this.coupleRepository.findAndCount({
      where,
      take: limit,
      skip,
      order: { date: 'DESC' },
    });

    const missingShareTokenIds = items
      .filter((c) => !c.shareToken)
      .map((c) => c.id);

    if (missingShareTokenIds.length > 0) {
      await Promise.all(
        items
          .filter((c) => !c.shareToken)
          .map(async (c) => {
            const shareToken = randomUUID();
            await this.coupleRepository.update(c.id, { shareToken });
            c.shareToken = shareToken;
          }),
      );
    }

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

  async findOne(params: { id: string; userId: string; password?: string }) {
    await this.assertCouplePasswordIfSet({
      coupleId: params.id,
      userId: params.userId,
      password: params.password,
    });

    const couple = await this.coupleRepository.findOneBy({
      id: params.id,
      createdByUserId: params.userId,
    });
    if (!couple) {
      throw new NotFoundException(`Không tìm thấy ID Couple ${params.id}`);
    }

    return couple;
  }

  async updateCouple(params: {
    id: string;
    userId: string;
    password?: string;
    dto: UpdateCoupleDto;
  }) {
    await this.assertCouplePasswordIfSet({
      coupleId: params.id,
      userId: params.userId,
      password: params.password,
    });

    const result = await this.coupleRepository.update(
      { id: params.id, createdByUserId: params.userId },
      params.dto,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy ID Couple ${params.id}`);
    }

    return this.coupleRepository.findOneBy({
      id: params.id,
      createdByUserId: params.userId,
    });
  }

  async setCouplePassword(params: {
    coupleId: string;
    userId: string;
    newPassword: string;
    currentPassword?: string;
  }) {
    const couple = await this.getOwnedCoupleWithPasswordHash({
      coupleId: params.coupleId,
      userId: params.userId,
    });

    if (couple.passwordHash) {
      if (!params.currentPassword) {
        throw new UnauthorizedException(
          'Vui lòng nhập mật khẩu couple hiện tại.',
        );
      }

      const ok = await bcrypt.compare(
        params.currentPassword,
        couple.passwordHash,
      );
      if (!ok) {
        throw new UnauthorizedException('Mật khẩu couple hiện tại không đúng.');
      }
    }

    const hashed = await bcrypt.hash(params.newPassword, 10);
    await this.coupleRepository.update(params.coupleId, {
      passwordHash: hashed,
    });

    return {
      coupleId: params.coupleId,
      hasPassword: true,
    };
  }

  async verifyCouplePassword(params: {
    coupleId: string;
    userId: string;
    password: string;
  }) {
    const couple = await this.getOwnedCoupleWithPasswordHash({
      coupleId: params.coupleId,
      userId: params.userId,
    });

    if (!couple.passwordHash) {
      return {
        verified: false,
        hasPassword: false,
      };
    }

    const verified = await bcrypt.compare(params.password, couple.passwordHash);
    return {
      verified,
      hasPassword: true,
    };
  }

  async uploadCoupleImage(params: {
    coupleId: string;
    kind: CoupleImageKind;
    file: Express.Multer.File;
    userId: string;
    password?: string;
  }) {
    await this.assertCouplePasswordIfSet({
      coupleId: params.coupleId,
      userId: params.userId,
      password: params.password,
    });

    const couple = await this.coupleRepository.findOneBy({
      id: params.coupleId,
      createdByUserId: params.userId,
    });
    if (!couple) {
      throw new NotFoundException(
        `Không tìm thấy ID Couple ${params.coupleId}`,
      );
    }

    const url = this.buildCoupleImageUrl(params.coupleId, params.kind);

    await this.coupleImageRepository.upsert(
      {
        coupleId: params.coupleId,
        kind: params.kind,
        mimeType: params.file.mimetype,
        originalName: params.file.originalname,
        data: params.file.buffer,
      },
      ['coupleId', 'kind'],
    );

    await this.coupleRepository.update(params.coupleId, {
      [params.kind]: url,
    } as unknown as Partial<Couple>);

    return {
      url,
    };
  }

  async uploadCoupleImages(params: {
    coupleId: string;
    files: Partial<Record<CoupleImageKind, Express.Multer.File | undefined>>;
    userId: string;
    password?: string;
  }) {
    const urls: Partial<Record<CoupleImageKind, string>> = {};

    await this.assertCouplePasswordIfSet({
      coupleId: params.coupleId,
      userId: params.userId,
      password: params.password,
    });

    return this.coupleImageRepository.manager.transaction(async (manager) => {
      const coupleRepo = manager.getRepository(Couple);
      const coupleImageRepo = manager.getRepository(CoupleImage);

      const couple = await coupleRepo.findOneBy({
        id: params.coupleId,
        createdByUserId: params.userId,
      });
      if (!couple) {
        throw new NotFoundException(
          `Không tìm thấy ID Couple ${params.coupleId}`,
        );
      }

      const updatePayload: Partial<Couple> = {};

      const kinds: CoupleImageKind[] = [
        CoupleImageKind.MalePartnerAvatar,
        CoupleImageKind.FemalePartnerAvatar,
        CoupleImageKind.BackgroundImageUrl,
      ];

      for (const kind of kinds) {
        const file = params.files?.[kind];
        if (!file) continue;

        const url = this.buildCoupleImageUrl(params.coupleId, kind);
        urls[kind] = url;

        await coupleImageRepo.upsert(
          {
            coupleId: params.coupleId,
            kind,
            mimeType: file.mimetype,
            originalName: file.originalname,
            data: file.buffer,
          },
          ['coupleId', 'kind'],
        );

        (updatePayload as any)[kind] = url;
      }

      if (Object.keys(updatePayload).length > 0) {
        await coupleRepo.update(params.coupleId, updatePayload);
      }

      const updated = await coupleRepo.findOneBy({ id: params.coupleId });
      return {
        urls,
        couple: updated,
      };
    });
  }

  async getCoupleImage(params: {
    coupleId: string;
    kind: CoupleImageKind;
    userId: string;
    password?: string;
  }) {
    await this.assertCouplePasswordIfSet({
      coupleId: params.coupleId,
      userId: params.userId,
      password: params.password,
    });

    const image = await this.coupleImageRepository.findOneBy({
      coupleId: params.coupleId,
      kind: params.kind,
    });

    if (!image) {
      throw new NotFoundException('Không tìm thấy hình ảnh.');
    }

    return image;
  }

  remove(id: number) {
    return `This action removes a #${id} couple`;
  }
}
