import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('couples')
@Index(['shareToken'], { unique: true })
export class Couple {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  shareToken: string | null;

  @Column()
  date: Date;

  @Column({ default: 0 })
  score: number;

  @Column()
  femalePartnerName: string;

  @Column({ nullable: true })
  femalePartnerAvatar?: string;

  @Column({ type: 'date', nullable: true })
  birthDayMalePartner: Date;

  @Column()
  malePartnerName: string;

  @Column({ nullable: true })
  backgroundImageUrl?: string;

  @Column({ type: 'date', nullable: true })
  birthDayFemalePartner: Date;

  @Column({ nullable: true })
  malePartnerAvatar?: string;

  @Column()
  createdByUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  passwordHash: string | null;
}
