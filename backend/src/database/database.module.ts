import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PG_POOL,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        return new Pool({
          connectionString,
          ssl: false, // Set to true if your DB requires SSL
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
