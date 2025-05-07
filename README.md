# Shopify Discount Popup

This project is a fullstack application designed to create and manage discount pop-ups for Shopify stores. It consists of a backend built with Node.js and TypeScript, and a frontend built with React and TypeScript.

## Project Structure

The project is organized into two main directories: `backend` and `frontend`.

### Backend

- **`backend/src/app.ts`**: Entry point of the backend application. Initializes the Express app, sets up middleware, and connects to the Shopify API.
- **`backend/src/controllers/discountController.ts`**: Contains the `DiscountController` class with methods for creating, retrieving, and deleting discounts.
- **`backend/src/routes/discountRoutes.ts`**: Sets up the routes for discount operations using the `DiscountController`.
- **`backend/src/types/index.ts`**: Defines TypeScript interfaces for discount data and requests.
- **`backend/package.json`**: Lists backend dependencies and scripts for running the server.
- **`backend/tsconfig.json`**: TypeScript configuration for the backend.
- **`backend/README.md`**: Documentation specific to the backend.

### Frontend

- **`frontend/src/components/AdminUI.tsx`**: React component for managing discounts in the Shopify admin interface.
- **`frontend/src/components/StoreFrontUI.tsx`**: React component that displays discount pop-ups on the storefront.
- **`frontend/src/App.tsx`**: Main application component that renders the `AdminUI` and `StoreFrontUI` based on the application state.
- **`frontend/src/index.tsx`**: Entry point of the frontend application that renders the `App` component.
- **`frontend/src/types/index.ts`**: Defines TypeScript interfaces for props and data used in frontend components.
- **`frontend/package.json`**: Lists frontend dependencies and scripts for building and running the application.
- **`frontend/tsconfig.json`**: TypeScript configuration for the frontend.
- **`frontend/README.md`**: Documentation specific to the frontend.

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd shopify-discount-popup
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the backend server:
     ```
     npm start
     ```

3. **Frontend Setup**:
   - Open a new terminal and navigate to the frontend directory:
     ```
     cd frontend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the frontend application:
     ```
     npm start
     ```

## Usage

Once both the backend and frontend are running, you can access the admin interface to manage discounts and see the discount pop-ups on the storefront.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.