import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  status: boolean;

  @ManyToMany(() => UserEntity, user => user.roles)
  users: UserEntity[];
}
