# Evacuation Plan Editor

## Overview

This is a web-based fire evacuation plan editor (План Эвакуации) built for Russian-language users. The application allows users to create, edit, and export building evacuation plans with standardized safety symbols, routes, and room layouts. Users can draw walls, place safety equipment icons (extinguishers, alarms, exits), define evacuation routes, and export plans as PDF or PNG for printing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for global plan state (elements, routes, walls, metadata)
- **Canvas Rendering**: Konva.js (react-konva) for interactive 2D canvas drawing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Data Fetching**: TanStack React Query for API state management

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for server bundling, Vite for client
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Storage**: In-memory storage (MemStorage class) with interface ready for database migration

### Data Storage
- **Schema Definition**: Drizzle ORM with PostgreSQL dialect configured
- **Current Implementation**: In-memory Map-based storage for development
- **Database Ready**: Schema defined in `shared/schema.ts` using Drizzle's pgTable
- **Validation**: Zod schemas generated from Drizzle schema via drizzle-zod

### Key Design Patterns
- **Monorepo Structure**: Single repo with `client/`, `server/`, and `shared/` directories
- **Shared Types**: Common schema and types in `shared/` directory accessible to both client and server
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules
- **Component Organization**: Editor components in `client/src/components/editor/`, UI primitives in `client/src/components/ui/`

### Build and Development
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Static files served from `dist/public`, server bundled to `dist/index.cjs`
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### Third-Party Services
- **Database**: PostgreSQL (configured via `DATABASE_URL` environment variable)
- **Fonts**: Google Fonts (Inter, Roboto)

### Key Libraries
- **PDF Generation**: jsPDF for client-side PDF export
- **Canvas Library**: Konva.js for 2D canvas manipulation
- **Session Management**: express-session with connect-pg-simple (configured but not actively used)
- **UUID Generation**: uuid package for unique element IDs

### Development Tools
- **Replit Plugins**: vite-plugin-cartographer, vite-plugin-dev-banner, vite-plugin-runtime-error-modal
- **Meta Images**: Custom Vite plugin for OpenGraph image handling