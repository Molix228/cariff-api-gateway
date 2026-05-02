import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavouritesService } from './favourites.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Favourite Listings Service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  // MARK: Lightweight method ONLY IDS
  @ApiOperation({ summary: 'Get all user favourite listing IDs' })
  @Get('ids')
  async getUserFavouritesIds(@Req() req) {
    return await this.favouritesService.getUserFavouritesIds(req.user.userId);
  }

  @ApiOperation({ summary: 'Get all user favourites' })
  @Get()
  async getUserFavourites(@Req() req) {
    return await this.favouritesService.getUserFavourites(req.user.userId);
  }

  @ApiOperation({ summary: 'Add to User Favourites' })
  @Post('add/:listingId')
  async addToFavourites(@Param('listingId') listingId: string, @Req() req) {
    return await this.favouritesService.addToFavourites(
      listingId,
      req.user.userId,
    );
  }

  @ApiOperation({ summary: 'Remove from User Favourites' })
  @Delete(':listingId')
  async removeFromFavourites(
    @Param('listingId') listingId: string,
    @Req() req,
  ) {
    return await this.favouritesService.removeFromFavourites(
      listingId,
      req.user.userId,
    );
  }
}
