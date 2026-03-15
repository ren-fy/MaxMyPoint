import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a new PostgreSQL connection pool
// It uses environment variables (PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT) by default
// Or you can use a connection string: DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL if explicitly requested via environment variable, or if it's a known remote host (like Supabase)
  ssl: (process.env.PGSSLMODE === 'require' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.com'))) 
    ? { rejectUnauthorized: false } 
    : undefined
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema
export async function initDb() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS hotels (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          chain VARCHAR(50) NOT NULL,
          city VARCHAR(100),
          country VARCHAR(100),
          image TEXT,
          points_price INTEGER,
          cash_price DECIMAL(10, 2),
          availability_score INTEGER,
          category VARCHAR(50),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS availability (
          id SERIAL PRIMARY KEY,
          hotel_id VARCHAR(50) REFERENCES hotels(id),
          date DATE NOT NULL,
          is_available BOOLEAN DEFAULT FALSE,
          points_price INTEGER,
          cash_price DECIMAL(10, 2),
          points_drop INTEGER DEFAULT 0,
          cash_drop DECIMAL(10, 2) DEFAULT 0,
          scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(hotel_id, date)
        );
      `);
      console.log('PostgreSQL database schema initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error connecting to or initializing database schema:', err);
  }
}

// Seed initial data if empty
export async function seedDb() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT COUNT(*) FROM hotels');
      const count = parseInt(res.rows[0].count, 10);

      if (count === 0) {
        console.log('Seeding initial data to PostgreSQL...');
        
        // Insert Hotels
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

        for (const hotel of hotels) {
          await client.query(`
            INSERT INTO hotels (id, name, chain, city, country, image, points_price, cash_price, availability_score, category)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING
          `, [hotel.id, hotel.name, hotel.chain, hotel.city, hotel.country, hotel.image, hotel.pointsPrice, hotel.cashPrice, hotel.availabilityScore, hotel.category]);
        }

        // Insert Availability (Generate 30 days of fake data for each hotel)
        const today = new Date();
        
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

            await client.query(`
              INSERT INTO availability (hotel_id, date, is_available, points_price, cash_price, points_drop, cash_drop)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (hotel_id, date) DO NOTHING
            `, [
              hotel.id,
              dateStr,
              isAvailable,
              isAvailable ? Math.round(currentPoints / 1000) * 1000 : null,
              isAvailable ? Math.round(currentCash / 100) * 100 : null,
              pointsChange < 0 ? Math.abs(pointsChange) : 0,
              cashChange < 0 ? Math.abs(cashChange) : 0
            ]);
          }
        }
        console.log('Seeding complete.');
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

export default pool;
