import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule } from '@nestjs/microservices';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { createKafkaClientConfig } from 'src/configs/kafka-client.factory';
import { ApiOrServiceTokenGuard } from './guards/api-or-service-token.guard';
import { ServiceTokenGuard } from './guards/service-token.guard';

@Module({
  imports: [
    ClientsModule.registerAsync([
      createKafkaClientConfig({
        name: 'AUTH_SERVICE',
        groupId: 'api-gateway-auth-consumer',
      }),
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    ServiceTokenGuard,
    ApiOrServiceTokenGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    ServiceTokenGuard,
    ApiOrServiceTokenGuard,
  ],
})
export class AuthModule {}
