import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('aws-sns')
  async handleSnsWebhook(@Req() req: any, @Res() res: Response) {
    try {
      let parsedBody = req.body;

      if (req.rawBody && Object.keys(parsedBody).length === 0) {
        const rawString = req.rawBody.toString('utf8');
        parsedBody = JSON.parse(rawString);
      }

      if (!parsedBody || !parsedBody.Type) {
        this.logger.warn(
          'Received invalid webhook payload. Payload: ' +
            JSON.stringify(parsedBody),
        );
        return res.status(200).send('Ignored');
      }

      await this.webhooksService.handleAwsSns(parsedBody);

      return res.status(200).send('OK');
    } catch (error) {
      this.logger.error('Failed to process SNS webhook', error);
      return res.status(200).send('Error handled gracefully');
    }
  }
}
