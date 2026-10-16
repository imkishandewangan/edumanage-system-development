import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common'
import { Observable, catchError, map, throwError } from 'rxjs'
import { ZodError } from 'zod'

export type ErrorPayload = { error: { code: string; message: string; fields?: unknown } }

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse()
    const normalized = exception instanceof ZodError ? new BadRequestException({ message: 'Please check the submitted fields.', fields: exception.flatten().fieldErrors }) : exception
    const status = normalized instanceof HttpException ? normalized.getStatus() : 500
    const raw = normalized instanceof HttpException ? normalized.getResponse() : null
    const body = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {}
    const message = typeof body.message === 'string' ? body.message : Array.isArray(body.message) ? body.message.join(', ') : normalized instanceof Error ? normalized.message : 'Internal server error'
    const code = typeof body.error === 'string' ? body.error.toUpperCase().replace(/\s+/g, '_') : status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'
    response.status(status).json({ error: { code, message, fields: body.fields } } satisfies ErrorPayload)
  }
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => ({ data })), catchError((error) => throwError(() => error)))
  }
}
