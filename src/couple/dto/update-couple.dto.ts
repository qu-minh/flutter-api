import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { CreateCoupleDto } from './create-couple.dto';

export class UpdateCoupleDto extends PartialType(CreateCoupleDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên bạn trai không được để trống.' })
  malePartnerName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên bạn gái không được để trống.' })
  femalePartnerName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Vui lòng cung cấp ngày sinh hợp lệ.' })
  birthDayMalePartner: string;

  @IsOptional()
  @IsDateString({}, { message: 'Vui lòng cung cấp ngày sinh hợp lệ.' })
  birthDayFemalePartner: string;

  @IsOptional()
  @IsDateString({}, { message: 'Ngày kỷ niệm không hợp lệ.' })
  date: string;

  @IsOptional()
  @IsUrl({}, { message: 'Ảnh nền phải là một URL hợp lệ.' })
  backgroundImageUrl?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Ảnh nền phải là một URL hợp lệ.' })
  femalePartnerAvatar?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Ảnh nền phải là một URL hợp lệ.' })
  malePartnerAvatar?: string;
}
