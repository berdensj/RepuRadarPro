# RepuRadarPro - Reputation Management Platform

RepuRadarPro is a professional SaaS dashboard for businesses (doctors, lawyers, accountants, etc.) to monitor and manage their online reviews with advanced AI-powered insights and comprehensive reputation management capabilities.

## 🚀 Features

- 📊 **Comprehensive Analytics**: Visualize performance metrics and review trends across platforms
- 🌟 **Review Management**: Monitor, respond to, and manage customer reviews from multiple platforms
- 🤖 **AI-Powered Responses**: Generate intelligent reply suggestions using OpenAI's GPT models
- 🌎 **Multi-Location Support**: Manage reviews for multiple business locations with consolidated views
- 📱 **Responsive Design**: Access the platform from any device with a fully optimized experience
- 🔔 **Smart Alerts System**: Receive notifications for critical negative reviews that need attention
- 🏢 **White-Label Capabilities**: For agencies and enterprises with multiple clients
- 💼 **Admin Portal**: Comprehensive customer management and system administration tools
- 🔄 **CRM Integrations**: Connect with popular CRM systems for seamless review collection
- 🔐 **Role-Based Access Control**: Assign specific permissions to staff, managers, and admins
- 🌓 **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- ♿ **WCAG 2.1 AA Compliant**: Accessible to users with disabilities, including screen reader support

## 📋 Technologies

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with role-based permissions
- **AI Integration**: OpenAI API for review response generation
- **Payments**: Subscription management with Stripe
- **Chart Visualization**: Recharts for data visualization
- **State Management**: TanStack Query (React Query) for API data fetching
- **Form Handling**: React Hook Form with Zod validation

## 🛠️ Project Structure

```
repuradar-pro/
├── client/                   # Frontend code
│   ├── src/                  # Source files
│   │   ├── components/       # React components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   ├── layout/       # Layout components
│   │   │   └── ui/           # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── client-admin/ # Client admin pages
│   │   │   └── onboarding/   # Onboarding flow pages
│   │   ├── App.tsx           # Main App component
│   │   └── main.tsx          # Entry point
├── server/                   # Backend code
│   ├── lib/                  # Utility functions
│   ├── middleware/           # Express middleware
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── auth.ts               # Authentication setup
│   ├── index.ts              # Entry point
│   ├── storage.ts            # Storage interface
│   ├── database-storage.ts   # Database implementation
│   └── db.ts                 # Database connection
├── shared/                   # Shared code and types
│   └── schema.ts             # Database schema and types
├── migrations/               # Database migrations
├── scripts/                  # Utility scripts
└── attached_assets/          # Asset files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher) or a managed database service
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/repuradar-pro.git
   cd repuradar-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in the `.env` file:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Secret for session encryption
   - `OPENAI_API_KEY`: OpenAI API key for AI-powered response suggestions

5. Initialize the database:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:5000](http://localhost:5000) in your browser.

8. Login with the following demo credentials:
   - Admin: username `admin`, password `admin123` 
   - Client: username `client`, password `client123`

## ♿ Accessibility Features

RepuRadarPro is designed to be accessible to all users, including those with disabilities. The application is compliant with WCAG 2.1 AA standards and includes:

- **Semantic HTML Structure**: Proper use of headings, landmarks, and HTML5 semantic elements
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Skip Links**: "Skip to main content" links for keyboard users
- **ARIA Attributes**: Properly labeled buttons, forms, and interactive elements
- **Screen Reader Support**: Optimized for screen readers with appropriate announcements for dynamic content
- **Color Contrast**: Meets WCAG 2.1 AA contrast requirements
- **Responsive Design**: Works on all devices and screen sizes
- **Text Alternatives**: All meaningful images have appropriate alt text
- **Form Accessibility**: Properly labeled form controls with clear error messages
- **Dark Mode**: Reduces eye strain in low-light environments

## 🚢 Deployment

### Deployment Options

The application can be deployed to any modern cloud platform:

1. **Replit Deployment**:
   - Use the built-in deployment button in Replit
   - Configure secrets for database and API keys

2. **Containerized Deployment**:
   - The project includes Dockerfile and docker-compose.yml for container-based deployment
   - Can be deployed to Kubernetes, Docker Swarm, or any container orchestration platform

3. **Traditional Hosting**:
   - Deploy to any Node.js hosting environment like Heroku, Render, or DigitalOcean

4. **Serverless Deployment**:
   - Can be adapted for serverless platforms like Vercel or AWS Lambda

### Environment Variables for Production

The following environment variables must be set in production:

```
DATABASE_URL=<postgresql-connection-string>
SESSION_SECRET=<random-secure-string>
OPENAI_API_KEY=<openai-api-key>
NODE_ENV=production
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💰 Subscription Plans

