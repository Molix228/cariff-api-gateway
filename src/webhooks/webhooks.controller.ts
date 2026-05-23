import { Controller, Post, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('aws-sns')
  async handleSnsWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      await this.webhooksService.handleAwsSns(body);

      return res.status(200).send('OK');
    } catch (error) {
      this.logger.error('Failed to process SNS webhook', error);
      return res.status(200).send('Error handled gracefully');
    }
  }
}
