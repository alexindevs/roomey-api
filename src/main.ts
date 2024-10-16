import { config } from 'dotenv';
config({});
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { xssMiddleware } from './core/middlewares/xss.middleware';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(helmet({ xssFilter: true }));
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://cloudinary.com'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    }),
  );

  app.enableCors({ origin: '*' });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(xssMiddleware);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
