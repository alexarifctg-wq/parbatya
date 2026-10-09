import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard, Roles } from '../auth/auth.guards';

class StatusDto {
  @IsOptional() @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']) status?: any;
  @IsOptional() @IsEnum(['NOT_SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED']) delivery?: any;
}

@Controller('admin')
@UseGuards(JwtGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('dashboard') @Roles('ADMIN')
  async dashboard() {
    const [users, orders, pendingOrders, products, spots, bookings, revenue] = await Promise.all([
      this.prisma.user.count(), this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count(), this.prisma.tourismSpot.count(),
      this.prisma.tourBooking.count({ where: { status: 'PENDING' } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    ]);
    return { users, orders, pendingOrders, products, spots, pendingBookings: bookings, revenue: revenue._sum.total ?? 0 };
  }

  @Get('orders') @Roles('ADMIN')
  orders(@Query('status') status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status: status as any } : {}, orderBy: { createdAt: 'desc' }, take: 100,
      include: { user: { select: { name: true, email: true, phone: true } }, address: true, items: true, payments: true },
    });
  }

  @Patch('orders/:id/status') @Roles('ADMIN')
  setStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.prisma.order.update({ where: { id }, data: { status: dto.status, delivery: dto.delivery } });
  }

  @Patch('products/:id/publish') @Roles('ADMIN')
  publish(@Param('id') id: string, @Body('published') published: boolean) {
    return this.prisma.product.update({ where: { id }, data: { status: published ? 'PUBLISHED' : 'DRAFT' } });
  }
}
