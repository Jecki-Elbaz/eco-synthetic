// APS API -- NestJS entry point
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { AppConfig } from "./config/app.config.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(AppConfig);
  const port = config.port;

  await app.listen(port);
  console.log(`APS API listening on port ${port}`);
}

void bootstrap();
