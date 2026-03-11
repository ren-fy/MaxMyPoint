import express from "express";
import { createServer as createViteServer } from "vite";
import { MOCK_HOTELS, MOCK_AVAILABILITY } from "./src/data/mockData.js";

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
