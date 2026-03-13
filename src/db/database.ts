import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hotels.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      chain TEXT NOT NULL,
      city TEXT,
      country TEXT,
      image TEXT,
      pointsPrice INTEGER,
      cashPrice REAL,
      availabilityScore INTEGER,
      category TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id TEXT NOT NULL,
      date TEXT NOT NULL,
      is_available BOOLEAN DEFAULT 0,
      points_price INTEGER,
      cash_price REAL,
      points_drop INTEGER DEFAULT 0,
      cash_drop REAL DEFAULT 0,
      scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hotel_id) REFERENCES hotels(id),
      UNIQUE(hotel_id, date)
    );
  `);
  console.log('Database initialized successfully.');
}

// Seed initial data if empty
export function seedDb() {
  const count = db.prepare('SELECT COUNT(*) as count FROM hotels').get() as { count: number };
  
  if (count.count === 0) {
    console.log('Seeding initial data...');
    
    // Insert Hotels
    const insertHotel = db.prepare(`
      INSERT INTO hotels (id, name, chain, city, country, image, pointsPrice, cashPrice, availabilityScore, category)
      VALUES (@id, @name, @chain, @city, @country, @image, @pointsPrice, @cashPrice, @availabilityScore, @category)
    `);

    const hotels = [
      {
        id: 'h1', name: 'Conrad Bora Bora Nui', chain: 'Hilton', city: 'Bora Bora', country: 'French Polynesia',
        image: 'https://picsum.photos/seed/conrad/800/600', pointsPrice: 120000, cashPrice: 10500, availabilityScore: 12, category: null
      },
      {
        id: 'h2', name: 'Alila Ventana Big Sur', chain: 'Hyatt', city: 'Big Sur', country: 'USA',
        image: 'https://picsum.photos/seed/alila/800/600', pointsPrice: 45000, cashPrice: 15400, availabilityScore: 8, category: 'Category 8'
      },
      {
        id: 'h3', name: 'The St. Regis Maldives Vommuli Resort', chain: 'Marriott', city: 'Dhaalu Atoll', country: 'Maldives',
        image: 'https://picsum.photos/seed/stregis/800/600', pointsPrice: 110000, cashPrice: 19600, availabilityScore: 25, category: null
      }
    ];

    const insertManyHotels = db.transaction((hotels) => {
      for (const hotel of hotels) insertHotel.run(hotel);
    });
    insertManyHotels(hotels);

    // Insert Availability (Generate 30 days of fake data for each hotel)
    const insertAvailability = db.prepare(`
      INSERT INTO availability (hotel_id, date, is_available, points_price, cash_price, points_drop, cash_drop)
      VALUES (@hotel_id, @date, @is_available, @points_price, @cash_price, @points_drop, @cash_drop)
    `);

    const insertManyAvailability = db.transaction((availabilities) => {
      for (const avail of availabilities) insertAvailability.run(avail);
    });

    const today = new Date();
    const availabilities = [];

    for (const hotel of hotels) {
      let currentPoints = hotel.pointsPrice;
      let currentCash = hotel.cashPrice;

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // Randomly fluctuate prices
        const pointsChange = Math.floor(Math.random() * 10000) - 5000;
        const cashChange = Math.floor(Math.random() * 1000) - 500;
        
        currentPoints = Math.max(hotel.pointsPrice * 0.7, currentPoints + pointsChange);
        currentCash = Math.max(hotel.cashPrice * 0.7, currentCash + cashChange);

        // 80% chance of being available
        const isAvailable = Math.random() > 0.2;

        availabilities.push({
          hotel_id: hotel.id,
          date: dateStr,
          is_available: isAvailable ? 1 : 0,
          points_price: isAvailable ? Math.round(currentPoints / 1000) * 1000 : null,
          cash_price: isAvailable ? Math.round(currentCash / 100) * 100 : null,
          points_drop: pointsChange < 0 ? Math.abs(pointsChange) : 0,
          cash_drop: cashChange < 0 ? Math.abs(cashChange) : 0
        });
      }
    }
    
    insertManyAvailability(availabilities);
    console.log('Seeding complete.');
  }
}

export default db;
