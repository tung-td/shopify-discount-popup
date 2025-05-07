import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

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

// Basic test route
app.get("/", (req, res) => {
  res.json({
    message: "Shopify Discount Popup API is running",
    status: "ok",
    endpoints: {
      auth: "/auth",
      callback: "/auth/callback",
      discounts: "/discounts"
    }
  });
});

// Shopify OAuth routes
app.get("/auth", async (req, res) => {
  const shop = req.query.shop as string;
  if (!shop) {
    return res.status(400).send("Missing shop parameter.");
  }

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: false,
    rawRequest: req,
  });
  return res.redirect(authRoute);
});

app.get("/auth/callback", async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });    
    const session = callback.session;
    console.log(`Authenticated with shop: ${session.shop}`);
    res.redirect(`/?shop=${session.shop}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Authentication failed.");
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
