import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import Login from '../../src/pages/Login';
import Register from '../../src/pages/Register';
import ForgotPassword from '../../src/pages/ForgotPassword';
import ResetPassword from '../../src/pages/ResetPassword';
import Profile from '../../src/pages/Profile';
import * as authService from '../../src/services/authService';

// Mock the auth service
vi.mock('../../src/services/authService');

// Mock the useNavigate and useParams hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ token: 'reset-token' }),
  };
});

describe('Login Page', () => {
  it('should render the login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});

// Add other test cases here...
// Mock the auth service
vi.mock('../../src/services/authService');

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  // We recommend installing an extension to run vitest tests.

  describe('Profile Page', () => {
    it('should render profile details', () => {
      // Arrange & Act
      // filepath: f:\finance\tests\integration\auth.test.jsx

      // Mock the auth service
      vi.mock('../../src/services/authService');
      // filepath: f:\finance\tests\integration\auth.test.jsx

      // Mock the auth service
      vi.mock('../../src/services/authService');

      // Mock the useNavigate hook
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => vi.fn(),
        };
      });

      describe('Profile Page', () => {
        it('should render profile details', () => {
          render(
            <BrowserRouter>
              <AuthProvider>
                <Profile />
              </AuthProvider>
            </BrowserRouter>
          );

          expect(screen.getByText(/profile/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
        });

        it('should handle profile update', async () => {
          const mockResponse = { success: true, message: 'Profile updated successfully' };
          authService.updateProfile.mockResolvedValue(mockResponse);

          render(
            <BrowserRouter>
              <AuthProvider>
                <Profile />
              </AuthProvider>
            </BrowserRouter>
          );

          fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
          fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

          await waitFor(() => {
            expect(authService.updateProfile).toHaveBeenCalledWith({
              name: 'Updated User',
            });
          });
          expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
        });

        it('should display error message on profile update failure', async () => {
          const errorMessage = 'Failed to update profile';
          authService.updateProfile.mockRejectedValue(new Error(errorMessage));

          render(
            <BrowserRouter>
              <AuthProvider>
                <Profile />
              </AuthProvider>
            </BrowserRouter>
          );

          fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
          fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

          await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
          });
        });

        it('should render a logout button', () => {
          render(
            <BrowserRouter>
              <AuthProvider>
                <Profile />
              </AuthProvider>
            </BrowserRouter>
          );

          expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
        });

        it('should handle logout', async () => {
          const mockNavigate = vi.fn();
          vi.mock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
              ...actual,
              useNavigate: () => mockNavigate,
            };
          });

          render(
            <BrowserRouter>
              <AuthProvider>
                <Profile />
              </AuthProvider>
            </BrowserRouter>
          );

          fireEvent.click(screen.getByRole('button', { name: /logout/i }));

          await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
          });
        });
      });

      it('should handle profile update', async () => {
        // Arrange
        const mockResponse = { success: true, message: 'Profile updated successfully' };
        authService.updateProfile.mockResolvedValue(mockResponse);
      
        render(
          <BrowserRouter>
            <AuthProvider>
              <Profile />
            </AuthProvider>
          </BrowserRouter>
        );
      
        // Act
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
        fireEvent.click(screen.getByRole('button', { name: /update profile/i }));
      
        // Assert
        await waitFor(() => {
          expect(authService.updateProfile).toHaveBeenCalledWith({
            name: 'Updated User',
          });
        });
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });

        it('should display error message on profile update failure', async () => {
          const errorMessage = 'Failed to update profile';
          authService.updateProfile.mockRejectedValue(new Error(errorMessage));

          render(
            <BrowserRouter>
              <AuthProvider>
                <Profile />
              </AuthProvider>
            </BrowserRouter>
          );

          fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
          fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

          await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
          });
        });
      });

      describe('Login Page', () => {
        it('should render login form', () => {
          render(
            <BrowserRouter>
              <AuthProvider>
                <Login />
              </AuthProvider>
            </BrowserRouter>
          );

          expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
          expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        });

        it('should handle login submission', async () => {
          const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
          const mockResponse = { success: true, token: 'fake-token', user: mockUser };
          authService.login.mockResolvedValue(mockResponse);

          render(
            <BrowserRouter>
              <AuthProvider>
                <Login />
              </AuthProvider>
            </BrowserRouter>
          );

          fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
          fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
          fireEvent.click(screen.getByRole('button', { name: /login/i }));

          await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
              email: 'test@example.com',
              password: 'password123',
            });
          });
        });

        it('should display error message on login failure', async () => {
          const errorMessage = 'Invalid credentials';
          authService.login.mockRejectedValue(new Error(errorMessage));

          render(
            <BrowserRouter>
              <AuthProvider>
                <Login />
              </AuthProvider>
            </BrowserRouter>
          );

          fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
          fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong-password' } });
          fireEvent.click(screen.getByRole('button', { name: /login/i }));

          await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
          });
        });
      });

      // Act
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
      fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

      // Assert
      await waitFor(() => {
        expect(authService.updateProfile).toHaveBeenCalledWith({
          name: 'Updated User',
        });
      });
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });

    it('should display error message on profile update failure', async () => {
      // Arrange
      const errorMessage = 'Failed to update profile';
      authService.updateProfile.mockRejectedValue(new Error(errorMessage));

      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      // Act
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Updated User' } });
      fireEvent.click(screen.getByRole('button', { name: /update profile/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
  describe('Login Page', () => {
    it('should render login form', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });
    
    it('should handle form submission', async () => {
      // Arrange
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockResponse = { success: true, token: 'fake-token', user: mockUser };
      authService.login.mockResolvedValue(mockResponse);
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      // Assert
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });
    
    it('should display error message on login failure', async () => {
      // Arrange
      const errorMessage = 'Invalid credentials';
      authService.login.mockRejectedValue(new Error(errorMessage));
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong-password' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });
  
  describe('Register Page', () => {
    it('should render registration form', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });
    
    it('should handle form submission', async () => {
      // Arrange
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockResponse = { success: true, token: 'fake-token', user: mockUser };
      authService.register.mockResolvedValue(mockResponse);
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      // Assert
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });
    
    it('should validate password match', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different-password' } });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
      expect(authService.register).not.toHaveBeenCalled();
    });
  });
  
  describe('Forgot Password Page', () => {
    it('should render forgot password form', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });
    
    it('should handle form submission', async () => {
      // Arrange
      const mockResponse = { success: true, message: 'Password reset email sent' };
      authService.forgotPassword.mockResolvedValue(mockResponse);
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      
      // Assert
      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      });
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
    });
  });
  
  describe('Reset Password Page', () => {
    it('should render reset password form', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <ResetPassword />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
    
    it('should handle form submission', async () => {
      // Arrange
      const mockResponse = { success: true, message: 'Password reset successful' };
      authService.resetPassword.mockResolvedValue(mockResponse);
      
      // Mock useParams to return a token
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => ({ token: 'reset-token' }),
          useNavigate: () => vi.fn()
        };
      });
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <ResetPassword />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'new-password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'new-password123' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      
      // Assert
      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith('reset-token', 'new-password123');
      });
    });
    
    it('should validate password match', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <AuthProvider>
            <ResetPassword />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'new-password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different-password' } });
      fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });
  });
});
