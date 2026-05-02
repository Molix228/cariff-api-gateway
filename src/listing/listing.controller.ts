import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { CreateListingInputDto } from './dto/create-listing-input.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetListingsDto } from './dto/get-listings.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { ListingResponseDto } from './dto/listing.model';

class ListingResponseObject {
  success: boolean;
  status: number;
  data: PaginatedResponseDto<ListingResponseDto>;
}

@ApiTags('Listings Management')
@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @ApiOperation({
    summary: 'Get listings',
    description: 'Retrieves listings based on query parameters',
  })
  @ApiQuery({
    type: GetListingsDto,
    description: 'Query parameters for filtering listings',
  })
  @ApiResponse({
    type: PaginatedResponseDto,
    status: 200,
    description: 'Listings retrieved successfully.',
  })
  @Get('find')
  async getListings(
    @Query() query: GetListingsDto,
  ): Promise<ListingResponseObject> {
    const res = await this.listingService.getListings(query);
    return {
      success: true,
      status: 200,
      data: res,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create_ad')
  async createNewAd(@Body() createAdDto: CreateListingInputDto, @Req() req) {
    return this.listingService.createNewAd(createAdDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete_ad/:id')
  async deleteAd(@Param('id') id: string, @Req() req) {
    const { userId } = req.user;
    return this.listingService.deleteAd(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-listings')
  @ApiOperation({
    summary: 'Get user listings',
    description: 'Retrieves listings created by the authenticated user',
  })
  async getMyListings(@Req() req): Promise<ListingResponseObject> {
    const userId = req.user.userId;
    const listingsQuery = new GetListingsDto();
    listingsQuery.filters.userId = userId;
    const res = await this.listingService.getListings(listingsQuery);
    return {
      success: true,
      status: 200,
      data: res,
    };
  }

  @Get('seed-makes')
  async seedMakes() {
    return this.listingService.seedMakes();
  }
  @Get('seed-models')
  async seedModels() {
    return this.listingService.seedModels();
  }

  @Get('seed-models-by-make/:makeId')
  async seedModelsByMake(@Param('makeId') makeId: number) {
    return await this.listingService.seedModelsByMake(makeId);
  }
}
