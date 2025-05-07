import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Log environment variables (without sensitive data)
console.log('Environment loaded:', {
  hasApiKey: !!process.env.SHOPIFY_API_KEY,
  hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
  hostName: process.env.SHOPIFY_HOST_NAME
});

// Validate environment variables
if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.SHOPIFY_HOST_NAME) {
  throw new Error('Missing required environment variables');
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ["write_discounts"],
  hostName: process.env.SHOPIFY_HOST_NAME,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false // Changed to false for testing
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Basic test route
app.get("/", (req, res) => {
  console.log('Root route accessed');
  res.json({ 
    message: "Shopify app is running",
    endpoints: {
      auth: "/auth",
      callback: "/auth/callback"
    }
  });
});

// Auth route
app.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop as string;
    console.log('Auth request received for shop:', shop);
    console.log('Request headers:', req.headers);
    console.log('Request query:', req.query);

    if (!shop) {
      console.log('Missing shop parameter');
      return res.status(400).json({ error: "Missing shop parameter" });
    }

    // Validate shop format
    if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
      console.log('Invalid shop format:', shop);
      return res.status(400).json({ error: "Invalid shop format" });
    }

    console.log('Starting auth process for shop:', shop);
    
    // Generate the authorization URL manually
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=write_discounts&redirect_uri=${process.env.SHOPIFY_HOST_NAME}/auth/callback&state=${Buffer.from(shop).toString('base64')}`;
    
    console.log('Generated auth URL:', authUrl);
    return res.redirect(authUrl);
  } catch (error) {
    console.error('Auth error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: "Authentication failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Callback route
app.get("/auth/callback", async (req, res) => {
  try {
    console.log('Callback received with query:', req.query);
    console.log('Callback headers:', req.headers);

    const { code, shop, state } = req.query;
    
    if (!code || !shop) {
      throw new Error('Missing required parameters');
    }

    // Verify state
    const decodedState = Buffer.from(state as string, 'base64').toString();
    if (decodedState !== shop) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for access token
    const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    if (!accessTokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const { access_token } = await accessTokenResponse.json();
    console.log('Successfully obtained access token for shop:', shop);
    
    res.send(`
      <html>
        <head>
          <title>Success</title>
          <style>
            body { 
              font-family: sans-serif; 
              text-align: center; 
              padding: 50px;
              background-color: #f6f6f7;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
            }
            h1 { color: #008060; }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #008060;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>App Installed Successfully!</h1>
            <p>Your app has been installed to ${shop}</p>
            <a href="https://${shop}/admin/apps" class="button">Go to Apps</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Callback error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
          <style>
            body { 
              font-family: sans-serif; 
              text-align: center; 
              padding: 50px;
              background-color: #f6f6f7;
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
            }
            h1 { color: #d82c0d; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Installation Failed</h1>
            <p>Please try again</p>
            <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Placeholder for discount routes
function setDiscountRoutes(app: express.Application) {
  app.get("/discounts", (req, res) => {
    res.send("Discount routes are not implemented yet.");
  });
}

// Set up routes
setDiscountRoutes(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
