/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TRANSACTPAY_PUBLIC_KEY: string
  readonly VITE_TRANSACTPAY_SECRET_KEY: string
  readonly VITE_TRANSACTPAY_ENCRYPTION_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface TransactPayCheckoutConfig {
  firstName: string;
  lastName: string;
  mobile: string;
  country: string;
  email: string;
  currency: string;
  amount: number;
  reference: string;
  merchantReference: string;
  description: string;
  apiKey: string;
  encryptionKey: string;
  onCompleted: (data: any) => void;
  onClose: () => void;
  onError: (error: any) => void;
}

interface PaymentCheckout {
  init(): void;
}

interface CheckoutNS {
  PaymentCheckout: new (config: TransactPayCheckoutConfig) => PaymentCheckout;
}

interface Window {
  CheckoutNS: CheckoutNS;
}
