import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { transactpay } from '../lib/transactpay';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');

    if (!reference) {
      setStatus('failed');
      setMessage('Invalid payment reference');
      return;
    }

    try {
      if (status === 'successful' || status === 'success') {
        const result = await transactpay.verifyPayment(reference);

        if (result.status === 'success' && result.data?.status === 'success') {
          const { error } = await supabase
            .from('orders')
            .update({
              payment_status: 'completed',
              status: 'processing',
              paid_at: new Date().toISOString()
            })
            .eq('payment_reference', reference);

          if (error) {
            throw error;
          }

          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');

          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        setStatus('failed');
        setMessage('Payment was not successful. Please try again.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Unable to verify payment. Please contact support if money was deducted.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
