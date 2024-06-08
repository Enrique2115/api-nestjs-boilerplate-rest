import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envs } from '@src/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: envs.DATABASE.URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl:
        envs.NODE_ENV !== 'development' && envs.NODE_ENV !== 'test'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    }),
  ],
})
export class DatabaseModule {}
