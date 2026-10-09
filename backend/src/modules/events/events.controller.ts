import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import { JwtGuard, Roles } from '../auth/auth.guards';
import { EventsService } from './events.service';

@Controller()
export class EventsController {
  constructor(private svc: EventsService, private pdf: PdfService) {}

  // /api/events?when=ongoing|upcoming|completed
  @Get('events') list(@Query('when') when?: any) { return this.svc.list(when); }
  @Get('events/:slug') one(@Param('slug') slug: string) { return this.svc.bySlug(slug); }

  @Get('certificates/me') @UseGuards(JwtGuard) mine(@Req() req: any) { return this.svc.myCertificates(req.user.id); }
  @Get('certificates/:code/pdf') async certPdf(@Param('code') code: string, @Res() res: any) {
    const c = await this.svc.verify(code);
    const buf = await this.pdf.eventCertificate({ code: c.code, holderName: c.holderName, event: c.event, issuedAt: c.issuedAt });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="parbatya-certificate-${code}.pdf"` }).send(buf);
  }
  @Get('certificates/verify/:code') verify(@Param('code') code: string) { return this.svc.verify(code); }

  @Patch('admin/event-bookings/:id/attended') @UseGuards(JwtGuard) @Roles('ADMIN')
  attended(@Param('id') id: string, @Body('attended') attended: boolean) { return this.svc.markAttended(id, attended); }

  @Post('admin/events/:id/issue-certificates') @UseGuards(JwtGuard) @Roles('ADMIN')
  issue(@Param('id') id: string) { return this.svc.issueCertificates(id); }
}
