import { Controller, Post, Req, Res, Logger, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('aws-sns')
  async handleSnsWebhook(@Body() body: any, @Res() res: Response) {
    try {
      if (!body || !body.Type) {
        this.logger.warn('Received invalid webhook payload');
        return res.status(200).send('Ignored');
      }

      await this.webhooksService.handleAwsSns(body);

      return res.status(200).send('OK');
    } catch (error) {
      this.logger.error('Failed to process SNS webhook', error);
      return res.status(200).send('Error handled gracefully');
    }
  }
}
