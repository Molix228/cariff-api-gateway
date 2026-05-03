import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateListingInputDto } from './dto/create-listing-input.dto';
import { lastValueFrom, timeout } from 'rxjs';
import { GetListingsDto } from './dto/get-listings.dto';
import { UploadService } from 'src/upload/upload.service';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { ListingResponseDto } from './dto/listing.model';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ListingService implements OnModuleInit {
  constructor(
    @Inject('LISTING_SERVICE') private readonly listingClient: ClientKafka,
    private readonly uploadService: UploadService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit() {
    const listingTopics = [
      'listing.find',
      'listing.get-by-id',
      'listing.create-ad',
      'listing.delete-ad',
      'listing.insert-makes',
      'listing.insert-models',
      'listing.insert-models-by-make',
      'vehicle-data.get-makes',
      'vehicle-data.get-models',
      'favourites.get-favourites-ids',
      'favourites.get-favourites',
      'favourites.add-favourite',
      'favourites.remove-favourite',
    ];

    listingTopics.forEach((topic) =>
      this.listingClient.subscribeToResponseOf(topic),
    );

    await Promise.all([this.listingClient.connect()]);
  }
  async getListings(
    listingsDto: GetListingsDto,
  ): Promise<PaginatedResponseDto<ListingResponseDto>> {
    try {
      const payload = {
        filters: { ...listingsDto.filters },
        pagination: { ...listingsDto.pagination },
      };
      const listings = await lastValueFrom(
        this.listingClient
          .send<
            PaginatedResponseDto<ListingResponseDto>
          >('listing.find', payload)
          .pipe(timeout(10000)),
      );

      if (!listings || !listings.items || listings.items.length === 0) {
        return listings;
      }

      const userIds: string[] = Array.from(
        new Set(listings?.items?.map((l: any) => l.userId as string) || []),
      ).filter(Boolean);

      if (userIds.length === 0) return listings;

      const userMap = await this.userService.getUsersInfoMap(userIds);

      listings.items = listings.items.map((listing) => ({
        ...listing,
        city:
          userMap && userMap[listing.userId]
            ? userMap[listing.userId].city
            : 'Unknown location',
      }));

      if (!listings)
        throw new InternalServerErrorException('Failed to find listings');
      return listings;
    } catch (err) {
      console.error('[ListingService] Error finding listings: ', err);
      throw new InternalServerErrorException(
        'Error finding listings',
        err.message,
      );
    }
  }

  async getListingDetails(id: string): Promise<ListingResponseDto> {
    try {
      const listing = await lastValueFrom(
        this.listingClient.send('listing.get-by-id', id).pipe(timeout(5000)),
      );
      if (!listing) throw new NotFoundException('Listing details not found');
      if (listing.userId) {
        try {
          const userMap = await this.userService.getUsersInfoMap([
            listing.userId,
          ]);

          listing.city =
            userMap && userMap[listing.userId]
              ? userMap[listing.userId].city
              : 'Unknown location';
        } catch (userError) {
          console.error(
            '[ListingService] Failed to fetch city for details:',
            userError,
          );
          listing.city = 'Unknown location';
        }
      }
      return listing;
    } catch (err) {
      console.error('[ListingService] Error fetching details:', err);
      throw new InternalServerErrorException(
        'Error fetching listing details',
        err.message,
      );
    }
  }

  async createNewAd(createAdDto: CreateListingInputDto, userId: string) {
    if (createAdDto.images && createAdDto.images.length > 0) {
      const checkResult = await Promise.all(
        createAdDto.images.map((url) =>
          this.uploadService.validateFileExists(url),
        ),
      );
      if (checkResult.includes(false)) {
        throw new BadRequestException(
          'Some images were not found in S3 storage',
        );
      }
    }
    const adPayload = { createAdDto, userId };

    try {
      const createdAd = await lastValueFrom(
        this.listingClient
          .send('listing.create-ad', adPayload)
          .pipe(timeout(5000)),
      );
      if (!createdAd) {
        throw new InternalServerErrorException('Failed to create ad');
      }
      return createdAd;
    } catch (err) {
      console.error('[ListingService] Error creating ad:', err);
      throw new InternalServerErrorException('Error creating ad', err.message);
    }
  }

  async deleteAd(id: string, userId: string): Promise<boolean> {
    try {
      const listing = await lastValueFrom(
        this.listingClient
          .send('listing.delete-ad', { id, userId })
          .pipe(timeout(5000)),
      );
      if (!listing)
        throw new InternalServerErrorException('Failed to delete ad');
      return listing;
    } catch (err) {
      console.error('[ListingService] Error deleting ad:', err);
      throw new InternalServerErrorException('Error deleting ad', err.message);
    }
  }

  async seedMakes(): Promise<void> {
    try {
      const request = await lastValueFrom(
        this.listingClient.send('listing.insert-makes', {}),
      );
      if (!request)
        throw new InternalServerErrorException('Failed to seed makes');
    } catch (error) {
      console.error('[ListingService] Error seed makes:', error);
      throw new InternalServerErrorException('Error seed makes', error.mesage);
    }
  }

  async seedModels(): Promise<void> {
    try {
      const request = await lastValueFrom(
        this.listingClient.send('listing.insert-models', {}),
      );
      if (!request)
        throw new InternalServerErrorException('Failed to seed models');
    } catch (error) {
      console.error('[ListingService] Error seed models:', error);
      throw new InternalServerErrorException('Error seed models', error.mesage);
    }
  }

  async seedModelsByMake(makeId: number): Promise<void> {
    try {
      const request = await lastValueFrom(
        this.listingClient.send('listing.insert-models-by-make', { makeId }),
      );
      if (!request)
        throw new InternalServerErrorException(
          'Failed to seed models for makeId: ' + makeId,
        );
    } catch (error) {
      console.error(
        `[ListingService] Error seed models for makeId ${makeId}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Error seed models for makeId ${makeId}`,
        error.mesage,
      );
    }
  }
}
