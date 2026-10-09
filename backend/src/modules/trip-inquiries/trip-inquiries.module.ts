import { Module } from '@nestjs/common';
import { TripInquiriesController } from './trip-inquiries.controller';

@Module({ controllers: [TripInquiriesController] })
export class TripInquiriesModule {}
