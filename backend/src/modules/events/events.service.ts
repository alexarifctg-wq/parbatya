import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  list(when?: 'ongoing' | 'upcoming' | 'completed') {
    const now = new Date();
    const where: any = { status: 'PUBLISHED' };
    if (when === 'ongoing') { where.startsAt = { lte: now }; where.endsAt = { gt: now }; }
    if (when === 'upcoming') where.startsAt = { gt: now };
    if (when === 'completed') where.endsAt = { lte: now };
    return this.prisma.event.findMany({ where, orderBy: { startsAt: 'asc' }, take: 50 });
  }

  async bySlug(slug: string) {
    const e = await this.prisma.event.findUnique({ where: { slug } });
    if (!e || e.status !== 'PUBLISHED') throw new NotFoundException('Event not found');
    return e;
  }

  // Public: anyone can check a certificate code.
  async verify(code: string) {
    const c = await this.prisma.certificate.findUnique({ where: { code }, include: { event: { select: { title: true, endsAt: true } } } });
    if (!c) throw new NotFoundException('Certificate not found');
    return { valid: true, holderName: c.holderName, event: c.event.title, completedOn: c.event.endsAt, issuedAt: c.issuedAt, code: c.code };
  }

  myCertificates(userId: string) {
    return this.prisma.certificate.findMany({ where: { userId }, include: { event: { select: { title: true, slug: true, endsAt: true } } }, orderBy: { issuedAt: 'desc' } });
  }

  markAttended(bookingId: string, attended = true) {
    return this.prisma.eventBooking.update({ where: { id: bookingId }, data: { attended } });
  }

  // Admin: after the event has ended, issue a certificate to everyone marked as attended.
  async issueCertificates(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.endsAt > new Date()) throw new NotFoundException('The event has not ended yet');
    // Only fully paid, attended bookings get a certificate.
    const regs = await this.prisma.eventBooking.findMany({ where: { eventId, attended: true, status: 'PAID' }, include: { user: true } });
    let issued = 0;
    for (const r of regs) {
      const code = `PB-${event.endsAt.getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
      const made = await this.prisma.certificate.upsert({
        where: { eventId_userId: { eventId, userId: r.userId } },
        update: {}, create: { code, eventId, userId: r.userId, holderName: r.user.name },
      });
      if (made.code === code) issued++;
    }
    return { attendees: regs.length, newlyIssued: issued };
  }
}
