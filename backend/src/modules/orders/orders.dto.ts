import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEmail, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class ItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export class CreateOrderDto {
  @IsString() name!: string;
  @IsString() phone!: string;
  @IsEmail() email!: string;
  @IsString() upazilaId!: string;
  @IsString() address!: string;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() couponCode?: string;
  @IsIn(['COD', 'ONLINE']) paymentMethod!: 'COD' | 'ONLINE';
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemDto) items!: ItemDto[];
}
