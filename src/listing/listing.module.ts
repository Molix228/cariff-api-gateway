import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ClientsModule } from '@nestjs/microservices';
import { ListingService } from './listing.service';
import { AuthModule } from 'src/auth/auth.module';
import { UploadModule } from 'src/upload/upload.module';
import { createKafkaClientConfig } from 'src/configs/kafka-client.factory';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UploadModule,
    AuthModule,
    UserModule,
    ClientsModule.registerAsync([
      createKafkaClientConfig({
        name: 'LISTING_SERVICE',
        groupId: 'api-gateway-listing-consumer',
      }),
    ]),
  ],
  controllers: [ListingController],
  providers: [ListingService],
  exports: [ListingService, ClientsModule],
})
export class ListingModule {}
