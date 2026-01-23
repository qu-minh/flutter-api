import { CoupleImageKind } from 'src/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Couple } from './couple.entity';

@Index(['coupleId', 'kind'], { unique: true })
@Entity('couple_images')
export class CoupleImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  coupleId: string;

  @ManyToOne(() => Couple, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupleId' })
  couple: Couple;

  @Column({ type: 'varchar' })
  kind: CoupleImageKind;

  @Column({ type: 'varchar' })
  mimeType: string;

  @Column({ type: 'varchar' })
  originalName: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
