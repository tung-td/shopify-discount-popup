# Shopify Discount Popup Backend

This is the backend part of the Shopify Discount Popup application. It is built using Node.js, Express, and TypeScript. The backend connects to the Shopify API to manage discount operations.

## Project Structure

- **src/**: Contains the source code for the backend application.
  - **app.ts**: Entry point of the application. Initializes the Express app and sets up middleware.
  - **controllers/**: Contains the business logic for handling discount operations.
    - **discountController.ts**: Defines the `DiscountController` class with methods for creating, retrieving, and deleting discounts.
  - **routes/**: Defines the API routes for discount operations.
    - **discountRoutes.ts**: Sets up the routes and connects them to the `DiscountController`.
  - **types/**: Contains TypeScript interfaces for type definitions.
    - **index.ts**: Defines the structure of discount data and requests.

## Setup Instructions

1. **Install Dependencies**: Navigate to the backend directory and run:
   ```
   npm install
   ```

2. **Configure Environment Variables**: Set up your environment variables to connect to the Shopify API. You may need to create a `.env` file in the backend directory with the necessary credentials.

3. **Run the Application**: Start the backend server using:
   ```
   npm start
   ```

## API Endpoints

- **POST /discounts**: Create a new discount.
- **GET /discounts**: Retrieve a list of discounts.
- **DELETE /discounts/:id**: Delete a discount by ID.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the backend functionality.