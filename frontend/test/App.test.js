/**
 * @jest
 * Basic tests for the frontend App component
 */

// Import dependencies
import { render, screen } from '@testing-library/react';
import App from '../src/App';

// Mock the dependencies
jest.mock('../src/hooks/use-auth', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    isLoading: false,
    error: null,
    loginMutation: { isPending: false },
    logoutMutation: { isPending: false },
    registerMutation: { isPending: false }
  })
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }) => <div>{children}</div>
}));

// Test the App component
describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // This test simply verifies that the App component renders
  });

  it('contains the auth provider', () => {
    render(<App />);
    const authProvider = screen.getByTestId('auth-provider');
    expect(authProvider).toBeInTheDocument();
  });
});