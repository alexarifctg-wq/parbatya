import { Module } from '@nestjs/common';
import { EventBookingsController } from './event-bookings.controller';
import { EventBookingsService } from './event-bookings.service';

@Module({ controllers: [EventBookingsController], providers: [EventBookingsService] })
export class EventBookingsModule {}
