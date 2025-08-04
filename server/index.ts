import 'dotenv/config';

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./db-init";
import { setupSocketChat } from "./socket-chat";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  try {
    console.log("🚀 Starting The Sandwich Project server...");

    // Health check route
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        initialized: false,
      });
    });

    // Basic error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });

    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";

    console.log(`Starting server on ${host}:${port} in ${process.env.NODE_ENV || "development"} mode`);


    // Set up basic routes BEFORE starting server
    app.use("/attached_assets", express.static("attached_assets"));

    // Health check route - available before full initialization
    app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      });
    });

    if (process.env.NODE_ENV === "production") {
      // In production, serve static files from the built frontend
      app.use(express.static("dist/public"));

      // Simple SPA fallback for production - serve index.html for non-API routes
      app.get(/^(?!\/api).*/, async (_req: Request, res: Response) => {
        const path = await import("path");
        res.sendFile(path.join(process.cwd(), "dist/public/index.html"));
      });

      console.log("✓ Static file serving and SPA routing configured for production");
    }

    const finalPort = port;

    const httpServer = createServer(app);

    // Set up Socket.io for chat system
    const io = setupSocketChat(httpServer);

    // Set up WebSocket server for real-time notifications
    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/notifications'
    });

    // CRITICAL FIX: Register all API routes BEFORE Vite middleware to prevent route interception
    try {
      await registerRoutes(app);
      console.log("✓ API routes registered BEFORE Vite middleware");
    } catch (error) {
      console.error("✗ Route registration failed:", error);
    }

    // Set up Vite middleware AFTER API routes to prevent catch-all interference
    if (process.env.NODE_ENV === "development") {
      try {
        const { setupVite } = await import("./vite");
        await setupVite(app, httpServer);
        console.log("✓ Vite development server setup complete AFTER API routes");
      } catch (error) {
        console.error("✗ Vite setup failed:", error);
        console.log("⚠ Server continuing without Vite - frontend may not work properly");
      }
    }

    const clients = new Map<string, any>();

    wss.on('connection', (ws, request) => {
      console.log('WebSocket client connected from:', request.socket.remoteAddress);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'identify' && message.userId) {
            clients.set(message.userId, ws);
            console.log(`User ${message.userId} identified for notifications`);
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      });

      ws.on('close', () => {
        // Remove client from map when disconnected
        for (const [userId, client] of Array.from(clients.entries())) {
          if (client === ws) {
            clients.delete(userId);
            console.log(`User ${userId} disconnected from notifications`);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Global broadcast function for messaging system
    (global as any).broadcastNewMessage = async (data: any) => {
      console.log('Broadcasting message to', clients.size, 'connected clients');
      
      // Broadcast to all connected clients
      for (const [userId, ws] of Array.from(clients.entries())) {
        if (ws.readyState === 1) { // WebSocket.OPEN
          try {
            ws.send(JSON.stringify(data));
          } catch (error) {
            console.error(`Error sending message to user ${userId}:`, error);
            // Remove dead connection
            clients.delete(userId);
          }
        } else {
          // Remove dead connection
          clients.delete(userId);
        }
      }
    };

    httpServer.listen(Number(finalPort), host, () => {
      console.log(`✓ Server is running on http://${host}:${finalPort}`);
      console.log(`✓ WebSocket server ready on ws://${host}:${finalPort}/notifications`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("✓ Basic server ready - starting background initialization...");


      // Do heavy initialization in background after server is listening
      setImmediate(async () => {
        try {
          await initializeDatabase();
          console.log("✓ Database initialization complete");

          // Routes already registered during server startup
          console.log("✓ Database initialization completed after route registration");

          // Update health check to reflect full init
          app.get("/health", (_req: Request, res: Response) => {
            res.status(200).json({
              status: "healthy",
              timestamp: new Date().toISOString(),
              uptime: process.uptime(),
              environment: process.env.NODE_ENV || "development",
              initialized: true,
            });
          });

          if (process.env.NODE_ENV === "production") {
              // Add catch-all for unknown routes before SPA
              app.use("*", (req: Request, res: Response, next: NextFunction) => {
                console.log(`Catch-all route hit: ${req.method} ${req.originalUrl}`);
                if (req.originalUrl.startsWith('/api')) {
                  return res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
                }
                next();
              });

              // In production, serve React app for all non-API routes
              app.get("*", async (_req: Request, res: Response) => {
                try {
                  const path = await import("path");
                  const indexPath = path.join(process.cwd(), "dist/public/index.html");
                  console.log(`Serving SPA for route: ${_req.path}, file: ${indexPath}`);
                  res.sendFile(indexPath);
                } catch (error) {
                  console.error("SPA serving error:", error);
                  res.status(500).send("Error serving application");
                }
              });
              console.log("✓ Production SPA routing configured");
            }

          console.log(
            "✓ The Sandwich Project server is fully ready to handle requests",
          );

        } catch (initError) {
          console.error("✗ Background initialization failed:", initError);
          console.log("Server continues to run with basic functionality...");
          
        }
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`Received ${signal}, starting graceful shutdown...`);
      httpServer.close(() => {
        console.log("HTTP server closed gracefully");
        setTimeout(() => process.exit(0), 1000);
      });
      setTimeout(() => {
        console.log("Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      // Never shutdown for unhandled rejections - just log them
      console.log("Continuing server operation despite unhandled rejection...");
    });


    return httpServer;
  } catch (error) {
    console.error("✗ Server startup failed:", error);
    const fallbackServer = app.listen(5000, "0.0.0.0", () => {
      console.log("✓ Minimal fallback server listening on http://0.0.0.0:5000");
    });
    return fallbackServer;
  }
}

// Final launch
startServer()
  .then((server) => {
    console.log("✓ Server startup sequence completed successfully");
    console.log("✓ Server object:", server ? "EXISTS" : "NULL");
  })
  .catch((error) => {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  });

