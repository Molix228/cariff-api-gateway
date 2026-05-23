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
      let parsedBody;

      if (typeof req.body === 'string' && req.body.length > 0) {
        parsedBody = JSON.parse(req.body);
      } else if (
        typeof req.body === 'object' &&
        req.body !== null &&
        Object.keys(req.body).length > 0
      ) {
        parsedBody = req.body;
      } else {
        const rawText = await new Promise<string>((resolve, reject) => {
          let data = '';
          req.on('data', (chunk) => {
            data += chunk.toString();
          });
          req.on('end', () => resolve(data));
          req.on('error', (err) => reject(err));
        });

        if (rawText) {
          parsedBody = JSON.parse(rawText);
        }
      }

      if (!parsedBody || !parsedBody.Type) {
        this.logger.warn(
          `Received invalid webhook payload. Parsed: ${JSON.stringify(parsedBody)}`,
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
