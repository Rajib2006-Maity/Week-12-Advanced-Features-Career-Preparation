import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Login from '../pages/Login.jsx';

// Mock the auth hook so we can control login() and assert it was called correctly,
// without needing a real backend during unit tests.
const loginMock = vi.fn();
vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ login: loginMock })
}));

const renderLogin = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('Login page', () => {
  test('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('calls login with entered credentials on submit', async () => {
    loginMock.mockResolvedValueOnce({ id: '1', name: 'Test User' });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'SecurePass123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'SecurePass123');
    });
  });

  test('shows an error message when login fails', async () => {
    loginMock.mockRejectedValueOnce({ response: { data: { message: 'Invalid email or password' } } });
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass1' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
