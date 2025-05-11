import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './lib/env';
import { registerRoutes } from './routes';
import session from 'express-session';
import { setupAuth } from './auth';
import helmet from 'helmet';
import { log, setupVite, serveStatic } from './vite';
import { createServer } from 'http';

// __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function main() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        // Adjusted for running React apps
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com", "https://api.stripe.com"],
      },
    },
  }));

  // Session middleware configuration
  app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  }));

  // Parse JSON bodies
  app.use(express.json());

  // Serve static files in production
  if (config.isProd) {
    app.use(express.static(path.join(rootDir, 'frontend', 'dist')));
  }

  // Set up authentication
  setupAuth(app);

  // Configure Vite in development
  if (config.isDev) {
    log('Configuring Vite for development');
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  // Register API routes
  const httpServer = await registerRoutes(app);

  // Start server
  const port = config.PORT;
  httpServer.listen(port, () => {
    log(`serving on port ${port}`);
  });

  return httpServer;
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});