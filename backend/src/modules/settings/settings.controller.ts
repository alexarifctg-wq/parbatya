import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard, Roles } from '../auth/auth.guards';

const KEYS = ['nav', 'social'];

@Controller()
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  // Public: the website reads these to decide which menu items and social buttons to show.
  @Get('settings')
  async all() {
    const rows = await this.prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  // Admin panel: e.g. PUT /api/admin/settings/nav  { "value": { "journeys": true, ... } }
  @Put('admin/settings/:key') @UseGuards(JwtGuard) @Roles('ADMIN')
  async set(@Param('key') key: string, @Body('value') value: any) {
    if (!KEYS.includes(key)) return { error: 'Unknown setting' };
    return this.prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}
