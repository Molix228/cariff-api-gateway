import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DefaultQueryDto } from './dto/search/default.query.dto';
import { MakesResponseDto } from './dto/car_makes/makes.response.dto';
import { VehicleDataService } from './vehicle-data.service';
import { GetModelsQueryDto } from './dto/car_models/get-models.query.dto';
import { ModelsResponseDto } from './dto/car_models/models.response.dto';

@ApiTags('Vehicle Data Service')
@Controller('vehicle-data')
export class VehicleDataController {
  constructor(private readonly vehicleDataService: VehicleDataService) {}

  @ApiOperation({
    summary: 'Get all makes',
    description: 'Retrieves makes based on query parameters',
  })
  @ApiQuery({
    type: DefaultQueryDto,
    description: 'Query parameters for filtering makes',
  })
  @ApiResponse({
    type: MakesResponseDto,
    status: 200,
    description: 'Makes retrieved successfully.',
  })
  @Get('makes')
  async getMakes(@Query() query: DefaultQueryDto): Promise<MakesResponseDto> {
    return await this.vehicleDataService.getMakes(query);
  }

  @ApiOperation({
    summary: 'Get all models by makeId',
    description: 'Retrieves models based on query parameters',
  })
  @ApiQuery({
    type: GetModelsQueryDto,
    description: 'Query parameters for filtering models',
  })
  @ApiResponse({
    type: ModelsResponseDto,
    status: 200,
    description: 'Models retrieved successfully.',
  })
  @Get('models')
  async getModels(
    @Query() query: GetModelsQueryDto,
  ): Promise<ModelsResponseDto> {
    return await this.vehicleDataService.getModelsByMake(query);
  }
}
