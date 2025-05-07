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
  isEmbeddedApp: true
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
  res.json({ message: "Shopify app is running" });
});

// Shopify OAuth routes
app.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop as string;
    if (!shop) {
      return res.status(400).json({ error: "Missing shop parameter" });
    }

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    return res.redirect(authRoute);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

app.get("/auth/callback", async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    res.send(`
      <html>
        <head>
          <title>Success</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            h1 { color: #008060; }
          </style>
        </head>
        <body>
          <h1>App Installed Successfully!</h1>
          <p>Your app has been installed to ${callback.session.shop}</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send(`
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            h1 { color: #d82c0d; }
          </style>
        </head>
        <body>
          <h1>Installation Failed</h1>
          <p>Please try again</p>
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
