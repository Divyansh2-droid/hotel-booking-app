import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function BookingSuccess() {
  const router = useRouter();
  const { session_id } = router.query;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session_id) return;
    if (!user) {
      setError('You must be logged in to verify your booking.');
      setLoading(false);
      return;
    }

    async function verifyBooking() {
      setLoading(true);
      try {
        const res = await axios.post('/api/verify-booking', { sessionId: session_id });
        if (res.data.success) {
          setSuccess(true);
        } else {
          setError(res.data.error || 'Failed to verify booking.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Error verifying booking.');
      }
      setLoading(false);
    }

    verifyBooking();
  }, [session_id, user]);

  if (loading) {
    return (
      <main className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <p className="text-xl text-indigo-600">Verifying your booking...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl">{error}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 min-h-screen flex flex-col items-center justify-center bg-white">
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg shadow-md text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="mb-4">Thank you, {user.email}, for your booking.</p>
          <p className="mb-6">Your payment has been successfully processed in test mode.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 transition"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <p className="text-red-600 text-xl">Failed to confirm your booking.</p>
      )}
    </main>
  );
}
