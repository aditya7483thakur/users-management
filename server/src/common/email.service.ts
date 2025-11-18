import { Injectable, Logger } from '@nestjs/common';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor(private readonly appConfigService: AppConfigService) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey =
      this.appConfigService.brevoApiKey;

    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendEmail(email: string, subject: string, htmlContent: string) {
    if (this.appConfigService.nodeEnv === 'test') {
      this.logger.log(
        `[TEST MODE] Email sent to ${email} with subject: ${subject}`,
      );
      return;
    }

    try {
      const req = await this.apiInstance.sendTransacEmail({
        to: [{ email }],
        sender: {
          name: 'Control Panel',
          email: 'aditya.kumar@myrealdata.in',
        },
        subject,
        htmlContent,
      });

      this.logger.log(`✅ Email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email to ${email}: ${error.message}`,
      );
      throw error;
    }
  }
}
