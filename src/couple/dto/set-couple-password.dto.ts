import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX as PasswordRegex } from 'src/common/regex/password.regex';

export class SetCouplePasswordDto {
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
