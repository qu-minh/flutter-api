import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCouplePasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
