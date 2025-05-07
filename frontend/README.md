# Shopify Discount Popup Frontend

This project is a fullstack application designed to integrate with Shopify, providing a discount pop-up feature for both the Shopify Admin UI and the Storefront UI. The frontend is built using React and TypeScript.

## Project Structure

- **src/**: Contains all the source code for the frontend application.
  - **components/**: Contains React components for the Admin UI and Storefront UI.
    - **AdminUI.tsx**: Interface for managing discounts in the Shopify admin.
    - **StoreFrontUI.tsx**: Displays discount pop-ups on the storefront.
  - **App.tsx**: The main application component that renders the AdminUI and StoreFrontUI based on the application state.
  - **index.tsx**: The entry point of the frontend application that renders the App component into the DOM.
  - **types/**: Contains TypeScript interfaces for the frontend components.
    - **index.ts**: Defines the structure of props and data used in the frontend components.

## Getting Started

To get started with the frontend application, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd shopify-discount-popup/frontend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm start
   ```

## Features

- Admin UI for creating, viewing, and deleting discounts.
- Storefront UI for displaying discount pop-ups to customers.
- TypeScript support for better development experience and type safety.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.