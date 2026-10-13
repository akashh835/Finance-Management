import { test, expect} from '@playwright/test';

test.describe('Expense Tracking Flow', () => {
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
  });
  
  test.afterAll(async () => {
    // Close the page
    await page.close();
  });
  
  test('should navigate to expenses page', async () => {
    // Navigate to expenses page
    await page.click('a[href="/expenses"]');
    
    // Verify we're on the expenses page
    await expect(page).toHaveURL('/expenses');
    await expect(page.locator('h1')).toContainText('Expenses');
  });
  
  test('should add a new expense', async () => {
    // Click the add expense button
    await page.click('button:has-text("Add Expense")');
    
    // Fill out the expense form
    await page.fill('input[name="description"]', 'Grocery Shopping');
    await page.fill('input[name="amount"]', '75.50');
    await page.fill('input[name="date"]', '2023-01-15');
    await page.selectOption('select[name="categoryId"]', { label: 'Groceries' });
    await page.fill('textarea[name="notes"]', 'Weekly grocery shopping');
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Verify the expense was added
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=$75.50')).toBeVisible();
  });
  
  test('should add a new income', async () => {
    // Click the add income button
    await page.click('button:has-text("Add Income")');
    
    // Fill out the income form
    await page.fill('input[name="description"]', 'Salary');
    await page.fill('input[name="amount"]', '2000');
    await page.fill('input[name="date"]', '2023-01-01');
    await page.selectOption('select[name="categoryId"]', { label: 'Salary' });
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Verify the income was added
    await expect(page.locator('text=Salary')).toBeVisible();
    await expect(page.locator('text=$2,000.00')).toBeVisible();
  });
  
  test('should filter expenses', async () => {
    // Filter by expense type
    await page.selectOption('select[name="type"]', { value: 'expense' });
    
    // Verify only expenses are shown
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Salary')).not.toBeVisible();
    
    // Filter by category
    await page.selectOption('select[name="categoryId"]', { label: 'Groceries' });
    
    // Verify only grocery expenses are shown
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    
    // Clear filters
    await page.click('button:has-text("Clear Filters")');
    
    // Verify all transactions are shown
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Salary')).toBeVisible();
  });
  
  test('should search expenses', async () => {
    // Search for "grocery"
    await page.fill('input[placeholder="Search expenses"]', 'grocery');
    
    // Verify only matching expenses are shown
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Salary')).not.toBeVisible();
    
    // Clear search
    await page.fill('input[placeholder="Search expenses"]', '');
    
    // Verify all transactions are shown
    await expect(page.locator('text=Grocery Shopping')).toBeVisible();
    await expect(page.locator('text=Salary')).toBeVisible();
  });
  
  test('should edit an expense', async () => {
    // Find and click the edit button for the grocery expense
    await page.click('text=Grocery Shopping >> xpath=../.. >> button[aria-label="Edit"]');
    
    // Update the expense
    await page.fill('input[name="description"]', 'Grocery Shopping (Updated)');
    await page.fill('input[name="amount"]', '80.75');
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Verify the expense was updated
    await expect(page.locator('text=Grocery Shopping (Updated)')).toBeVisible();
    await expect(page.locator('text=$80.75')).toBeVisible();
  });
  
  test('should delete an expense', async () => {
    // Find and click the delete button for the grocery expense
    await page.click('text=Grocery Shopping (Updated) >> xpath=../.. >> button[aria-label="Delete"]');
    
    // Confirm deletion
    await page.click('button:has-text("Yes, delete it")');
    
    // Verify the expense was deleted
    await expect(page.locator('text=Grocery Shopping (Updated)')).not.toBeVisible();
  });
  
  test('should navigate to expense details', async () => {
    // Click on the salary income to view details
    await page.click('text=Salary');
    
    // Verify we're on the expense details page
    await expect(page.locator('h1')).toContainText('Transaction Details');
    await expect(page.locator('text=Salary')).toBeVisible();
    await expect(page.locator('text=$2,000.00')).toBeVisible();
    
    // Go back to expenses list
    await page.click('button:has-text("Back")');
    
    // Verify we're back on the expenses page
    await expect(page).toHaveURL('/expenses');
  });
  
  test('should export expenses', async () => {
    // Click the export button
    await page.click('button:has-text("Export")');
    
    // Select export format
    await page.click('button:has-text("Export as CSV")');
    
    // Verify download started
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('expenses');
  });
  
  test('should import expenses', async () => {
    // Click the import button
    await page.click('button:has-text("Import")');
    
    // Upload a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Choose File")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'expenses.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('Date,Description,Amount,Category,Type\n2023-01-20,Utilities,120,Utilities,expense')
    });
    
    // Map columns
    await page.selectOption('select[name="dateColumn"]', { value: 'Date' });
    await page.selectOption('select[name="descriptionColumn"]', { value: 'Description' });
    await page.selectOption('select[name="amountColumn"]', { value: 'Amount' });
    await page.selectOption('select[name="categoryColumn"]', { value: 'Category' });
    await page.selectOption('select[name="typeColumn"]', { value: 'Type' });
    
    // Submit the import
    await page.click('button:has-text("Import")');
    
    // Verify the imported expense is shown
    await expect(page.locator('text=Utilities')).toBeVisible();
    await expect(page.locator('text=$120.00')).toBeVisible();
  });
});
