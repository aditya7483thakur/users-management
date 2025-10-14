import SibApiV3Sdk from 'sib-api-v3-sdk';

export async function sendEmail(
  email: string,
  subject: string,
  htmlContent: string,
) {
  console.log(process.env.BREVO_API_KEY);
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  await apiInstance.sendTransacEmail({
    to: [{ email }],
    sender: { name: 'Control Panel', email: 'aditya.kumar@myrealdata.in' },
    subject,
    htmlContent,
  });

  console.log(`✅ Email sent to ${email}`);
}
