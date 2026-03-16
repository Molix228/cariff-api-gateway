import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUserResponseDto, UpdateUserDto } from './dto';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // INFO: - GET USER PROFILE ENDPOINT
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the user profile',
  })
  @ApiQuery({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
  })
  @ApiResponse({
    type: GetUserResponseDto,
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('get_user')
  async get_user(@Req() req): Promise<GetUserResponseDto> {
    const userId = req.user.userId;
    const user = await this.userService.get_profile(userId);
    return user;
  }

  // INFO: - UPDATE USER PROFILE ENDPOINT
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates the user profile',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The data to update the user profile',
  })
  @ApiResponse({
    type: GetUserResponseDto,
    status: 200,
    description: 'User profile updated successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @Put('update_profile')
  async update_user(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const { userId } = req.user;
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );
    return updatedUser;
  }

  // INFO: - DELETE USER ENDPOINT
  @ApiQuery({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
  })
  @ApiOperation({
    summary: 'Delete user',
    description: 'Deletes the user account',
  })
  @ApiResponse({
    type: Object,
    status: 200,
    description: 'User deleted successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('delete_user')
  async delete_user(@Req() req) {
    const deletedUser = await this.userService.deleteUser(req.user.userId);
    return deletedUser;
  }
}
