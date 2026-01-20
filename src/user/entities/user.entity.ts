import { Gender } from 'src/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30 })
  name: string;

  @Column({ length: 15, unique: true })
  username: string;

  @Column({ length: 40, unique: true })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.U })
  gender: Gender;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
