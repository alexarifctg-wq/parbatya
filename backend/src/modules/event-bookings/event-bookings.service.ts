import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventBookingDto, PayBalanceDto } from './event-bookings.dto';

const MIN_DEPOSIT = 0.3;
const receiptNo = () => `PB-RCPT-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;

@Injectable()
export class EventBookingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventBookingDto) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: dto.eventId } });
      if (!event || event.status !== 'PUBLISHED' || event.endsAt <= new Date()) throw new BadRequestException('This event is closed');
      if (event.seats < dto.guests) throw new BadRequestException('Not enough seats left');

      const total = event.price * dto.guests;            // price always comes from the database
      const min = Math.ceil(total * MIN_DEPOSIT);
      if (dto.amount < min) throw new BadRequestException(`Pay at least 30% (${min / 100} BDT) to book`);
      if (dto.amount > total) throw new BadRequestException('Amount is more than the total');

      // TEMPORARY guest account until the web app sends the signed-in user.
      const user = await tx.user.upsert({
        where: { email: dto.email }, update: {},
        create: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash: 'GUEST-NO-LOGIN' },
      });
      await tx.event.update({ where: { id: event.id }, data: { seats: { decrement: dto.guests } } });
      const booking = await tx.eventBooking.create({
        data: { eventId: event.id, userId: user.id, guests: dto.guests, total },
      });
      // Payment starts UNPAID. A gateway callback (or an admin) confirms it; only then is the receipt valid.
      const payment = await tx.eventPayment.create({
        data: { bookingId: booking.id, receiptNo: receiptNo(), amount: dto.amount, method: dto.method },
      });
      return { booking, payment };
    });
  }

  async payBalance(bookingId: string, userId: string, dto: PayBalanceDto) {
    const b = await this.prisma.eventBooking.findUnique({ where: { id: bookingId } });
    if (!b || b.userId !== userId) throw new NotFoundException('Booking not found');
    if (dto.amount > b.total - b.paid) throw new BadRequestException('Amount is more than the balance');
    return this.prisma.eventPayment.create({ data: { bookingId, receiptNo: receiptNo(), amount: dto.amount, method: dto.method } });
  }

  // Called by the payment gateway webhook (or an admin for manual payments).
  async confirmPayment(receipt: string) {
    return this.prisma.$transaction(async (tx) => {
      const pay = await tx.eventPayment.findUnique({ where: { receiptNo: receipt }, include: { booking: true } });
      if (!pay) throw new NotFoundException('Payment not found');
      if (pay.status === 'PAID') return pay;
      const paid = pay.booking.paid + pay.amount;
      await tx.eventBooking.update({
        where: { id: pay.bookingId },
        data: { paid, status: paid >= pay.booking.total ? 'PAID' : 'PARTIALLY_PAID' },
      });
      return tx.eventPayment.update({ where: { id: pay.id }, data: { status: 'PAID', paidAt: new Date() } });
    });
  }

  mine(userId: string) {
    return this.prisma.eventBooking.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { event: { select: { title: true, slug: true, startsAt: true, endsAt: true } }, payments: true },
    });
  }

  async receipt(no: string) {
    const p = await this.prisma.eventPayment.findUnique({
      where: { receiptNo: no },
      include: { booking: { include: { event: { select: { title: true, startsAt: true } }, user: { select: { name: true } } } } },
    });
    if (!p || p.status !== 'PAID') throw new NotFoundException('Receipt not found');
    const b = p.booking;
    return {
      receiptNo: p.receiptNo, paidAt: p.paidAt, amount: p.amount, method: p.method,
      event: b.event.title, startsAt: b.event.startsAt, guests: b.guests, holder: b.user.name,
      total: b.total, paidSoFar: b.paid, balanceDue: b.total - b.paid,
    };
  }
}
