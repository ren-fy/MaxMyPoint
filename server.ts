import express from "express";
import { createServer as createViteServer } from "vite";
import { MOCK_HOTELS, MOCK_AVAILABILITY } from "./src/data/mockData.js";

// In-memory storage for calculations and alerts
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
  
  // 1. Get all hotels
  app.get("/api/hotels", (req, res) => {
    res.json(MOCK_HOTELS);
  });

  // 2. Get availability for a specific hotel
  app.get("/api/availability/:hotelId", (req, res) => {
    const { hotelId } = req.params;
    const availability = MOCK_AVAILABILITY[hotelId];
    
    if (availability) {
      res.json(availability);
    } else {
      res.status(404).json({ error: "Hotel availability not found" });
    }
  });

  // 3. Get all availability (useful for the initial load in this app)
  app.get("/api/availability", (req, res) => {
    res.json(MOCK_AVAILABILITY);
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