RepuRadarPro offers a tiered subscription model to accommodate businesses of all sizes:

### Free Tier
- Monitor up to 2 locations
- Basic review management
- Limited analytics
- Email support

### Starter Plan - $29/month
- Monitor up to 5 locations
- Full review management
- Basic analytics
- Email and chat support
- Review request campaigns (100/month)

### Growth Plan - $79/month
- Monitor up to 15 locations
- Advanced analytics
- AI-powered response suggestions
- Priority support
- Review request campaigns (500/month)
- White-label reports

### Agency Plan - $199/month
- Monitor up to 50 locations
- All features from Growth plan
- Client management dashboard
- Team collaboration tools
- Unlimited review request campaigns
- API access
- Dedicated account manager

### Enterprise Plan - Custom Pricing
- Unlimited locations
- Custom integrations
- On-premises deployment option
- 24/7 premium support
- Single Sign-On (SSO)
- Custom SLA

All plans include a 14-day free trial with access to all features.

## 🗺️ Roadmap

### Phase 1: Core Build (Completed)
- User authentication & account management
- Basic review monitoring and response capability
- Simple analytics dashboard
- Location management
- Email alerts for negative reviews

### Phase 2: Differentiation Features (Current)
- Advanced AI-powered response suggestions
- Multi-location analytics with consolidated views
- Enhanced client admin portal
- Custom review request campaigns
- Expanded platform integrations
- White-label capabilities

### Phase 3: Future Enhancements (Planned)
- Advanced sentiment analysis with trend tracking
- Competitor benchmarking
- Custom widget builder for embedding reviews
- Review verification system
- Mobile application
- Advanced reporting and exports
- Custom AI training for industry-specific responses

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔒 Security Considerations

RepuRadarPro is built with security in mind:

- **Authentication**: Secure password hashing using scrypt
- **Authorization**: Role-based access control with fine-grained permissions
- **Session Management**: Secure session handling with appropriate timeouts
- **Data Protection**: Input validation and sanitization to prevent injection attacks
- **API Security**: Token-based authentication for API access
- **Environmental Variables**: Sensitive data stored in environment variables, not in code
- **HTTPS**: All communications encrypted via HTTPS

## 👨‍💻 Developer Notes

### Backend Architecture
- RESTful API design with Express routes
- Clear separation between route handlers and business logic
- Data access layer abstraction for storage flexibility
- Error handling middleware for consistent error responses

### Frontend Architecture
- Component-based architecture with React
- Custom hooks for shared logic
- Context API for global state
- TanStack Query for data fetching and caching
- Form validation with Zod schemas
- Protected routes with role-based access control

### Performance Optimizations
- React.lazy for code splitting
- Memoization of expensive components
- Optimized API queries with proper cache invalidation
- Efficient re-rendering with proper dependency arrays
- Image optimization and lazy loading

### Code Style and Standards
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component isolation for better maintainability
- Proper error handling and logging

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/repuradar-pro)
- [Issue Tracker](https://github.com/yourusername/repuradar-pro/issues)
- [Change Log](CHANGELOG.md)

---

Built with ❤️ for businesses who care about their online reputation.