import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateCoupleDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng cung cấp tên của bạn trai.' })
  malePartnerName: string;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng cung cấp tên của bạn gái.' })
  femalePartnerName: string;

  @IsOptional()
  @IsDateString({}, { message: 'Vui lòng cung cấp ngày sinh hợp lệ.' })
  birthDayMalePartner: string;

  @IsOptional()
  @IsDateString({}, { message: 'Vui lòng cung cấp ngày sinh hợp lệ.' })
  birthDayFemalePartner: string;

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
