# A11y Sentinel 🛡️ -- ( 🚧🚧 Under Construction 🚧🚧 )

**A11y Sentinel** is an automated, full-stack dashboard that empowers development teams to monitor, track, and resolve web accessibility (WCAG) issues across their entire website—not just single pages. Move beyond manual checks to continuous, automated compliance auditing.

## Features:

- **Site-Wide Scans**: Automatically crawls your website using sitemaps or `robots.txt` to ensure complete coverage.
- **Historical Trend Analysis**: Visualize your accessibility health over time with interactive charts. Track progress and prevent regressions.
- **Blazing Fast Scans**: Powered by a distributed **Redis-backed job queue** for asynchronous processing, ensuring a responsive UI.
- **Actionable Reports**: Drill down into individual pages to see specific errors, their impact, and the elements affected.
- **axe-core Powered**: Utilizes the industry-standard `axe-core` engine for the most reliable accessibility analysis.
- **Secure & Multi-Tenant**: Users can create private accounts and manage multiple client projects in one place.

## Tech Stack

- **Frontend**: Next.js 14, React, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express, JavaScript
- **Database**: MongoDB with Prisma ORM
- **Job Queue & Caching**: Redis, BullMQ
- **Browser Automation**: Playwright
- **Accessibility Engine**: axe-core
- **Deployment**: Vercel (Frontend), Railway (Backend, DB, Redis)
- **Auth**: Next-Auth.js, JWT

## Database Schema

The application uses a MongoDB database with a schema designed for efficient querying of scan results and project management. The core models are structured as follows:

![Database Schema Diagram](diagram.svg)

## Implementation decisions

First is the Crawling logic decision I have made. It follows the graph attached below for best performance in searching for URLs on pages:

![Crawling logic decision tree](URL_search_diag.svg)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Redis instance

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Amer-Mekic/A11y-Sentinel.git
    cd A11y-Sentinel
    ```

2.  **Install dependencies**

    ```bash
    # Install root dependencies in frontend and backend respectively
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file in the root directory and configure the following variables:

    ```env
    # Database
    DATABASE_URL="your_mongodb_connection_string"

    # Auth
    NEXTAUTH_SECRET="your_nextauth_secret"
    NEXTAUTH_URL="http://localhost:3000"

    # Redis (for BullMQ)
    REDIS_URL="your_redis_connection_string"
    ```

4.  **Set up the database**

    ```bash
    # Generate the Prisma Client and push the schema to your DB
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the development servers**

    ```bash
    # Run the backend (Server)
    npm run dev:server

    # Run the frontend (Client)
    npm run dev:client
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Project Roadmap

- [ ] **Email Reports**: Automated weekly digest emails with scan summaries.
- [ ] **PDF Export**: Generate and download client-ready PDF audit reports.
- [ ] **Integration Hooks**: Automate scans via GitHub Actions or Netlify Deploy Hooks.
- [ ] **Cross-Browser Testing**: Run scans using Playwright's Firefox and WebKit engines.

## Contributing

Contributions, issues, and feature requests are welcome!

## Acknowledgments

- The incredible [axe-core](https://github.com/dequelabs/axe-core) team for their amazing accessibility engine.
- The [Playwright](https://playwright.dev/) team for creating a robust browser automation tool.