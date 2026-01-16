import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/common/enums';
import { PASSWORD_REGEX as PasswordRegex } from 'src/common/regex/password.regex';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự.' })
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' })
  @IsAlphanumeric(undefined, {
    message: 'Tên đăng nhập chỉ được phép chứa chữ cái và số.',
  })
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail(undefined, { message: 'Vui lòng cung cấp địa chỉ email hợp lệ.' })
  email: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @Matches(PasswordRegex, {
    message: `Mật khẩu phải có tối thiểu 8 và tối đa 20 ký tự, 
    ít nhất một chữ hoa, 
    một chữ thường, 
    một chữ số và 
    một ký tự đặc biệt`,
  })
  password: string;
}
