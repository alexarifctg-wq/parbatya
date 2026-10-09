import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { providers } from '../payments/payment.provider';
import { CreateOrderDto } from './orders.dto';

const DELIVERY_FEE = 6000;          // paisa
const FREE_DELIVERY_OVER = 150000;  // paisa
const COUPONS: Record<string, number> = { WELCOME10: 10 }; // percent; move to DB later

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const provider = providers[dto.paymentMethod === 'COD' ? 'cod' : ''];
    if (!provider) throw new BadRequestException('Online payment is not enabled yet');

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: dto.items.map((i) => i.productId) }, status: 'PUBLISHED' },
      });
      let subtotal = 0;
      const lines = dto.items.map((i) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p) throw new BadRequestException('A product is unavailable');
        if (p.stock < i.quantity) throw new BadRequestException(`Not enough stock for ${p.name}`);
        subtotal += p.price * i.quantity; // price always comes from the database
        return { productId: p.id, quantity: i.quantity, unitPrice: p.price };
      });
      for (const l of lines) {
        await tx.product.update({ where: { id: l.productId }, data: { stock: { decrement: l.quantity } } });
      }
      const pct = COUPONS[(dto.couponCode ?? '').toUpperCase()] ?? 0;
      const discount = Math.round((subtotal * pct) / 100);
      const deliveryFee = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
      const total = subtotal - discount + deliveryFee;

      // TEMPORARY guest checkout until the web app sends the signed-in user.
      const user = await tx.user.upsert({
        where: { email: dto.email }, update: {},
        create: { email: dto.email, name: dto.name, phone: dto.phone, passwordHash: 'GUEST-NO-LOGIN' },
      });
      const address = await tx.address.create({
        data: { userId: user.id, name: dto.name, phone: dto.phone, upazilaId: dto.upazilaId, line: dto.address },
      });
      const order = await tx.order.create({
        data: {
          userId: user.id, addressId: address.id, subtotal, discount, deliveryFee, total,
          couponCode: pct ? dto.couponCode!.toUpperCase() : null, note: dto.note,
          items: { create: lines },
        },
      });
      const pay = await provider.initiate(order.id, total);
      await tx.payment.create({
        data: { orderId: order.id, method: dto.paymentMethod, provider: pay.provider, amount: total, status: pay.status },
      });
      return order;
    });
  }

  mine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: { select: { name: true, slug: true } } } }, payments: true },
    });
  }
}
