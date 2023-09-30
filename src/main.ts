import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  ); /** A Global Pipe for input validation*/

  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 10 }),
  );

  const port = process.env.PORT || 3000;
  app.listen(port);

  logger.verbose(
    `\nApplication listening on port ${port} \nView the graphlQL playground on http://localhost:${port}/graphql/`,
  );
}
bootstrap();
