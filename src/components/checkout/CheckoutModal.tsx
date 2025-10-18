import React, { useState } from 'react';
import { X, CreditCard, MapPin, User } from 'lucide-react';
import { PaystackButton } from 'react-paystack';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { transactpay } from '../../lib/transactpay';
import { CartItem } from '../../types';

type PaymentGateway = 'paystack' | 'transactpay';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onOrderComplete 
}: CheckoutModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(profile?.address || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('transactpay');

  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  const transactpayKey = import.meta.env.VITE_TRANSACTPAY_PUBLIC_KEY || '';

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalInKobo = Math.round(total * 100);

  const createOrder = async (paymentReference: string, gateway: PaymentGateway) => {
    if (!user || !profile) return null;

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          shipping_address: shippingAddress,
          status: 'processing',
          payment_status: 'processing',
          payment_method: gateway,
          payment_reference: paymentReference
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    setLoading(true);
    try {
      const order = await createOrder(reference.reference, 'paystack');

      if (order) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            status: 'processing',
            paid_at: new Date().toISOString()
          })
          .eq('id', order.id);

        setSuccess(true);
        setTimeout(() => {
          onOrderComplete();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      setError('Payment successful but order creation failed. Please contact support with reference: ' + reference.reference);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactpayPayment = async () => {
    if (!user || !profile) return;

    setLoading(true);
    setError('');

    try {
      const reference = transactpay.generateReference();

      const paymentData = {
        amount: total,
        email: profile.email,
        reference: reference,
        currency: 'NGN',
        metadata: {
          customer_name: profile.full_name || '',
          phone: phone,
          cart_items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      };

      const order = await createOrder(reference, 'transactpay');

      if (!order) {
        throw new Error('Failed to create order');
      }

      const result = await transactpay.initializePayment(paymentData);

      if (result.status && result.data?.authorization_url) {
        transactpay.openPaymentModal(result.data.authorization_url);
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    setError('Payment cancelled');
  };

  const paystackConfig = {
    email: profile?.email || '',
    amount: totalInKobo,
    publicKey: paystackKey,
    text: 'Pay Now',
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: profile?.full_name || ''
        },
        {
          display_name: 'Phone',
          variable_name: 'phone',
          value: phone
        }
      ]
    },
    onSuccess: handlePaystackSuccess,
    onClose: handlePaymentClose
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                Payment successful! Your order has been placed.
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="text-red-600">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="080XXXXXXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your complete shipping address"
                required
              />
            </div>

            {/* Payment Gateway Selection */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Method
              </h3>
              <div className="space-y-3">
                {transactpayKey && (
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedGateway === 'transactpay'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment-gateway"
                      value="transactpay"
                      checked={selectedGateway === 'transactpay'}
                      onChange={(e) => setSelectedGateway(e.target.value as PaymentGateway)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Transactpay</p>
                      <p className="text-xs text-gray-500">Pay with card, bank transfer, or USSD</p>
                    </div>
                  </label>
                )}

                {paystackKey && (
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedGateway === 'paystack'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment-gateway"
                      value="paystack"
                      checked={selectedGateway === 'paystack'}
                      onChange={(e) => setSelectedGateway(e.target.value as PaymentGateway)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">Paystack</p>
                      <p className="text-xs text-gray-500">Secure payment with Paystack</p>
                    </div>
                  </label>
                )}
              </div>

              <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <p className="text-xs">
                  All payments are encrypted and secure. Your payment information is never stored.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || success}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {selectedGateway === 'transactpay' && transactpayKey ? (
                <button
                  type="button"
                  onClick={handleTransactpayPayment}
                  disabled={loading || success || !shippingAddress.trim() || !phone.trim()}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay with Transactpay'}
                </button>
              ) : selectedGateway === 'paystack' && paystackKey ? (
                <PaystackButton
                  {...paystackConfig}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  disabled={loading || success || !shippingAddress.trim() || !phone.trim()}
                />
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  Payment Not Configured
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}