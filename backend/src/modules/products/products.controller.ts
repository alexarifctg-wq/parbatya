import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  // /api/products?district=khagrachari&category=food-spices&page=1
  @Get() list(@Query() q: any) { return this.svc.list({ ...q, page: q.page && +q.page, limit: q.limit && +q.limit }); }
  @Get(':slug') one(@Param('slug') slug: string) { return this.svc.bySlug(slug); }
}
