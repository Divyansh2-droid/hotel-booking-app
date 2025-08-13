import { useEffect, useRef, useState } from "react";
import axios from "axios";

interface Hotel {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  photos?: { photo_reference: string }[];
}

declare global {
  interface Window {
    google: any;
  }
}

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("");
  const autocompleteRef = useRef<HTMLInputElement | null>(null);
  const autocompleteObj = useRef<any>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => initAutocomplete();
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    if (autocompleteRef.current && !autocompleteObj.current) {
      autocompleteObj.current = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        { types: ["(regions)"] }
      );
      autocompleteObj.current.addListener("place_changed", onPlaceChanged);
    }
  };

  const onPlaceChanged = () => {
    const place = autocompleteObj.current.getPlace();
    if (!place.geometry) {
      setError("Please select a valid location from the dropdown.");
      return;
    }
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setLocationName(place.formatted_address || place.name || "");
    fetchHotels(lat, lng);
  };

  const fetchHotels = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/googlePlaces", { params: { lat, lng } });
      if (res.data.status === "OK" && res.data.results.length > 0) {
        setHotels(res.data.results);
      } else if (res.data.status === "ZERO_RESULTS") {
        setHotels([]);
        setError("No hotels found in this area.");
      } else {
        setHotels([]);
        setError("Failed to fetch hotels.");
      }
    } catch {
      setHotels([]);
      setError("Failed to fetch hotels.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchHotels(pos.coords.latitude, pos.coords.longitude),
        () => {}
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[28rem] bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          backgroundImage:
            "url('https://wallpaperbat.com/img/9672066-amazing-night-wallpaper-dark.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            Discover Stays Near You
          </h1>
          <p className="mb-6 text-lg drop-shadow">
            Find and book your perfect hotel stay in seconds.
          </p>

          {/* Search Box */}
          <div className="flex justify-center max-w-xl mx-auto relative">
            <svg
              className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              width="22"
              height="22"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
            <input
              type="text"
              ref={autocompleteRef}
              placeholder="Search hotels by city, landmark, or area..."
              className="pl-12 pr-6 py-4 rounded-l-full w-full text-gray-900 text-lg placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-indigo-500 shadow-lg"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
            <button
              onClick={() => {
                if (autocompleteObj.current) {
                  const place = autocompleteObj.current.getPlace();
                  if (place && place.geometry) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    fetchHotels(lat, lng);
                  }
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-r-full text-lg shadow-md transition"
            >
              Search
            </button>
          </div>
          {error && <p className="mt-4 text-red-300 font-semibold">{error}</p>}
        </div>
      </section>

      {/* Hotels Section */}
      <section className="container mx-auto p-6">
        <h2 className="text-4xl font-bold mb-8 border-b pb-2 border-gray-300 text-gray-900">
          Hotels Near You
        </h2>

        {loading && <p className="text-center text-lg text-gray-700">Loading hotels...</p>}
        {!loading && error && <p className="text-center text-red-600 text-lg my-10">{error}</p>}
        {!loading && !error && hotels.length === 0 && (
          <p className="text-center text-gray-600 text-lg my-10">No hotels to display.</p>
        )}

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {hotels.map((hotel) => {
            const price = Math.floor(50 + Math.random() * 200);
            return (
              <div
                key={hotel.place_id}
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => (window.location.href = `/hotel/${hotel.place_id}`)}
              >
                {hotel.photos?.[0] ? (
                  <div className="relative h-48">
                    <img
                      src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${hotel.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-lg flex items-center space-x-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.04 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
                      </svg>
                      <span>{hotel.rating ?? "N/A"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-medium">
                    No Image Available
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between p-5 space-y-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 truncate">
                      {hotel.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{hotel.vicinity}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-indigo-600 font-bold text-lg">${price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Booking feature coming soon for ${hotel.name}`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
