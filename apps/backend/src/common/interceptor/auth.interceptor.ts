/**
 * NOTE: Interceptors offer a set of capabilities inspired by the
 * Aspect Oriented Programming (AOP) technique. They make it possible to:
 *
 * - bind extra logic before or after method execution
 * - transform the result returned from a function
 * - transform the exception thrown from a function
 * - extend the basic function behavior
 * - completely override a function depending on specific conditions (e.g., for caching purposes)
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Observable } from "rxjs"

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle()
  }
}
