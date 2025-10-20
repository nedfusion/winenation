const TRANSACTPAY_BASE_URL = 'https://payment-api-service.transactpay.ai';

interface TransactpayConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
}

interface PaymentData {
  amount: number;
  email: string;
  reference: string;
  currency?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export class TransactpayService {
  private config: TransactpayConfig;

  constructor(config: TransactpayConfig) {
    this.config = config;
  }

  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `WN-${timestamp}-${random}`;
  }

  async initializePayment(data: PaymentData): Promise<any> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/transactpay-init`;

    const payload = {
      public_key: this.config.publicKey,
      secret_key: this.config.secretKey,
      encryption_key: this.config.encryptionKey,
      amount: data.amount,
      email: data.email,
      reference: data.reference,
      currency: data.currency || 'NGN',
      callback_url: data.callback_url || window.location.origin + '/payment/callback',
      metadata: data.metadata || {},
      customer_name: data.metadata?.customer_name || 'Customer',
      phone: data.metadata?.phone || '+234'
    };

    console.log('TransactPay: Initializing payment via edge function');
    console.log('TransactPay: Payment data:', {
      amount: data.amount,
      email: data.email,
      reference: data.reference,
      currency: data.currency || 'NGN'
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('TransactPay: Response status:', response.status);

      const result = await response.json();
      console.log('TransactPay: Response:', result);

      if (!response.ok || !result.status) {
        const errorMessage = result.message || result.error || 'Payment initialization failed';
        console.error('TransactPay: Error:', errorMessage);
        throw new Error(errorMessage);
      }

      return result;
    } catch (error: any) {
      console.error('TransactPay initialization error:', error);

      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to payment gateway. Please check your internet connection or try again later.');
      }

      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    const url = `${TRANSACTPAY_BASE_URL}/v1/payment/verify/${reference}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment verification failed');
      }

      return result;
    } catch (error) {
      console.error('Transactpay verification error:', error);
      throw error;
    }
  }

  openPaymentModal(paymentUrl: string): void {
    window.location.href = paymentUrl;
  }
}

export const transactpay = new TransactpayService({
  publicKey: import.meta.env.VITE_TRANSACTPAY_PUBLIC_KEY || '',
  secretKey: import.meta.env.VITE_TRANSACTPAY_SECRET_KEY || '',
  encryptionKey: import.meta.env.VITE_TRANSACTPAY_ENCRYPTION_KEY || ''
});
