import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
  CreateUserDto,
  LoginUserDto,
  LoginUserResponse,
  RegisteredUserResponse,
} from './dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
  ) {}
  async onModuleInit() {
    // Subscribe to the topics this service will consume
    this.authClient.subscribeToResponseOf('user.exists');
    this.authClient.subscribeToResponseOf('auth.register');
    this.authClient.subscribeToResponseOf('auth.login');
    this.authClient.subscribeToResponseOf('auth.validate-token');
    this.authClient.subscribeToResponseOf('auth.validate-refresh-token');
    this.authClient.subscribeToResponseOf('auth.refresh-access-token');
    this.authClient.subscribeToResponseOf('auth.revoke-token');
    this.authClient.subscribeToResponseOf('auth.verify-email');

    await this.authClient.connect();
  }

  // api-gateway/auth/auth.service.ts
  async register(
    createUserDto: CreateUserDto,
  ): Promise<RegisteredUserResponse> {
    try {
      const isUserExist = await lastValueFrom(
        this.authClient.send('user.exists', createUserDto.email),
      );

      if (isUserExist) {
        throw new ConflictException('User already exists');
      }

      const registerPayload = plainToInstance(Object, createUserDto);

      const registeredUser = await lastValueFrom(
        this.authClient.send('auth.register', registerPayload),
      );
      return registeredUser;
    } catch (error) {
      console.error('[API_GW] Error while registration:', error);
      throw new ConflictException('Registration failed', error.message);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginUserResponse> {
    try {
      const loginPayload = plainToInstance(Object, loginUserDto);
      return await lastValueFrom(
        this.authClient.send('auth.login', loginPayload),
      );
    } catch (error) {
      const status =
        [error?.statusCode, error?.status, error?.response?.statusCode].find(
          Number.isInteger,
        ) || HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        error?.message || error?.response?.message || 'Internal server error';

      throw new HttpException(message, status);
    }
  }

  async validateToken(token: string) {
    const result = await firstValueFrom(
      this.authClient.send('auth.validate-token', token),
    );
    if (!result) throw new InternalServerErrorException(`Token is not valid`);
    return result;
  }

  async refreshAccessToken(token: string): Promise<{ accessToken: string }> {
    try {
      const result = await lastValueFrom(
        this.authClient.send('auth.refresh-access-token', token),
      );
      if (!result)
        throw new InternalServerErrorException(`Refresh token is not valid`);
      return result;
    } catch (error) {
      console.log('[API_GW] Refresh Token Error:', error);
      throw new UnauthorizedException('Session expired');
    }
  }

  async revokeToken(token: string): Promise<void> {
    try {
      await firstValueFrom(this.authClient.send('auth.revoke-token', token));
    } catch (error) {
      console.error('[API_GW] Revoke Token Error:', error);
    }
  }

  async verifyEmail(data: { email: string; code: string }) {
    return await lastValueFrom(this.authClient.send('auth.verify-email', data));
  }

  async validateRefreshToken(token: string) {
    const result = await firstValueFrom(
      this.authClient.send('auth.validate-refresh-token', token),
    );
    if (!result)
      throw new InternalServerErrorException(`RefreshToken is not valid`);
    return result;
  }
}
