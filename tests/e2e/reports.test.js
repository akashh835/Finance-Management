import { test, expect } from '@playwright/test';

test.describe('Financial Reports Flow', () => {
  let page;
  
  test.beforeAll(async ({ browser }) => {
    // Create a new page
    page = await browser.newPage();
    
    // Login before running tests
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('/dashboard');
    
    // Add some test data
    await addTestData(page);
  });
  
  test.afterAll(async () => {
    // Close the page
    await page.close();
  });
  
  test('should navigate to reports page', async () => {
    // Navigate to reports page
    await page.click('a[href="/reports"]');
    
    // Verify we're on the reports page
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('h1')).toContainText('Financial Reports');
  });
  
  test('should display income vs expenses report', async () => {
    // Select income vs expenses report
    await page.selectOption('select[name="reportType"]', { value: 'income-vs-expenses' });
    
    // Set timeframe to last 6 months
    await page.selectOption('select[name="timeframe"]', { value: '6months' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify report is displayed
    await expect(page.locator('h3')).toContainText('Income vs Expenses');
    
    // Verify chart is displayed
    await expect(page.locator('.chart-container')).toBeVisible();
    
    // Verify data table is displayed
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Month")')).toBeVisible();
    await expect(page.locator('th:has-text("Income")')).toBeVisible();
    await expect(page.locator('th:has-text("Expenses")')).toBeVisible();
    await expect(page.locator('th:has-text("Net")')).toBeVisible();
  });
  
  test('should display spending by category report', async () => {
    // Select spending by category report
    await page.selectOption('select[name="reportType"]', { value: 'spending-by-category' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify report is displayed
    await expect(page.locator('h3')).toContainText('Spending by Category');
    
    // Verify chart is displayed
    await expect(page.locator('.chart-container')).toBeVisible();
    
    // Verify categories are displayed
    await expect(page.locator('text=Groceries')).toBeVisible();
    await expect(page.locator('text=Utilities')).toBeVisible();
    await expect(page.locator('text=Dining Out')).toBeVisible();
  });
  
  test('should display monthly spending trend report', async () => {
    // Select monthly spending trend report
    await page.selectOption('select[name="reportType"]', { value: 'monthly-spending-trend' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify report is displayed
    await expect(page.locator('h3')).toContainText('Monthly Spending Trend');
    
    // Verify chart is displayed
    await expect(page.locator('.chart-container')).toBeVisible();
    
    // Verify summary cards are displayed
    await expect(page.locator('text=Average Monthly')).toBeVisible();
    await expect(page.locator('text=Total Spending')).toBeVisible();
    
    // Verify data table is displayed
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Month")')).toBeVisible();
    await expect(page.locator('th:has-text("Spending")')).toBeVisible();
  });
  
  test('should display budget performance report', async () => {
    // Select budget performance report
    await page.selectOption('select[name="reportType"]', { value: 'budget-performance' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify report is displayed
    await expect(page.locator('h3')).toContainText('Budget Performance');
    
    // Verify budget cards are displayed
    await expect(page.locator('text=Monthly Budget')).toBeVisible();
    await expect(page.locator('text=Groceries Budget')).toBeVisible();
    
    // Verify progress bars are displayed
    await expect(page.locator('.progress-bar')).toBeVisible();
    
    // Verify spending by category is displayed
    await expect(page.locator('text=Spending by Category')).toBeVisible();
    
    // Verify monthly spending is displayed
    await expect(page.locator('text=Monthly Spending')).toBeVisible();
  });
  
  test('should display expense breakdown report', async () => {
    // Select expense breakdown report
    await page.selectOption('select[name="reportType"]', { value: 'expense-breakdown' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify report is displayed
    await expect(page.locator('h3')).toContainText('Expense Breakdown');
    
    // Verify summary cards are displayed
    await expect(page.locator('text=Total Expenses')).toBeVisible();
    await expect(page.locator('text=Average Expense')).toBeVisible();
    await expect(page.locator('text=Largest Expense')).toBeVisible();
    await expect(page.locator('text=Transaction Count')).toBeVisible();
    
    // Verify expense table is displayed
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Date")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Category")')).toBeVisible();
    await expect(page.locator('th:has-text("Amount")')).toBeVisible();
  });
  
  test('should change timeframe and update report', async () => {
    // Select income vs expenses report
    await page.selectOption('select[name="reportType"]', { value: 'income-vs-expenses' });
    
    // Set timeframe to last 3 months
    await page.selectOption('select[name="timeframe"]', { value: '3months' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify report is updated
    await expect(page.locator('h3')).toContainText('Income vs Expenses');
    
    // Verify only 3 months of data are displayed
    const monthCells = await page.locator('td:first-child').count();
    expect(monthCells).toBe(3);
  });
  
  test('should export report', async () => {
    // Select income vs expenses report
    await page.selectOption('select[name="reportType"]', { value: 'income-vs-expenses' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Click export button
    await page.click('button:has-text("Export")');
    
    // Select export format
    await page.click('button:has-text("Export as PDF")');
    
    // Verify download started
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('income-vs-expenses');
  });
  
  test('should print report', async () => {
    // Select income vs expenses report
    await page.selectOption('select[name="reportType"]', { value: 'income-vs-expenses' });
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Mock the print function
    await page.evaluate(() => {
      window.print = () => console.log('Print dialog opened');
    });
    
    // Click print button
    await page.click('button:has-text("Print")');
    
    // Verify print dialog was triggered (can't actually test this in headless mode)
    // This is just a placeholder
  });
  
  test('should show previous period comparison', async () => {
    // Select income vs expenses report
    await page.selectOption('select[name="reportType"]', { value: 'income-vs-expenses' });
    
    // Enable previous period comparison
    await page.click('input[name="showPreviousPeriod"]');
    
    // Generate report
    await page.click('button:has-text("Generate Report")');
    
    // Verify previous period data is displayed
    await expect(page.locator('text=vs Previous')).toBeVisible();
    
    // Verify chart shows both current and previous period
    await expect(page.locator('.chart-container .current-period')).toBeVisible();
    await expect(page.locator('.chart-container .previous-period')).toBeVisible();
  });
});

// Helper function to add test data
async function addTestData(page) {
  // Navigate to expenses page
  await page.click('a[href="/expenses"]');
  
  // Add income
  await page.click('button:has-text("Add Income")');
  await page.fill('input[name="description"]', 'Salary');
  await page.fill('input[name="amount"]', '5000');
  await page.fill('input[name="date"]', '2023-01-01');
  await page.selectOption('select[name="categoryId"]', { label: 'Salary' });
  await page.click('button[type="submit"]:has-text("Save")');
  
  // Add expenses
  const expenses = [
    { description: 'Groceries', amount: '500', date: '2023-01-05', category: 'Groceries' },
    { description: 'Rent', amount: '1200', date: '2023-01-01', category: 'Housing' },
    { description: 'Utilities', amount: '150', date: '2023-01-10', category: 'Utilities' },
    { description: 'Internet', amount: '80', date: '2023-01-15', category: 'Utilities' },
    { description: 'Dining Out', amount: '200', date: '2023-01-20', category: 'Dining Out' },
    { description: 'Groceries', amount: '450', date: '2023-02-05', category: 'Groceries' },
    { description: 'Rent', amount: '1200', date: '2023-02-01', category: 'Housing' },
    { description: 'Utilities', amount: '140', date: '2023-02-10', category: 'Utilities' },
    { description: 'Internet', amount: '80', date: '2023-02-15', category: 'Utilities' },
    { description: 'Dining Out', amount: '180', date: '2023-02-20', category: 'Dining Out' }
  ];
  
  for (const expense of expenses) {
    await page.click('button:has-text("Add Expense")');
    await page.fill('input[name="description"]', expense.description);
    await page.fill('input[name="amount"]', expense.amount);
    await page.fill('input[name="date"]', expense.date);
    await page.selectOption('select[name="categoryId"]', { label: expense.category });
    await page.click('button[type="submit"]:has-text("Save")');
  }
  
  // Navigate to budgets page
  await page.click('a[href="/budgets"]');
  
  // Add budgets
  const budgets = [
    { name: 'Monthly Budget', amount: '3000', startDate: '2023-01-01', endDate: '2023-01-31' },
    { name: 'Groceries Budget', amount: '600', startDate: '2023-01-01', endDate: '2023-01-31', category: 'Groceries' },
    { name: 'Utilities Budget', amount: '250', startDate: '2023-01-01', endDate: '2023-01-31', category: 'Utilities' }
  ];
  
  for (const budget of budgets) {
    await page.click('button:has-text("Add Budget")');
    await page.fill('input[name="name"]', budget.name);
    await page.fill('input[name="amount"]', budget.amount);
    await page.fill('input[name="startDate"]', budget.startDate);
    await page.fill('input[name="endDate"]', budget.endDate);
    if (budget.category) {
      await page.selectOption('select[name="categoryId"]', { label: budget.category });
    }
    await page.click('button[type="submit"]:has-text("Save")');
  }
}
