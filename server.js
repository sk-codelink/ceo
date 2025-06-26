import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load environment variables if .env exists
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (err) {
  console.log('No .env file found, using default values');
}

// Dynamically load API routes
async function loadAPIRoutes(dir, basePath = '/api') {
  const fullPath = path.join(__dirname, dir);
  
  if (!fs.existsSync(fullPath)) return;
  
  const files = fs.readdirSync(fullPath);
  
  for (const file of files) {
    const filePath = path.join(fullPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await loadAPIRoutes(path.join(dir, file), `${basePath}/${file}`);
    } else if (file.endsWith('.js')) {
      try {
        const routeName = file.replace('.js', '');
        const routePath = `${basePath}/${routeName}`;
        
        // Import the handler
        const module = await import(`file://${filePath}`);
        const handler = module.default;
        
        if (typeof handler === 'function') {
          app.all(routePath, async (req, res) => {
            try {
              // Ensure body is available
              if (!req.body && req.method === 'POST') {
                req.body = {};
              }
              
              await handler(req, res);
            } catch (error) {
              console.error(`❌ Error in ${routePath}:`, error);
              if (!res.headersSent) {
                res.status(500).json({ error: error.message });
              }
            }
          });
          console.log(`✅ Loaded route: ${routePath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to load ${filePath}:`, error.message);
      }
    }
  }
}

// Initialize server
async function startServer() {
  try {
    // Load API routes
    await loadAPIRoutes('api');
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ 
        message: 'Evo AI API Server Running! 🚀',
        endpoints: [
          '/api/main',
        ]
      });
    });
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API Documentation: http://localhost:${PORT}/`);
      console.log(`💡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 