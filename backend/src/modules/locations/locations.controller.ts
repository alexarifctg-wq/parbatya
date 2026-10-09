import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller()
export class LocationsController {
  constructor(private svc: LocationsService) {}

  @Get('divisions') divisions() { return this.svc.divisions(); }
  @Get('divisions/:id/districts') districts(@Param('id') id: string) { return this.svc.districts(id); }
  @Get('districts/:id/upazilas') upazilas(@Param('id') id: string) { return this.svc.upazilas(id); }
  @Get('upazilas/:id/tourism-spots') spots(@Param('id') id: string) { return this.svc.spots(id); }
  @Get('tourism-spots/:slug') spot(@Param('slug') slug: string) { return this.svc.spotBySlug(slug); }
}
