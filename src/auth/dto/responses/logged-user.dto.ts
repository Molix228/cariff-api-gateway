import { ApiProperty } from '@nestjs/swagger';

export class LoginUserResponse {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'john_doe',
    },
    description: 'The logged in user details',
  })
  user: {
    id: string;
    username: string;
  };
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The access token for authentication',
  })
  accessToken: string;
  refreshToken: string;
}
