import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { IsGreaterThan } from 'src/validators/greater.decorator';

export class PriceRangeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsGreaterThan('min', {
    message: '[Max price] cannot be less than [Min price]',
  })
  max?: number;
}
