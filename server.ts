import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/config/db";

import authRoutes from "./server/routes/authRoutes";
import projectRoutes from "./server/routes/projectRoutes";
import bookingRoutes from "./server/routes/bookingRoutes";
import EnquiryRoutes from "./server/routes/EnquiryRoutes";
import teamRoutes from "./server/routes/teamRoutes";
import testimonialRoutes from "./server/routes/testimonialRoutes";
import journalRoutes from "./server/routes/journalRoutes";
import userRoutes from "./server/routes/userRoutes";
import uploadRoutes from "./server/routes/uploadRoutes";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(cors());
  // Larger body limit so base64 project images can be uploaded
  app.use(express.json({ limit: '12mb' }));

  // Serve uploaded project images
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // MERN API routes — every one of these is now backed by MongoDB via Mongoose
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/messages", EnquiryRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/testimonials", testimonialRoutes);
  app.use("/api/journal", journalRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/upload", uploadRoutes);

  // Connect to MongoDB before accepting traffic
  await connectDB();

  // Vite middleware in dev, static build serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "localhost", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
