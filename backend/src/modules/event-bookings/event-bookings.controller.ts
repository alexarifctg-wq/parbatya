import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import { JwtGuard, Roles } from '../auth/auth.guards';
import { CreateEventBookingDto, PayBalanceDto } from './event-bookings.dto';
import { EventBookingsService } from './event-bookings.service';

@Controller()
export class EventBookingsController {
  constructor(private svc: EventBookingsService, private pdf: PdfService) {}

  @Post('event-bookings') create(@Body() dto: CreateEventBookingDto) { return this.svc.create(dto); }
  @Get('event-bookings/me') @UseGuards(JwtGuard) mine(@Req() req: any) { return this.svc.mine(req.user.id); }
  @Post('event-bookings/:id/pay') @UseGuards(JwtGuard) pay(@Param('id') id: string, @Req() req: any, @Body() dto: PayBalanceDto) { return this.svc.payBalance(id, req.user.id, dto); }
  @Get('receipts/:no') receipt(@Param('no') no: string) { return this.svc.receipt(no); }
  @Get('receipts/:no/pdf') async receiptPdf(@Param('no') no: string, @Res() res: any) {
    const r = await this.svc.receipt(no);
    const buf = await this.pdf.receipt({ ...r, holder: r.holder, balanceDue: r.balanceDue });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="parbatya-receipt-${no}.pdf"` }).send(buf);
  }

  // Placeholder for the gateway webhook. Admin-only until a real provider is connected.
  @Post('admin/event-payments/:no/confirm') @UseGuards(JwtGuard) @Roles('ADMIN') confirm(@Param('no') no: string) { return this.svc.confirmPayment(no); }
}
