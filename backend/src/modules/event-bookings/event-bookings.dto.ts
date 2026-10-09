import { IsEmail, IsInt, IsString, Min } from 'class-validator';

export class CreateEventBookingDto {
  @IsString() eventId!: string;
  @IsInt() @Min(1) guests!: number;
  @IsInt() @Min(1) amount!: number; // paisa to pay now; the server enforces the 30% minimum
  @IsString() name!: string;
  @IsString() phone!: string;
  @IsEmail() email!: string;
  @IsString() method!: string;      // e.g. bkash, nagad, card
}

export class PayBalanceDto {
  @IsInt() @Min(1) amount!: number;
  @IsString() method!: string;
}
