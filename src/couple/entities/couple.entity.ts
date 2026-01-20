import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('couples')
export class Couple {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
}
