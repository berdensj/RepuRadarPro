# Changelog

All notable changes to the RepuRadar project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline for automated testing and deployment
- Docker and Docker Compose configuration for containerized development and deployment
- AWS Elastic Beanstalk deployment support
- Comprehensive project documentation in README.md

### Changed
- Restructured codebase into dedicated frontend and backend directories for better organization
- Updated package.json with optimized scripts for development and production
- Enhanced development workflow with proper environment configuration

## [1.0.0] - 2025-05-11

### Added
- Subscription system with four tiers (Free, Basic, Pro, Enterprise)
- 14-day trial period with full feature access
- Stripe integration for payment processing
- User schema updates to support subscription-related fields
- Admin dashboard for subscription management

### Changed
- Enhanced authentication with case-insensitive username/email lookup
- Improved error messaging for better user experience
- Updated database schema for subscription support

### Fixed
- Authentication edge cases with special characters in usernames
- Session persistence issues after browser refresh

## [0.9.0] - 2025-05-05

### Added
- Global location selector for integrations page
- Feature to apply location selection to all integration forms at once
- Multi-location support for analytics with consolidated view option
- Company logo customization feature for client dashboard

### Changed
- Redesigned integrations page for better user experience
- Improved UI responsiveness across all pages
- Enhanced dashboard metrics visualization

### Fixed
- Location filter persistence between page navigation
- Analytics data loading performance issues

## [0.8.0] - 2025-04-28

### Added
- Customer onboarding page with task checklist
- Progress tracking functionality for onboarding process
- Admin-specific customer management page
- Role-based access control with admin, staff, and user permissions

### Changed
- Redesigned dashboard for better data visualization
- Improved review management interface
- Enhanced mobile responsiveness

### Fixed
- Review filtering performance issues
- Dashboard data loading delays

## [0.7.0] - 2025-04-20

### Added
- OpenAI integration for AI-powered reply suggestions
- Analytics page with customer-specific location metrics
- External API integrations for Google, Yelp, and Facebook
- Webhook support for real-time review updates

### Changed
- Enhanced review management workflow
- Improved sentiment analysis accuracy
- Optimized database queries for better performance

### Fixed
- Authentication token refresh issues
- Review data synchronization problems

## [0.6.0] - 2025-04-12

### Added
- Apple Maps integration for location-based review monitoring
- Competitor analysis features
- Advanced filtering for reviews by date, platform, and rating
- Email notification system for critical reviews

### Changed
- Enhanced UI with improved card-based design
- Updated navigation with more intuitive sidebar
- Redesigned alert system for better visibility

### Fixed
- Review sorting inconsistencies
- Dashboard metrics calculation errors

## [0.5.0] - 2025-04-05

### Added
- Initial database migration from in-memory storage to PostgreSQL
- Multi-location support for businesses with multiple branches
- Review templates for quick responses
- Alert system for negative reviews

### Changed
- Enhanced authentication security
- Improved dashboard performance
- Updated UI with cleaner design

### Fixed
- User session management issues
- Data persistence problems

## [0.4.0] - 2025-03-29

### Added
- Review management functionality
- Platform-specific review tracking
- Initial analytics dashboard
- User profile management

### Changed
- Improved authentication flow
- Enhanced UI with Tailwind CSS
- Updated responsive design for mobile devices

## [0.3.0] - 2025-03-22

### Added
- Protected routes for dashboard access
- Initial implementation of review listing
- Basic analytics visualization
- User settings page

### Changed
- Redesigned authentication pages
- Improved navigation with sidebar
- Enhanced form validation

## [0.2.0] - 2025-03-15

### Added
- User authentication (register, login, logout)
- Basic dashboard structure
- Initial database schema design
- Frontend routing with wouter

### Changed
- Updated UI components with shadcn/ui
- Improved project structure

## [0.1.0] - 2025-03-08

### Added
- Initial project setup
- Base application structure
- Core dependencies installation
- Development environment configuration