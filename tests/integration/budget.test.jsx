import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { FinanceProvider } from '../../src/context/FinanceContext';
import Budgets from '../../src/pages/Budgets';
import BudgetDetail from '../../src/pages/BudgetDetail';
import BudgetForm from '../../src/components/BudgetForm';
import * as budgetService from '../../src/services/budgetService';
import * as categoryService from '../../src/services/categoryService';

// Mock the services
vi.mock('../../src/services/budgetService');
vi.mock('../../src/services/categoryService');

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' })
  };
});

describe('Budget Management Flow', () => {
  const mockBudgets = [
    { 
      id: '1', 
      name: 'Monthly Budget', 
      amount: 1000, 
      startDate: '2023-01-01', 
      endDate: '2023-01-31' 
    },
    { 
      id: '2', 
      name: 'Groceries', 
      amount: 300, 
      startDate: '2023-01-01', 
      endDate: '2023-01-31' 
    }
  ];
  
  const mockCategories = [
    { id: '1', name: 'Groceries', color: '#FF5733', type: 'expense' },
    { id: '2', name: 'Utilities', color: '#33FF57', type: 'expense' }
  ];
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Setup default mock responses
    budgetService.getBudgets.mockResolvedValue(mockBudgets);
    budgetService.getBudgetById.mockResolvedValue(mockBudgets[0]);
    categoryService.getCategories.mockResolvedValue(mockCategories);
  });
  
  afterEach(() => {
    // Restore mocks after each test
    vi.restoreAllMocks();
  });
  
  describe('Budgets Page', () => {
    it('should render list of budgets', async () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <Budgets />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      await waitFor(() => {
        expect(budgetService.getBudgets).toHaveBeenCalled();
      });
      
      expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      expect(screen.getByText('$300.00')).toBeInTheDocument();
    });
    
    it('should open create budget form when add button is clicked', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <Budgets />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Wait for budgets to load
      await waitFor(() => {
        expect(budgetService.getBudgets).toHaveBeenCalled();
      });
      
      // Act
      fireEvent.click(screen.getByRole('button', { name: /add budget/i }));
      
      // Assert
      expect(screen.getByText(/create budget/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });
    
    it('should filter budgets when search is used', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <Budgets />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Wait for budgets to load
      await waitFor(() => {
        expect(budgetService.getBudgets).toHaveBeenCalled();
      });
      
      // Act
      fireEvent.change(screen.getByPlaceholderText(/search budgets/i), { target: { value: 'Groceries' } });
      
      // Assert
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.queryByText('Monthly Budget')).not.toBeInTheDocument();
    });
  });
  
  describe('Budget Detail Page', () => {
    it('should render budget details', async () => {
      // Arrange
      const mockBudget = {
        id: '1',
        name: 'Monthly Budget',
        amount: 1000,
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        notes: 'Budget for January'
      };
      
      const mockExpenses = [
        { id: '1', description: 'Groceries', amount: 50, date: '2023-01-05' },
        { id: '2', description: 'Utilities', amount: 100, date: '2023-01-10' }
      ];
      
      budgetService.getBudgetById.mockResolvedValue(mockBudget);
      budgetService.getBudgetExpenses.mockResolvedValue(mockExpenses);
      
      // Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetDetail />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      await waitFor(() => {
        expect(budgetService.getBudgetById).toHaveBeenCalledWith('1');
      });
      
      expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
      expect(screen.getByText('$1,000.00')).toBeInTheDocument();
      expect(screen.getByText('Budget for January')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(budgetService.getBudgetExpenses).toHaveBeenCalledWith('1');
      });
      
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
    
    it('should open edit budget form when edit button is clicked', async () => {
      // Arrange
      const mockBudget = {
        id: '1',
        name: 'Monthly Budget',
        amount: 1000,
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      };
      
      budgetService.getBudgetById.mockResolvedValue(mockBudget);
      budgetService.getBudgetExpenses.mockResolvedValue([]);
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetDetail />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Wait for budget to load
      await waitFor(() => {
        expect(budgetService.getBudgetById).toHaveBeenCalledWith('1');
      });
      
      // Act
      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      
      // Assert
      expect(screen.getByText(/edit budget/i)).toBeInTheDocument();
      
      const nameInput = screen.getByLabelText(/budget name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.value).toBe('Monthly Budget');
      
      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toBeInTheDocument();
      expect(amountInput.value).toBe('1000');
    });
    
    it('should confirm before deleting a budget', async () => {
      // Arrange
      const mockBudget = {
        id: '1',
        name: 'Monthly Budget',
        amount: 1000,
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      };
      
      budgetService.getBudgetById.mockResolvedValue(mockBudget);
      budgetService.getBudgetExpenses.mockResolvedValue([]);
      budgetService.deleteBudget.mockResolvedValue({});
      
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = vi.fn(() => true);
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetDetail />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Wait for budget to load
      await waitFor(() => {
        expect(budgetService.getBudgetById).toHaveBeenCalledWith('1');
      });
      
      // Act
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      
      // Assert
      expect(window.confirm).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(budgetService.deleteBudget).toHaveBeenCalledWith('1');
      });
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });
  
  describe('Budget Form', () => {
    it('should render create budget form', () => {
      // Arrange & Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetForm onSubmit={vi.fn()} onCancel={vi.fn()} />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      expect(screen.getByText(/create budget/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/budget name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
    
    it('should render edit budget form with prefilled values', () => {
      // Arrange
      const budget = {
        id: '1',
        name: 'Monthly Budget',
        amount: 1000,
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        categoryId: '1',
        notes: 'Budget for January'
      };
      
      // Act
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetForm budget={budget} onSubmit={vi.fn()} onCancel={vi.fn()} />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Assert
      expect(screen.getByText(/edit budget/i)).toBeInTheDocument();
      
      const nameInput = screen.getByLabelText(/budget name/i);
      expect(nameInput).toBeInTheDocument();
      expect(nameInput.value).toBe('Monthly Budget');
      
      const amountInput = screen.getByLabelText(/amount/i);
      expect(amountInput).toBeInTheDocument();
      expect(amountInput.value).toBe('1000');
      
      const notesInput = screen.getByLabelText(/notes/i);
      expect(notesInput).toBeInTheDocument();
      expect(notesInput.value).toBe('Budget for January');
    });
    
    it('should validate form inputs', async () => {
      // Arrange
      const onSubmitMock = vi.fn();
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetForm onSubmit={onSubmitMock} onCancel={vi.fn()} />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act - Submit without filling required fields
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/budget name is required/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      expect(onSubmitMock).not.toHaveBeenCalled();
      
      // Act - Fill required fields and submit
      fireEvent.change(screen.getByLabelText(/budget name/i), { target: { value: 'New Budget' } });
      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '500' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      
      // Assert
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          name: 'New Budget',
          amount: 500,
          startDate: expect.any(String),
          endDate: expect.any(String),
          categoryId: '',
          notes: ''
        });
      });
    });
    
    it('should call onCancel when cancel button is clicked', () => {
      // Arrange
      const onCancelMock = vi.fn();
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <FinanceProvider>
              <BudgetForm onSubmit={vi.fn()} onCancel={onCancelMock} />
            </FinanceProvider>
          </AuthProvider>
        </BrowserRouter>
      );
      
      // Act
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      
      // Assert
      expect(onCancelMock).toHaveBeenCalled();
    });
  });
});
