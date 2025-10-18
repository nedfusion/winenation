const TRANSACTPAY_BASE_URL = 'https://api.transactpay.ai';

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
    const url = `${TRANSACTPAY_BASE_URL}/v1/payment/initialize`;

    const payload = {
      public_key: this.config.publicKey,
      amount: data.amount,
      email: data.email,
      reference: data.reference,
      currency: data.currency || 'NGN',
      callback_url: data.callback_url || window.location.origin + '/payment/callback',
      metadata: data.metadata || {}
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.secretKey}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment initialization failed');
      }

      return result;
    } catch (error) {
      console.error('Transactpay initialization error:', error);
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
