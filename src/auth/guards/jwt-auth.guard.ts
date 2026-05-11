import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
// import { ClientKafka } from '@nestjs/microservices';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject() private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Missing token');
    const token = authHeader.split(' ')[1];

    const result = await this.authService.validateToken(token);
    if (!result.valid) throw new UnauthorizedException('Token is not valid');

    req.user = {
      userId: result.userId,
      username: result.username,
      isEmailVerified: result.isEmailVerified,
    };
    return true;
  }
}
