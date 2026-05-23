import { Injectable, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly userService: UserService) {}

  async handleAwsSns(body: any) {
    const type = body.Type;

    if (type === 'SubscriptionConfirmation') {
      const subscribeUrl = body.SubscribeURL;
      try {
        await fetch(subscribeUrl);
      } catch (error) {
        this.logger.error('Error confirming SNS subscription', error);
      }
      return;
    }

    if (type === 'Notification') {
      const message = JSON.parse(body.Message);
      const notificationType = message.notificationType;

      if (notificationType === 'Bounce') {
        const bounceType = message.bounce.bounceType;
        if (bounceType === 'Permanent') {
          const bouncedEmails = message.bounce.bouncedRecipients.map(
            (r: any) => r.emailAddress,
          );
          for (const email of bouncedEmails) {
            this.userService.emitEmailBounced(email);
          }
        }
      }

      if (notificationType === 'Complaint') {
        const complainedEmails = message.complaint.complainedRecipients.map(
          (r: any) => r.emailAddress,
        );
        for (const email of complainedEmails) {
          this.userService.emitEmailComplaint(email);
        }
      }
    }
  }
}
