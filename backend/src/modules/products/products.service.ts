import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const withOrigin = {
  images: { orderBy: { sort: 'asc' as const } },
  category: true,
  seller: { select: { id: true, name: true } },
  origin: { include: { upazila: { include: { district: { include: { division: true } } } } } },
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  list(q: { category?: string; district?: string; upazila?: string; page?: number; limit?: number }) {
    const limit = Math.min(q.limit ?? 20, 50);
    const where: any = { status: 'PUBLISHED' };
    if (q.category) where.category = { slug: q.category };
    if (q.upazila) where.origin = { upazila: { slug: q.upazila } };
    else if (q.district) where.origin = { upazila: { district: { slug: q.district } } };
    return this.prisma.product.findMany({
      where, include: withOrigin, take: limit, skip: ((q.page ?? 1) - 1) * limit, orderBy: { createdAt: 'desc' },
    });
  }

  async bySlug(slug: string) {
    const p = await this.prisma.product.findUnique({ where: { slug }, include: withOrigin });
    if (!p || p.status !== 'PUBLISHED') throw new NotFoundException('Product not found');
    return p;
  }
}
