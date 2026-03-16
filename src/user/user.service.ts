import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { UpdateUserDto } from './dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @Inject('USER_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      this.authClient.subscribeToResponseOf('user.get-profile');
      this.authClient.subscribeToResponseOf('user.deletebyid');
      this.authClient.subscribeToResponseOf('user.update-profile');

      await this.authClient.connect();
    } catch (error) {
      console.error('❌ UserService: ClientKafka connection ERROR:', error);
      // Бросьте ошибку, чтобы остановить приложение, если клиент не работает
      throw new Error('Failed to connect to Kafka via AUTH_SERVICE.');
    }
  }

  async get_profile(id: string) {
    const user = await lastValueFrom(
      this.authClient.send('user.get-profile', id),
    );
    if (!user) throw new InternalServerErrorException('User not found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await firstValueFrom(
      this.authClient.send('user.deletebyid', id),
    );
    if (!user) throw new NotFoundException(`User with ID: ${id} not found`);
    console.debug('User was Successfully DELETED from DB!');
    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const updateUserPayload = plainToInstance(Object, updateUserDto);
      const payload = {
        id: userId,
        ...updateUserPayload,
      };
      const updatedUser = await lastValueFrom(
        this.authClient.send('user.update-profile', payload),
      );
      return updatedUser;
    } catch (err) {
      throw new InternalServerErrorException(
        'Something went wrong',
        err.message,
      );
    }
  }
}
