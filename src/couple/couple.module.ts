import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CoupleController } from './couple.controller';
import { CoupleService } from './couple.service';
import { CoupleImage } from './entities/couple-image.entity';
import { Couple } from './entities/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Couple, CoupleImage])],
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
