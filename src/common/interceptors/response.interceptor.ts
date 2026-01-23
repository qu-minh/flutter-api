import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { SKIP_RESPONSE_WRAP_KEY } from '../decorators/skip-response-wrap.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const skipWrap = this.reflector.getAllAndOverride<boolean>(
          SKIP_RESPONSE_WRAP_KEY,
          [context.getHandler(), context.getClass()],
        );

        if (skipWrap || data instanceof StreamableFile) {
          return data;
        }

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          success: true,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
