import { IsEnum } from 'class-validator';
import { CoupleImageKind } from 'src/common/enums';

export class UploadCoupleImageDto {
  @IsEnum(CoupleImageKind, { message: 'kind không hợp lệ.' })
  kind: CoupleImageKind;
}
