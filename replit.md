# NeoBot - Advanced Messenger Bot Framework

## Overview

NeoBot is a sophisticated Messenger chatbot framework built with Node.js, featuring a modular architecture, web dashboard, and comprehensive bot management capabilities. The project combines a backend bot engine with a modern React-based dashboard for monitoring and administration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Bot Engine**: Node.js-based Messenger bot using the unofficial Facebook API (`priyanshu-fca`)
- **Web Server**: Express.js server providing REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Authentication**: Cookie-based Facebook authentication stored in `account.json`

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI components with Tailwind CSS styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Database Schema
The application uses Drizzle ORM with PostgreSQL, defining schemas for:
- **Bot Users**: User profiles, XP, levels, and preferences
- **Threads**: Chat groups/conversations management
- **Commands**: Bot command definitions and configurations
- **Command Logs**: Usage tracking and analytics
- **Bot Statistics**: Performance metrics and system stats

## Key Components

### 1. Bot System
- **Command Loader**: Dynamically loads commands from the `commands/` directory
- **Event Handler**: Processes various Facebook Messenger events
- **XP System**: Gamification with user levels and rankings
- **Security Manager**: User blacklisting, rate limiting, and access control
- **Multi-language Support**: English, Bengali, and Vietnamese language files

### 2. Web Dashboard
- **Analytics Dashboard**: Real-time statistics and performance metrics
- **User Management**: View and manage bot users, XP, and bans
- **Thread Management**: Control active conversations and settings
- **Command Administration**: Enable/disable commands and view usage logs
- **Security Panel**: Manage blacklists and security settings

### 3. API Layer
- RESTful endpoints for dashboard operations
- CRUD operations for users, threads, commands, and logs
- Real-time statistics and analytics data
- Authentication and authorization middleware

## Data Flow

### Bot Operation Flow
1. Facebook Messenger events received via unofficial API
2. Event processing through command loader and handlers
3. Command execution with permission checking
4. XP system updates and database persistence
5. Response sent back to Messenger

### Dashboard Flow
1. React frontend makes API requests to Express server
2. Server queries PostgreSQL database using Drizzle ORM
3. Data formatted and returned as JSON responses
4. Frontend updates UI with real-time data using TanStack Query

## External Dependencies

### Core Dependencies
- **priyanshu-fca**: Unofficial Facebook Chat API (educational use only)
- **express**: Web server framework
- **drizzle-orm**: Database ORM and query builder
- **@neondatabase/serverless**: PostgreSQL database connection
- **axios**: HTTP client for external API calls

### Frontend Dependencies
- **react**: UI framework
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing library

### Development Dependencies
- **typescript**: Type checking and development
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for server
- **esbuild**: Fast bundler for production builds

## Deployment Strategy

### Development Mode
- Uses `tsx` to run TypeScript server directly
- Vite development server for hot module replacement
- Separate bot process spawned from main server
- Environment variables for API keys and database connection

### Production Build
- Vite builds optimized client bundle to `dist/public`
- esbuild compiles server to `dist/index.js`
- Single Node.js process serves both API and static files
- Database migrations managed through Drizzle Kit

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: For AI chat functionality
- `WEATHER_API_KEY`: For weather command
- Bot configuration stored in `config.json`
- Facebook authentication cookies in `account.json`

### Security Considerations
- Educational use disclaimer for unofficial Facebook API
- Rate limiting and spam protection
- User blacklisting and thread management
- Command-level permission system
- Secure cookie handling for authentication

The application is designed to be easily deployable on platforms like Replit, with proper environment variable configuration and database provisioning.

## Recent Changes

**2025-01-18:**
- Successfully converted entire bot framework from CommonJS to ES modules
- Fixed all module imports/exports for bot, commands, and event handlers
- Bot now successfully initializes all systems and attempts Facebook authentication
- Dashboard fully functional with real-time stats and command management
- All command files converted to ES module format with proper exports
- System is now ready for Facebook authentication with valid cookies