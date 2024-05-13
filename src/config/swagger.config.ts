import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API NestJS')
  .setDescription(
    'Ready-to-use Nest Js template with advanced feature configuration',
  )
  .setVersion('1.0')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();
