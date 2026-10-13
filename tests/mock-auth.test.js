import { describe, it, expect, vi } from 'vitest';

// Mock service
const authService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn()
};

describe('Authentication Service - Mock Test', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('login should be called with correct parameters', async () => {
    // Arrange
    const credentials = { email: 'test@example.com', password: 'password123' };
    authService.login.mockResolvedValue({ token: 'fake-token', user: { id: '123' } });
    
    // Act
    await authService.login(credentials);
    
    // Assert
    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('register should be called with correct parameters', async () => {
    // Arrange
    const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
    authService.register.mockResolvedValue({ token: 'fake-token', user: { id: '123' } });
    
    // Act
    await authService.register(userData);
    
    // Assert
    expect(authService.register).toHaveBeenCalledWith(userData);
    expect(authService.register).toHaveBeenCalledTimes(1);
  });
});
