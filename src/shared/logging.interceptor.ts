import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    // check for req AND method AND url ...
    // so you can log as HTTP
    if (req && req.method && req.url) {
      const method = req.method;
      const url = req.url;

      return call$.pipe(
        tap(() =>
          Logger.log(
            `${method} ${url} ${Date.now() - now}ms`,
            context.getClass().name,
          ),
        ),
      );
    } else {
      // else log as GraphQL
      const ctx: any = GqlExecutionContext.create(context);
      const resolverName = ctx.constructorRef.name;
      const info = ctx.getInfo();
      return call$.pipe(
        tap(() =>
          Logger.log(
            `${info.parentType} "${info.fieldName}" ${Date.now() - now}ms`,
            resolverName,
          ),
        ),
      );
    }
  }
}
