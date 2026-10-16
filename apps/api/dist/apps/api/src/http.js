"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : 500;
        const raw = exception instanceof common_1.HttpException ? exception.getResponse() : null;
        const body = typeof raw === 'object' && raw !== null ? raw : {};
        const message = typeof body.message === 'string' ? body.message : Array.isArray(body.message) ? body.message.join(', ') : exception instanceof Error ? exception.message : 'Internal server error';
        const code = typeof body.error === 'string' ? body.error.toUpperCase().replace(/\s+/g, '_') : status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR';
        response.status(status).json({ error: { code, message, fields: body.fields } });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
let ResponseInterceptor = class ResponseInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, rxjs_1.map)((data) => ({ data })), (0, rxjs_1.catchError)((error) => (0, rxjs_1.throwError)(() => error)));
    }
};
exports.ResponseInterceptor = ResponseInterceptor;
exports.ResponseInterceptor = ResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseInterceptor);
