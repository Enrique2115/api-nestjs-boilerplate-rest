import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('refresh_token')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  token: string;

  @Column()
  expiration: Date;

  @ManyToOne(() => UserEntity, user => user.refreshTokens)
  @JoinColumn({
    name: 'user_id',
  })
  user: Relation<UserEntity>;
}
