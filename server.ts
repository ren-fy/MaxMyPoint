import express from "express";
import { createServer as createViteServer } from "vite";
import pool, { initDb, seedDb } from "./src/db/postgres.js";
import { calculateMetrics } from "./src/utils/calculator.js";

// Initialize PostgreSQL database
initDb().then(() => {
  seedDb();
});

// In-memory storage for calculations and alerts (can be moved to DB later)
let savedCalculations: any[] = [];
let savedAlerts: any[] = [
  {
    id: '1',
    hotelName: 'Conrad Bora Bora Nui',
    chain: 'Hilton',
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    maxPoints: 120000,
    maxCash: 800,
    active: true,
  },
  {
    id: '2',
    hotelName: 'Park Hyatt Kyoto',
    chain: 'Hyatt',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    maxPoints: 45000,
    maxCash: 1000,
    active: false,
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // --- API Routes ---
  
  // 1. Search hotels with dynamic metrics calculation
  app.post("/api/hotels/search", async (req, res) => {
    const { filters, userSettings } = req.body;
    
    try {
      // Base query for hotels
      let hotelQuery = 'SELECT * FROM hotels WHERE 1=1';
      const hotelParams: any[] = [];
      let paramIndex = 1;

      if (filters.chain) {
        hotelQuery += ` AND chain = $${paramIndex}`;
        hotelParams.push(filters.chain);
        paramIndex++;
      }

      if (filters.query) {
        hotelQuery += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(city) LIKE $${paramIndex} OR LOWER(country) LIKE $${paramIndex})`;
        hotelParams.push(`%${filters.query.toLowerCase()}%`);
        paramIndex++;
      }

      let hotels = [];
      let availResultRows = [];

      try {
        const hotelsResult = await pool.query(hotelQuery, hotelParams);
        hotels = hotelsResult.rows;

        if (hotels.length > 0) {
          // Base query for availability
          let availQuery = `
            SELECT hotel_id, TO_CHAR(date, 'YYYY-MM-DD') as date, is_available as available, points_price as points, cash_price as cash, points_drop as "pointsDrop", cash_drop as "cashDrop"
            FROM availability
            WHERE hotel_id = ANY($1) AND is_available = true
          `;
          const availParams: any[] = [hotels.map(h => h.id)];
          let availParamIndex = 2;

          if (filters.startDate) {
            availQuery += ` AND date >= $${availParamIndex}`;
            availParams.push(filters.startDate);
            availParamIndex++;
          } else {
            availQuery += ` AND date >= CURRENT_DATE`;
          }

          if (filters.endDate) {
            availQuery += ` AND date <= $${availParamIndex}`;
            availParams.push(filters.endDate);
            availParamIndex++;
          }

          availQuery += ` ORDER BY hotel_id, date ASC`;

          const availResult = await pool.query(availQuery, availParams);
          availResultRows = availResult.rows;
        }
      } catch (dbError) {
        console.warn("Database connection failed, using mock data for preview:", dbError.message);
        
        // Fallback mock data for preview environment
        const mockHotels = [
          {
            id: 'h1', name: 'Conrad Bora Bora Nui', chain: 'Hilton', city: 'Bora Bora', country: 'French Polynesia',
            image: 'https://picsum.photos/seed/conrad/800/600', points_price: 120000, cash_price: 10500, availability_score: 12, category: null
          },
          {
            id: 'h2', name: 'Alila Ventana Big Sur', chain: 'Hyatt', city: 'Big Sur', country: 'USA',
            image: 'https://picsum.photos/seed/alila/800/600', points_price: 45000, cash_price: 15400, availability_score: 8, category: 'Category 8'
          },
          {
            id: 'h3', name: 'The St. Regis Maldives Vommuli Resort', chain: 'Marriott', city: 'Dhaalu Atoll', country: 'Maldives',
            image: 'https://picsum.photos/seed/stregis/800/600', points_price: 110000, cash_price: 19600, availability_score: 25, category: null
          }
        ];
        
        hotels = mockHotels.filter(h => {
          if (filters.chain && h.chain !== filters.chain) return false;
          if (filters.query) {
            const q = filters.query.toLowerCase();
            return h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q);
          }
          return true;
        });

        // Generate mock availability
        const today = new Date();
        for (const hotel of hotels) {
          let currentPoints = hotel.points_price;
          let currentCash = hotel.cash_price;
          for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            if (filters.startDate && dateStr < filters.startDate) continue;
            if (filters.endDate && dateStr > filters.endDate) continue;

            const isAvailable = Math.random() > 0.2;
            if (isAvailable) {
              availResultRows.push({
                hotel_id: hotel.id,
                date: dateStr,
                available: true,
                points: Math.round(currentPoints / 1000) * 1000,
                cash: Math.round(currentCash / 100) * 100,
                pointsDrop: 0,
                cashDrop: 0
              });
            }
          }
        }
      }

      if (hotels.length === 0) {
        return res.json([]);
      }

      // Group availability by hotel
      const availabilityByHotel: Record<string, any[]> = {};
      for (const row of availResultRows) {
        if (!availabilityByHotel[row.hotel_id]) {
          availabilityByHotel[row.hotel_id] = [];
        }
        availabilityByHotel[row.hotel_id].push({
          date: row.date,
          available: row.available,
          points: row.points ? parseInt(row.points, 10) : null,
          cash: row.cash ? parseFloat(row.cash) : null,
          pointsDrop: row.pointsDrop ? parseInt(row.pointsDrop, 10) : 0,
          cashDrop: row.cashDrop ? parseFloat(row.cashDrop) : 0
        });
      }

      const result = [];

      for (const hotel of hotels) {
        const validDays = availabilityByHotel[hotel.id] || [];

        if ((filters.startDate || filters.endDate) && validDays.length === 0) {
          continue;
        }

        const metrics = {
          minPoints: Infinity,
          minPointsDate: undefined as string | undefined,
          minCash: Infinity,
          minCashDate: undefined as string | undefined,
          minNetCost: Infinity,
          minNetCostDate: undefined as string | undefined,
          maxReturnPoints: 0,
          maxReturnPointsDate: undefined as string | undefined,
          maxReturnRate: 0,
          maxReturnRateDate: undefined as string | undefined,
          maxCpp: 0,
          maxCppDate: undefined as string | undefined,
          fifthNightFree: null as number | null,
          hasAvailability: validDays.length > 0,
          maxPointsDrop: 0,
          maxCashDrop: 0,
          maxPointsDropDate: undefined as string | undefined,
          maxCashDropDate: undefined as string | undefined
        };

        if (validDays.length > 0) {
          validDays.forEach(d => {
            const dayMetrics = calculateMetrics(hotel.chain, d.cash, d.points, userSettings);
            
            if (d.points < metrics.minPoints) {
              metrics.minPoints = d.points;
              metrics.minPointsDate = d.date;
            }
            if (d.cash < metrics.minCash) {
              metrics.minCash = d.cash;
              metrics.minCashDate = d.date;
            }
            if (dayMetrics.netCost < metrics.minNetCost) {
              metrics.minNetCost = dayMetrics.netCost;
              metrics.minNetCostDate = d.date;
            }
            if (dayMetrics.returnPoints > metrics.maxReturnPoints) {
              metrics.maxReturnPoints = dayMetrics.returnPoints;
              metrics.maxReturnPointsDate = d.date;
            }
            if (dayMetrics.returnRate > metrics.maxReturnRate) {
              metrics.maxReturnRate = dayMetrics.returnRate;
              metrics.maxReturnRateDate = d.date;
            }
            if (dayMetrics.cpp > metrics.maxCpp) {
              metrics.maxCpp = dayMetrics.cpp;
              metrics.maxCppDate = d.date;
            }

            if (d.pointsDrop && d.pointsDrop > (metrics.maxPointsDrop || 0)) {
              metrics.maxPointsDrop = d.pointsDrop;
              metrics.maxPointsDropDate = d.date;
            }
            if (d.cashDrop && d.cashDrop > (metrics.maxCashDrop || 0)) {
              metrics.maxCashDrop = d.cashDrop;
              metrics.maxCashDropDate = d.date;
            }
          });
          
          if (['Marriott', 'Hilton', 'IHG'].includes(hotel.chain)) {
            const dateSet = new Map(validDays.map(d => [d.date, d]));
            let minCost = Infinity;

            for (const day of validDays) {
              let isConsecutive = true;
              let totalPoints = 0;
              let minPointsInStay = Infinity;

              const start = new Date(day.date);
              for (let i = 0; i < 5; i++) {
                const nextDateObj = new Date(start);
                nextDateObj.setDate(start.getDate() + i);
                const nextDate = nextDateObj.toISOString().split('T')[0];
                
                const nextDay = dateSet.get(nextDate);
                if (!nextDay) {
                  isConsecutive = false;
                  break;
                }
                totalPoints += nextDay.points;
                if (nextDay.points < minPointsInStay) {
                  minPointsInStay = nextDay.points;
                }
              }

              if (isConsecutive) {
                const cost = totalPoints - minPointsInStay;
                if (cost < minCost) {
                  minCost = cost;
                }
              }
            }

            if (minCost !== Infinity) {
              metrics.fifthNightFree = minCost;
            }
          }
        }

        // Apply advanced filters
        if (filters.maxCash && metrics.minCash > filters.maxCash) continue;
        if (filters.maxPoints && metrics.minPoints > filters.maxPoints) continue;
        if (filters.maxNetCost && metrics.minNetCost > filters.maxNetCost) continue;
        if (filters.minReturnRate && metrics.maxReturnRate < filters.minReturnRate) continue;
        if (filters.minCpp && metrics.maxCpp < filters.minCpp) continue;

        result.push({
          id: hotel.id,
          name: hotel.name,
          chain: hotel.chain,
          city: hotel.city,
          country: hotel.country,
          image: hotel.image,
          pointsPrice: hotel.points_price ? parseInt(hotel.points_price, 10) : null,
          cashPrice: hotel.cash_price ? parseFloat(hotel.cash_price) : null,
          availabilityScore: hotel.availability_score ? parseInt(hotel.availability_score, 10) : 0,
          category: hotel.category,
          metrics
        });
      }

      // Sorting
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'points_asc':
            return a.metrics.minPoints - b.metrics.minPoints;
          case 'cash_asc':
            return a.metrics.minCash - b.metrics.minCash;
          case 'net_cost_asc':
            return a.metrics.minNetCost - b.metrics.minNetCost;
          case 'cpp_desc':
            return b.metrics.maxCpp - a.metrics.maxCpp;
          case 'return_rate_desc':
            return b.metrics.maxReturnRate - a.metrics.maxReturnRate;
          case 'return_points_desc':
            return b.metrics.maxReturnPoints - a.metrics.maxReturnPoints;
          case 'points_drop_desc':
            return (b.metrics.maxPointsDrop || 0) - (a.metrics.maxPointsDrop || 0);
          case 'cash_drop_desc':
            return (b.metrics.maxCashDrop || 0) - (a.metrics.maxCashDrop || 0);
          case 'recommended':
          default:
            return b.availabilityScore - a.availabilityScore;
        }
      });

      res.json(result);
    } catch (error) {
      console.error('Error searching hotels:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 2. Get availability for a specific hotel
  app.get("/api/availability/:hotelId", async (req, res) => {
    const { hotelId } = req.params;
    try {
      let formattedDays = [];
      try {
        const result = await pool.query(`
          SELECT TO_CHAR(date, 'YYYY-MM-DD') as date, is_available as available, points_price as points, cash_price as cash, points_drop as "pointsDrop", cash_drop as "cashDrop"
          FROM availability
          WHERE hotel_id = $1
          ORDER BY date ASC
        `, [hotelId]);
        
        formattedDays = result.rows.map(d => ({
          ...d,
          points: d.points ? parseInt(d.points, 10) : null,
          cash: d.cash ? parseFloat(d.cash) : null,
          pointsDrop: d.pointsDrop ? parseInt(d.pointsDrop, 10) : 0,
          cashDrop: d.cashDrop ? parseFloat(d.cashDrop) : 0
        }));
      } catch (dbError) {
        console.warn("Database connection failed, using mock availability for preview:", dbError.message);
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const isAvailable = Math.random() > 0.2;
          formattedDays.push({
            date: date.toISOString().split('T')[0],
            available: isAvailable,
            points: isAvailable ? 50000 + Math.floor(Math.random() * 10000) : null,
            cash: isAvailable ? 500 + Math.floor(Math.random() * 100) : null,
            pointsDrop: 0,
            cashDrop: 0
          });
        }
      }

      if (formattedDays.length > 0) {
        res.json({ hotelId, days: formattedDays });
      } else {
        res.status(404).json({ error: "Hotel availability not found" });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 4. Calculations API
  app.get("/api/calculations", (req, res) => {
    res.json(savedCalculations);
  });

  app.post("/api/calculations", (req, res) => {
    const newCalc = req.body;
    if (!newCalc || !newCalc.id) {
      return res.status(400).json({ error: "Invalid calculation data" });
    }
    savedCalculations = [newCalc, ...savedCalculations];
    res.status(201).json(newCalc);
  });

  app.delete("/api/calculations/:id", (req, res) => {
    const { id } = req.params;
    savedCalculations = savedCalculations.filter(c => c.id !== id);
    res.json({ success: true });
  });

  // 5. Alerts API
  app.get("/api/alerts", (req, res) => {
    res.json(savedAlerts);
  });

  app.post("/api/alerts", (req, res) => {
    const newAlert = req.body;
    if (!newAlert || !newAlert.id) {
      return res.status(400).json({ error: "Invalid alert data" });
    }
    savedAlerts = [newAlert, ...savedAlerts];
    res.status(201).json(newAlert);
  });

  app.put("/api/alerts/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    savedAlerts = savedAlerts.map(a => a.id === id ? { ...a, ...updates } : a);
    res.json({ success: true });
  });

  app.delete("/api/alerts/:id", (req, res) => {
    const { id } = req.params;
    savedAlerts = savedAlerts.filter(a => a.id !== id);
    res.json({ success: true });
  });

  // 6. Scrape API
  app.post("/api/scrape/run", (req, res) => {
    // In a real app, this would trigger a background scraping job
    // For now, we just return a success message
    console.log("Scrape job triggered");
    res.json({ 
      success: true, 
      message: "Scraping job started successfully",
      jobId: `job_${Date.now()}`
    });
  });

  // --- Vite Middleware (for development) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
