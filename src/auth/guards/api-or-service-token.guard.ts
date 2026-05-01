import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ServiceTokenGuard } from './service-token.guard';

@Injectable()
export class ApiOrServiceTokenGuard implements CanActivate {
  constructor(
    private readonly jwtGuard: JwtAuthGuard,
    private readonly serviceTokenGuard: ServiceTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isService = await this.serviceTokenGuard.canActivate(context);
      if (isService) return true;
    } catch (e) {}

    try {
      return (await this.jwtGuard.canActivate(context)) as boolean;
    } catch (e) {
      return false;
    }
  }
}
