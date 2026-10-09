export interface PaymentResult { status: 'UNPAID' | 'PAID'; provider: string; reference?: string; redirectUrl?: string }

export interface PaymentProvider {
  readonly key: string;
  initiate(orderId: string, amountPaisa: number): Promise<PaymentResult>;
}

// Cash on Delivery: nothing to collect online.
export class CodProvider implements PaymentProvider {
  readonly key = 'cod';
  async initiate(): Promise<PaymentResult> { return { status: 'UNPAID', provider: 'cod' }; }
}

// Add Bkash / SSLCommerz providers here later with the same interface.
export const providers: Record<string, PaymentProvider> = { cod: new CodProvider() };
