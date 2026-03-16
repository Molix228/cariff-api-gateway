import { ApiProperty } from '@nestjs/swagger';

export class RegisteredUserResponse {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the registered user',
  })
  id: string;
  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the registered user',
  })
  username: string;
  @ApiProperty({
    example: 'john_doe@example.com',
    description: 'The email of the registered user',
  })
  email: string;
}
