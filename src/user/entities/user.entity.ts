import { Gender } from 'src/common/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  /**
   * this decorator will help to auto generate id for the table.
   */
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'varchar', length: 15 })
  username: string;

  @Column({ type: 'varchar', length: 40 })
  email: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'enum', enum: Gender })
  /**
   * m - male
   * f - female
   * u - unspecified
   */
  gender: Gender;
}
