import { addDays, format } from 'date-fns';
import { Hotel, HotelAvailability, DayAvailability } from '../types';

export const MOCK_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'Conrad Bora Bora Nui',
    chain: 'Hilton',
    city: 'Bora Bora',
    country: 'French Polynesia',
    image: 'https://picsum.photos/seed/conrad/800/600',
    pointsPrice: 120000,
    cashPrice: 10500, // RMB
    availabilityScore: 12,
  },
  {
    id: 'h2',
    name: 'Alila Ventana Big Sur',
    chain: 'Hyatt',
    city: 'Big Sur',
    country: 'USA',
    image: 'https://picsum.photos/seed/alila/800/600',
    pointsPrice: 45000,
    cashPrice: 15400, // RMB
    availabilityScore: 8,
    category: 'Category 8',
  },
  {
    id: 'h3',
    name: 'The St. Regis Maldives Vommuli Resort',
    chain: 'Marriott',
    city: 'Dhaalu Atoll',
    country: 'Maldives',
    image: 'https://picsum.photos/seed/stregis/800/600',
    pointsPrice: 110000,
    cashPrice: 19600, // RMB
    availabilityScore: 25,
  },
  {
    id: 'h4',
    name: 'InterContinental Thalasso-Spa Bora Bora',
    chain: 'IHG',
    city: 'Bora Bora',
    country: 'French Polynesia',
    image: 'https://picsum.photos/seed/ihgbora/800/600',
    pointsPrice: 120000,
    cashPrice: 12600, // RMB
    availabilityScore: 5,
  },
  {
    id: 'h5',
    name: 'Park Hyatt Kyoto',
    chain: 'Hyatt',
    city: 'Kyoto',
    country: 'Japan',
    image: 'https://picsum.photos/seed/kyoto/800/600',
    pointsPrice: 40000,
    cashPrice: 11200, // RMB
    availabilityScore: 18,
    category: 'Category 8',
  },
  {
    id: 'h6',
    name: 'Waldorf Astoria Maldives Ithaafushi',
    chain: 'Hilton',
    city: 'South Male Atoll',
    country: 'Maldives',
    image: 'https://picsum.photos/seed/waldorf/800/600',
    pointsPrice: 150000,
    cashPrice: 22400, // RMB
    availabilityScore: 15,
  }
];

export const generateAvailability = (hotel: Hotel): HotelAvailability => {
  const days: DayAvailability[] = [];
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const currentDate = addDays(today, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Random availability based on the score
    const isAvailable = Math.random() * 100 < hotel.availabilityScore;
    
    // Add some variance to cash price (RMB)
    const cashVariance = hotel.cashPrice * (0.8 + Math.random() * 0.4);
    
    // Simulate drops occasionally
    const hasPointsDrop = isAvailable && Math.random() > 0.95;
    const hasCashDrop = isAvailable && Math.random() > 0.95;
    
    days.push({
      date: dateStr,
      available: isAvailable,
      points: hasPointsDrop ? hotel.pointsPrice - (Math.floor(Math.random() * 5 + 1) * 5000) : hotel.pointsPrice,
      cash: Math.round(cashVariance),
      pointsDrop: hasPointsDrop ? (Math.floor(Math.random() * 5 + 1) * 5000) : undefined,
      cashDrop: hasCashDrop ? Math.floor(Math.random() * 500 + 100) : undefined,
    });
  }
  
  return {
    hotelId: hotel.id,
    days,
  };
};

// Pre-generate for all hotels
export const MOCK_AVAILABILITY: Record<string, HotelAvailability> = {};
MOCK_HOTELS.forEach(hotel => {
  MOCK_AVAILABILITY[hotel.id] = generateAvailability(hotel);
});
