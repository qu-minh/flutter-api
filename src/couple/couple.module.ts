import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CoupleController } from './couple.controller';
import { CoupleService } from './couple.service';
import { Couple } from './entities/couple.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Couple])],
  controllers: [CoupleController],
  providers: [CoupleService],
})
export class CoupleModule {}
