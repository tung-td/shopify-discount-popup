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

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: ["write_discounts"],
  hostName: process.env.SHOPIFY_HOST_NAME || "",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Basic test route
app.get("/", (req, res) => {
  try {
    const shop = req.query.shop;
    if (shop) {
      console.log('Redirecting to auth with shop:', shop);
      return res.redirect(`/auth?shop=${shop}`);
    }
    res.json({
      message: "Shopify Discount Popup API is running",
      status: "ok",
      endpoints: {
        auth: "/auth",
        callback: "/auth/callback",
        discounts: "/discounts"
      }
    });
  } catch (error) {
    console.error('Error in root route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Shopify OAuth routes
app.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop as string;
    console.log('Auth request for shop:', shop);
    
    if (!shop) {
      return res.status(400).send("Missing shop parameter.");
    }

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/auth/callback",
      isOnline: false,
      rawRequest: req,
    });
    console.log('Auth route generated:', authRoute);
    return res.redirect(authRoute);
  } catch (error) {
    console.error('Error in auth route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: 'Authentication failed', details: errorMessage });
  }
});

app.get("/auth/callback", async (req, res) => {
  try {
    console.log('Callback received with query:', req.query);
    
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });    
    
    const session = callback.session;
    console.log('Authentication successful for shop:', session.shop);
    
    res.send(`
      <html>
        <head>
          <title>App Installed Successfully</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #008060;
              margin-bottom: 1rem;
            }
            p {
              color: #637381;
              margin-bottom: 1rem;
            }
            .button {
              display: inline-block;
              padding: 0.8rem 1.5rem;
              background-color: #008060;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #006e52;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>App Installed Successfully!</h1>
            <p>Your Shopify Discount Popup app has been installed to ${session.shop}</p>
            <a href="https://${session.shop}/admin/apps" class="button">Go to Apps</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in callback route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).send(`
      <html>
        <head>
          <title>Installation Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #d82c0d;
              margin-bottom: 1rem;
            }
            p {
              color: #637381;
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Installation Failed</h1>
            <p>There was an error installing the app. Please try again.</p>
            <p>Error details: ${errorMessage}</p>
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
  console.log(`Server is running on http://localhost:${PORT}`);
});
