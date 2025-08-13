import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface Booking {
  id: string;
  hotel_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from<Booking>('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data);
        setLoading(false);
      });
  }, [user]);

  const cancelBooking = async (id: string) => {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
  };

  if (!user) return <p>Please login to see your dashboard.</p>;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
      {loading && <p>Loading bookings...</p>}
      {!loading && bookings.length === 0 && <p>No bookings found.</p>}
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id} className="border p-4 mb-4 rounded">
            <h2 className="text-xl font-semibold">{booking.hotel_name}</h2>
            <p>
              From: {new Date(booking.check_in_date).toLocaleDateString()} To:{' '}
              {new Date(booking.check_out_date).toLocaleDateString()}
            </p>
            <p>Status: {booking.status}</p>
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => cancelBooking(booking.id)}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Cancel Booking
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
