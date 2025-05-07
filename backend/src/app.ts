import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Normalize host name by removing trailing slash
const normalizeHostName = (hostName: string) => {
  return hostName.replace(/\/$/, '');
};

// Log environment variables (without sensitive data)
console.log('Environment loaded:', {
  hasApiKey: !!process.env.SHOPIFY_API_KEY,
  hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
  hostName: process.env.SHOPIFY_HOST_NAME,
  nodeEnv: process.env.NODE_ENV
});

// Basic validation
if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET || !process.env.SHOPIFY_HOST_NAME) {
  console.error('Missing environment variables:', {
    hasApiKey: !!process.env.SHOPIFY_API_KEY,
    hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
    hasHostName: !!process.env.SHOPIFY_HOST_NAME
  });
  throw new Error('Missing required environment variables');
}

const normalizedHostName = normalizeHostName(process.env.SHOPIFY_HOST_NAME);

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ["write_discounts"],
  hostName: normalizedHostName,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Basic route
app.get("/", (req, res) => {
  console.log('Root route accessed');
  res.json({ 
    message: "Shopify app is running",
    endpoints: {
      auth: "/auth",
      callback: "/auth/callback"
    },
    env: {
      hostName: normalizedHostName,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Auth route
app.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop as string;
    console.log('Auth request received for shop:', shop);
    
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
    const redirectUri = `${normalizedHostName}/auth/callback`;
    console.log('Using redirect URI:', redirectUri);
    
    // Build the authorization URL with proper encoding
    const params = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY || '',
      scope: 'write_discounts',
      redirect_uri: redirectUri,
      state: Buffer.from(shop).toString('base64')
    });
    
    const authUrl = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
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
    
    const { code, shop, state } = req.query;
    
    if (!code || !shop) {
      console.error('Missing parameters:', { code: !!code, shop: !!shop });
      throw new Error('Missing required parameters');
    }

    // Verify state
    const decodedState = Buffer.from(state as string, 'base64').toString();
    if (decodedState !== shop) {
      console.error('Invalid state:', { received: decodedState, expected: shop });
      throw new Error('Invalid state parameter');
    }

    console.log('Exchanging code for access token...');
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
      const errorText = await accessTokenResponse.text();
      console.error('Access token response error:', {
        status: accessTokenResponse.status,
        statusText: accessTokenResponse.statusText,
        body: errorText
      });
      throw new Error(`Failed to get access token: ${accessTokenResponse.statusText}`);
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
            .error-details {
              color: #666;
              font-size: 0.9em;
              margin-top: 20px;
              text-align: left;
              background: #f8f8f8;
              padding: 10px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Installation Failed</h1>
            <p>Please try again</p>
            <div class="error-details">
              <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
              <p><strong>Stack:</strong> ${error instanceof Error ? error.stack : 'No stack trace'}</p>
            </div>
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
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    SHOPIFY_HOST_NAME: normalizedHostName
  });
});
