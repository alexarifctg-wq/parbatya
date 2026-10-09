import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtGuard, Roles } from '../auth/auth.guards';

class InquiryDto {
  @IsString() destination!: string;
  @IsInt() @Min(1) @Max(200) people!: number;
  @IsOptional() @IsDateString() travelDate?: string;
  @IsOptional() @IsBoolean() dateFlexible?: boolean;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() bestTime?: string;
}

@Controller()
export class TripInquiriesController {
  constructor(private prisma: PrismaService) {}

  // Public: saved when a visitor finishes the "where, how many, when" questions.
  @Post('trip-inquiries')
  create(@Body() d: InquiryDto) {
    return this.prisma.tripInquiry.create({
      data: { ...d, travelDate: d.travelDate ? new Date(d.travelDate) : null },
      select: { id: true },
    });
  }

  @Get('admin/trip-inquiries') @UseGuards(JwtGuard) @Roles('ADMIN')
  list() { return this.prisma.tripInquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }); }

  @Patch('admin/trip-inquiries/:id/contacted') @UseGuards(JwtGuard) @Roles('ADMIN')
  contacted(@Param('id') id: string) { return this.prisma.tripInquiry.update({ where: { id }, data: { contacted: true } }); }
}
