import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService, private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const raw = (req.headers.authorization ?? '').replace('Bearer ', '');
    try {
      const p = this.jwt.verify(raw);
      req.user = { id: p.sub, role: p.role };
    } catch {
      throw new UnauthorizedException('Please sign in');
    }
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (roles?.length && !roles.includes(req.user.role)) throw new ForbiddenException('Not allowed');
    return true;
  }
}
