import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private token(u: { id: string; role: string }) {
    return this.jwt.sign({ sub: u.id, role: u.role });
  }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing && existing.passwordHash !== 'GUEST-NO-LOGIN') throw new ConflictException('Email already registered');
    // A guest checkout account is claimed here, so earlier orders appear in My Orders.
    const user = existing
      ? await this.prisma.user.update({ where: { id: existing.id }, data: { passwordHash: hash, name: dto.name } })
      : await this.prisma.user.create({ data: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash: hash } });
    return { token: this.token(user), user: { id: user.id, name: user.name, role: user.role } };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.passwordHash === 'GUEST-NO-LOGIN' || !(await bcrypt.compare(dto.password, user.passwordHash)))
      throw new UnauthorizedException('Wrong email or password');
    return { token: this.token(user), user: { id: user.id, name: user.name, role: user.role } };
  }
}
