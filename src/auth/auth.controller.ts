import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';
import {
  CreateUserDto,
  LoginUserDto,
  LoginUserResponse,
  RegisteredUserResponse,
} from './dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // INFO: - REGISTER ENDPOINT
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account',
  })
  @ApiResponse({
    type: RegisteredUserResponse,
    status: 201,
    description: 'User registered successfully.',
  })
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<RegisteredUserResponse> {
    return await this.authService.register(createUserDto);
  }

  // INFO: - LOGIN ENDPOINT
  @ApiOperation({ summary: 'User login', description: 'Logs in a user' })
  @ApiResponse({
    type: LoginUserResponse,
    status: 200,
    description: 'User logged in successfully.',
  })
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserResponse> {
    try {
      const { user, accessToken, refreshToken } =
        await this.authService.login(loginUserDto);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // INFO: - REFRESH ACCESS TOKEN ENDPOINT
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Refreshes the access token using a refresh token',
  })
  @ApiResponse({
    type: Object,
    status: 200,
    description: 'Access token refreshed successfully.',
  })
  @UseGuards(RefreshJwtGuard)
  @Post('refresh-token')
  async refreshAccessToken(@Req() req) {
    const refreshToken = req.cookies['refreshToken'];
    const { accessToken } =
      await this.authService.refreshAccessToken(refreshToken);

    return { accessToken };
  }

  // INFO: - LOGOUT ENDPOINT
  @ApiOperation({ summary: 'User logout', description: 'Logs out a user' })
  @ApiQuery({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
  })
  @ApiResponse({
    type: Object,
    status: 200,
    description: 'User logged out successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (refreshToken) {
      await this.authService.revokeToken(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Verify email with OTP' })
  @Post('verify-email')
  async verifyEmail(@Body() data: { email: string; code: string }) {
    return await this.authService.verifyEmail(data);
  }
}
