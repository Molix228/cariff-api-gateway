import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { handleRpcError } from 'src/common/utils/handle-rpc-error.util';

@Injectable()
export class FavouritesService {
  constructor(
    @Inject('LISTING_SERVICE') private readonly favouritesClient: ClientKafka,
  ) {}

  // MARK: Lightweight method ONLY IDS
  async getUserFavouritesIds(userId: string) {
    try {
      return await lastValueFrom(
        this.favouritesClient.send('favourites.get-favourites-ids', { userId }),
      );
    } catch (error) {
      handleRpcError(error);
    }
  }

  async getUserFavourites(userId: string) {
    try {
      return await lastValueFrom(
        this.favouritesClient.send('favourites.get-favourites', { userId }),
      );
    } catch (error) {
      handleRpcError(error);
    }
  }

  async addToFavourites(listingId: string, userId: string) {
    try {
      return await lastValueFrom(
        this.favouritesClient.send('favourites.add-favourite', {
          listingId,
          userId,
        }),
      );
    } catch (error) {
      handleRpcError(error);
    }
  }

  async removeFromFavourites(listingId: string, userId: string) {
    try {
      return await lastValueFrom(
        this.favouritesClient.send('favourites.remove-favourite', {
          listingId,
          userId,
        }),
      );
    } catch (error) {
      handleRpcError(error);
    }
  }
}
