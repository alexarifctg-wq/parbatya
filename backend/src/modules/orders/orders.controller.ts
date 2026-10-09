import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/auth.guards';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private svc: OrdersService) {}
  @Post() create(@Body() dto: CreateOrderDto) { return this.svc.create(dto); }
  @Get('me') @UseGuards(JwtGuard) mine(@Req() req: any) { return this.svc.mine(req.user.id); }
}
