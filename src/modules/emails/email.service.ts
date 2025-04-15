import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly mailerService: MailerService) {
    // Nodemailer configuration
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      debug: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Original send email function using nodemailer
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'Alexin <alexindevs@gmail.com>',
      to,
      subject,
      text: body,
    });
  }

  // New method to send emails using Handlebars templates
  async sendTemplateEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      template, // e.g., 'welcome' for welcome.hbs
      context: {
        ...context,
        year: new Date().getFullYear(),
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      }, // Data to inject into the template
    });
  }
}
