import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ListingModule } from 'src/listing/listing.module';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

@Module({
  imports: [AuthModule, ListingModule],
  controllers: [FavouritesController],
  providers: [FavouritesService],
  exports: [FavouritesService],
})
export class FavouritesModule {}
