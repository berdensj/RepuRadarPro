# RepuRadar - Online Review Management Platform

RepuRadar is a professional SaaS dashboard for monitoring and managing online reviews with AI-powered insights and comprehensive customer onboarding capabilities.

## 🚀 Features

- 📊 **Dashboard Analytics**: Visualize performance metrics and review trends
- 🌟 **Review Management**: Monitor and respond to customer reviews from multiple platforms
- 🤖 **AI-Powered Responses**: Generate intelligent reply suggestions with OpenAI integration
- 🌎 **Multi-Location Support**: Manage reviews for multiple business locations
- 📱 **Responsive Design**: Access the platform from any device
- 🔔 **Alerts System**: Receive notifications for critical negative reviews
- 🏢 **White-Label Capabilities**: For agencies and enterprises with multiple clients
- 💼 **Admin Dashboard**: Comprehensive customer management tools
- 🔄 **Webhook Integrations**: Connect to popular review platforms
- 🔐 **Role-Based Access**: Control user permissions with precision

## 📋 Technologies

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js, JWT
- **AI**: OpenAI API integration
- **Payments**: Stripe
- **Email**: SendGrid

## 🛠️ Project Structure

```
repuradar/
├── backend/                  # Backend code
│   ├── src/                  # Source files
│   │   ├── db/               # Database models and connections
│   │   ├── lib/              # Utility functions
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── auth.ts           # Authentication setup
│   │   ├── index.ts          # Entry point
│   │   └── vite.ts           # Vite configuration
│   └── test/                 # Backend tests
├── frontend/                 # Frontend code
│   ├── src/                  # Source files
│   │   ├── assets/           # Static assets
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   ├── App.tsx           # Main App component
│   │   └── main.tsx          # Entry point
│   └── test/                 # Frontend tests
├── migrations/               # Database migrations
├── scripts/                  # Utility scripts
└── shared/                   # Shared code and types
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/repuradar.git
   cd repuradar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and API keys.

5. Initialize the database:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:5000](http://localhost:5000) in your browser.

## 🚢 Deployment

### AWS Elastic Beanstalk Deployment

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize EB CLI:
   ```bash
   eb init
   ```

3. Create an environment:
   ```bash
   eb create repuradar-prod
   ```

4. Deploy:
   ```bash
   eb deploy
   ```

5. Configure environment variables:
   ```bash
   eb setenv DATABASE_URL=your_db_url SESSION_SECRET=your_secret
   ```

### GitHub Actions CI/CD

This repository is configured with GitHub Actions for continuous integration and deployment. On each push to the main branch, the workflow will:

1. Run tests
2. Build the application
3. Deploy to AWS Elastic Beanstalk (if on main branch)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Live Demo](https://repuradar.com)
- [Documentation](https://docs.repuradar.com)
- [Support](https://support.repuradar.com)