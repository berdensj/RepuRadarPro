# RepuRadar - Online Review Management Platform

RepuRadar is a comprehensive SaaS dashboard for professionals (doctors, lawyers, accountants) to monitor and manage their online reviews across multiple platforms. The application features authentication, metrics visualization, review management with AI-generated response suggestions, and alert systems for negative reviews.

## Features

- **Authentication System**: Secure user authentication with role-based access control
- **Review Management**: Collect and manage reviews from multiple platforms (Google, Yelp, Facebook, Apple Maps)
- **AI-Powered Responses**: Generate intelligent responses to reviews using OpenAI integration
- **Analytics Dashboard**: Visual representation of review data and trends
- **Multi-Location Support**: Manage reviews across multiple business locations
- **Subscription Plans**: Three-tier subscription model with a 14-day trial period
- **Alerts System**: Get notified about new negative reviews
- **Competitor Tracking**: Monitor competitors' review performance

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, shadcn/ui, React Query
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **AI Integration**: OpenAI API
- **Payment Processing**: Stripe

## Project Structure

```
/
├── frontend/                # Frontend React application
│   ├── public/              # Static files
│   ├── src/                 # Source files
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── pages/           # Page components
│   └── test/                # Frontend tests
│
├── backend/                 # Backend Node.js application
│   ├── src/                 # Source files
│   │   ├── db/              # Database models and migrations
│   │   ├── lib/             # Utility functions
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── test/                # Backend tests
│
├── shared/                  # Shared code (types, schemas)
│   └── schema.ts            # Database schema definitions
│
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies
├── Procfile                 # AWS Elastic Beanstalk configuration
└── README.md                # Project documentation
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/repuradar.git
cd repuradar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Deployment to AWS Elastic Beanstalk

1. Install the Elastic Beanstalk CLI:
```bash
pip install awsebcli
```

2. Initialize your EB project:
```bash
eb init
```

3. Create an environment:
```bash
eb create repuradar-env
```

4. Deploy your application:
```bash
eb deploy
```

5. Open your application:
```bash
eb open
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session management
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key (available on frontend)
- `NODE_ENV`: Environment (development, production)
- `PORT`: Server port

## License

MIT