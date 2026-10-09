import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const slug = (s: string) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

type Loc = Record<string, { bn: string; districts: Record<string, string[]> }>;
const LOC: Loc = JSON.parse(readFileSync(join(__dirname, '../data/bd-locations.json'), 'utf8'));

async function main() {
  for (const [divName, div] of Object.entries(LOC)) {
    const division = await prisma.division.upsert({
      where: { slug: slug(divName) }, update: {},
      create: { slug: slug(divName), nameEn: divName, nameBn: div.bn },
    });
    for (const [dName, upazilas] of Object.entries(div.districts)) {
      const district = await prisma.district.upsert({
        where: { slug: slug(dName) }, update: {},
        create: { slug: slug(dName), nameEn: dName, divisionId: division.id },
      });
      for (const u of upazilas) {
        // Upazila names repeat across districts (e.g. Kaliganj), so slugs include the district.
        const s = `${slug(dName)}-${slug(u)}`;
        await prisma.upazila.upsert({
          where: { slug: s }, update: {},
          create: { slug: s, nameEn: u, districtId: district.id },
        });
      }
    }
  }

  const platform = await prisma.seller.upsert({
    where: { id: 'platform-seller' }, update: {},
    create: { id: 'platform-seller', name: 'Parbatya Travels BD', isPlatform: true },
  });
  const cat = await prisma.productCategory.upsert({ where: { slug: 'food-spices' }, update: {}, create: { slug: 'food-spices', name: 'Food & Spices' } });
  await prisma.productCategory.upsert({ where: { slug: 'rice-agriculture' }, update: {}, create: { slug: 'rice-agriculture', name: 'Rice & Agriculture' } });
  await prisma.productCategory.upsert({ where: { slug: 'handicrafts' }, update: {}, create: { slug: 'handicrafts', name: 'Handicrafts' } });

  const dighinala = await prisma.upazila.findUnique({ where: { slug: 'khagrachari-dighinala' } });
  if (dighinala) {
    await prisma.product.upsert({
      where: { slug: 'jhum-chili' }, update: {},
      create: {
        slug: 'jhum-chili', name: 'Jhum Chili', categoryId: cat.id, sellerId: platform.id,
        price: 38000, weightGrams: 250, stock: 50, status: 'PUBLISHED',
        summary: 'Sample product for development.',
        origin: { create: { upazilaId: dighinala.id } },
      },
    });
  }
  await prisma.siteSetting.upsert({
    where: { key: 'nav' }, update: {},
    create: { key: 'nav', value: { home: true, explore: false, journeys: false, stories: false, events: true, unseen: true, market: true, plan: true } },
  });
  await prisma.siteSetting.upsert({
    where: { key: 'social' }, update: {},
    create: { key: 'social', value: { facebook: '', youtube: '', instagram: '', whatsapp: 'https://wa.me/8801533765235' } },
  });
  console.log('Seed complete');
}
main().finally(() => prisma.$disconnect());
