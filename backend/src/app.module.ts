import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LocationsModule } from './modules/locations/locations.module';

import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

import { AuthModule } from './modules/auth/auth.module';
import { EventBookingsModule } from './modules/event-bookings/event-bookings.module';
import { EventsModule } from './modules/events/events.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TripInquiriesModule } from './modules/trip-inquiries/trip-inquiries.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({ imports: [TripInquiriesModule, ReviewsModule, SettingsModule, PdfModule, EventBookingsModule, EventsModule, AuthModule, AdminModule, PrismaModule, LocationsModule, ProductsModule, OrdersModule] })
export class AppModule {}
