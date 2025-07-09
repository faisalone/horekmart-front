# Copilot Instructions for eCommerce Frontend

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a modern eCommerce frontend built with Next.js 14+ App Router, TypeScript, and Tailwind CSS. The application is designed to be scalable, similar to large-scale platforms like Walmart or Target.

## Architecture & Design Principles
- **Component-Based**: Use modular, reusable components following DRY principles
- **TypeScript**: All components must be type-safe with proper interfaces
- **Tailwind CSS**: Use utility-first styling, avoid custom CSS
- **App Router**: Use Next.js App Router for routing and layouts
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Component Guidelines
- Create reusable components in `src/components/` directory
- Use TypeScript interfaces for all props
- Follow naming conventions: PascalCase for components, camelCase for functions
- Components should be modular and focused on a single responsibility
- Use proper prop types and default values where appropriate

## Code Standards
- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Implement proper error handling and loading states
- Use semantic HTML and accessibility best practices
- Optimize images and performance

## File Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions
- `src/styles/` - Global styles and Tailwind configurations

## eCommerce Features to Implement
- Product catalog with filtering and search
- Shopping cart and wishlist functionality
- User authentication and profiles
- Checkout process and order management
- Product variants (size, color, etc.)
- Responsive product galleries
- Customer reviews and ratings
