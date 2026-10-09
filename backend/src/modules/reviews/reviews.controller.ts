import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard, Roles } from '../auth/auth.guards';

class ReviewDto {
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsString() body!: string;
  @IsOptional() @IsIn(['SITE', 'PRODUCT', 'TOUR', 'EXPERIENCE', 'SPOT', 'HOTEL']) targetType?: any;
  @IsOptional() @IsString() targetId?: string;
}

@Controller()
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  // Public: approved reviews only (the "Happy customers" section uses target=SITE).
  @Get('reviews')
  list(@Query('target') target = 'SITE', @Query('id') id?: string) {
    return this.prisma.review.findMany({
      where: { targetType: target as any, ...(id ? { targetId: id } : {}), status: 'APPROVED' },
      include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 50,
    });
  }

  // Only a signed-in customer who has bought, booked or joined something can review.
  @Post('reviews') @UseGuards(JwtGuard)
  async create(@Req() req: any, @Body() d: ReviewDto) {
    const userId = req.user.id;
    const [orders, events, tours] = await Promise.all([
      this.prisma.order.count({ where: { userId, status: { not: 'CANCELLED' } } }),
      this.prisma.eventBooking.count({ where: { userId, status: { in: ['PARTIALLY_PAID', 'PAID'] } } }),
      this.prisma.tourBooking.count({ where: { userId, status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
    ]);
    if (orders + events + tours === 0) throw new ForbiddenException('Only customers who have booked or bought from us can leave a review');
    return this.prisma.review.create({
      data: { userId, rating: d.rating, body: d.body, targetType: d.targetType ?? 'SITE', targetId: d.targetId ?? 'parbatya' }, // starts PENDING
      select: { id: true, status: true },
    });
  }

  @Get('admin/reviews') @UseGuards(JwtGuard) @Roles('ADMIN')
  pending() { return this.prisma.review.findMany({ where: { status: 'PENDING' }, include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'asc' } }); }

  @Patch('admin/reviews/:id') @UseGuards(JwtGuard) @Roles('ADMIN')
  moderate(@Param('id') id: string, @Body('status') status: 'APPROVED' | 'REJECTED') {
    return this.prisma.review.update({ where: { id }, data: { status } });
  }
}
