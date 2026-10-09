import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  divisions() {
    return this.prisma.division.findMany({ where: { status: 'PUBLISHED' }, orderBy: { nameEn: 'asc' } });
  }
  districts(divisionId: string) {
    return this.prisma.district.findMany({ where: { divisionId, status: 'PUBLISHED' }, orderBy: { nameEn: 'asc' } });
  }
  upazilas(districtId: string) {
    return this.prisma.upazila.findMany({ where: { districtId, status: 'PUBLISHED' }, orderBy: { nameEn: 'asc' } });
  }
  spots(upazilaId: string) {
    return this.prisma.tourismSpot.findMany({
      where: { upazilaId, status: 'PUBLISHED' },
      include: { images: { orderBy: { sort: 'asc' }, take: 1 } },
    });
  }
  async spotBySlug(slug: string) {
    const spot = await this.prisma.tourismSpot.findUnique({
      where: { slug },
      include: { images: true, upazila: { include: { district: { include: { division: true } } } } },
    });
    if (!spot || spot.status !== 'PUBLISHED') throw new NotFoundException('Tourism spot not found');
    return spot;
  }
}
