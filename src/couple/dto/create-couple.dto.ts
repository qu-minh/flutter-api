import { IsArray, Length } from 'class-validator';

export class CreateCoupleDto {
  @IsArray({ message: 'Danh sách userIds phải là một mảng.' })
  @Length(2, 2, { message: 'Danh sách userIds phải có đúng 2 phần tử.' })
  listUserIds: string[];
}
