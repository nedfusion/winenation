interface TransactpayConfig {
  publicKey: string;
  encryptionKey: string;
}

interface PaymentData {
  amount: number;
  email: string;
  reference: string;
  currency?: string;
  metadata?: {
    customer_name?: string;
    phone?: string;
    [key: string]: any;
  };
}

interface PaymentResult {
  status: 'success' | 'cancelled' | 'error';
  message: string;
  data?: any;
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

  async initializePayment(data: PaymentData): Promise<PaymentResult> {
    return new Promise((resolve) => {
      try {
        if (!window.CheckoutNS) {
          throw new Error('TransactPay SDK not loaded. Please refresh the page.');
        }

        const nameParts = (data.metadata?.customer_name || 'Customer Name').split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'Name';

        console.log('TransactPay SDK: Initializing payment');
        console.log('Amount:', data.amount, 'kobo');
        console.log('Reference:', data.reference);

        const Checkout = new window.CheckoutNS.PaymentCheckout({
          firstName: firstName,
          lastName: lastName,
          mobile: data.metadata?.phone || '+2348000000000',
          country: 'NG',
          email: data.email,
          currency: data.currency || 'NGN',
          amount: data.amount,
          reference: data.reference,
          merchantReference: data.reference,
          description: data.metadata?.description || 'WineNation Order Payment',
          apiKey: this.config.publicKey,
          encryptionKey: this.config.encryptionKey,
          onCompleted: (result) => {
            console.log('Payment completed:', result);
            if (result?.status?.toLowerCase() === 'successful') {
              resolve({
                status: 'success',
                message: 'Payment successful',
                data: result
              });
            } else {
              resolve({
                status: 'error',
                message: 'Payment not successful. Please try again.',
                data: result
              });
            }
          },
          onClose: () => {
            console.log('Payment modal closed');
            resolve({
              status: 'cancelled',
              message: 'Payment cancelled by user'
            });
          },
          onError: (error) => {
            console.error('Payment error:', error);
            resolve({
              status: 'error',
              message: error?.message || 'Payment failed. Please try again.',
              data: error
            });
          }
        });

        Checkout.init();

      } catch (error: any) {
        console.error('TransactPay initialization error:', error);
        resolve({
          status: 'error',
          message: error.message || 'Failed to initialize payment'
        });
      }
    });
  }

  async verifyPayment(reference: string): Promise<any> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const url = `${supabaseUrl}/functions/v1/transactpay-webhook`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference })
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
}

export const transactpay = new TransactpayService({
  publicKey: import.meta.env.VITE_TRANSACTPAY_PUBLIC_KEY || '',
  encryptionKey: import.meta.env.VITE_TRANSACTPAY_ENCRYPTION_KEY || ''
});
