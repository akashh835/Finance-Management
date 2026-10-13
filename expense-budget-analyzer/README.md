# Problem 3: Personal Expense & Budget Analyzer

A personal expense tracking application that helps users manage and analyze daily expenses. Data is stored in the browser using **LocalStorage** so it persists across sessions.

## Mandatory features

- **Add income and expenses** – Form to add transactions with amount, category, description, and date.
- **Category-based classification** – Income categories (Salary, Freelance, Investment, Other Income) and expense categories (Food, Transport, Rent, Utilities, Shopping, Healthcare, Entertainment, Education, Other).
- **Monthly summary** – Select any month/year to see total income, total expenses, and net for that month.
- **Visual indicators** – Text-based bars showing spending by category for the selected month (bar length proportional to amount).
- **LocalStorage for data retention** – All transactions are saved in `localStorage` under the key `expense-budget-analyzer-data`.

## How to run

1. Open the project folder and double-click **`index.html`** to open it in your default browser,  
   **or**
2. Use a simple local server (e.g. from the folder run: `npx serve .` or `python -m http.server 8000`) and open the URL shown (e.g. `http://localhost:8000` or `http://localhost:8000`).

No build step or Node.js is required; the app runs with plain HTML, CSS, and JavaScript.

## Project structure

```
expense-budget-analyzer/
├── index.html   # Main page and structure
├── styles.css   # Styling (dark theme, layout, bars)
├── app.js       # Logic: form, LocalStorage, summary, bars, list
└── README.md    # This file
```

## Usage

1. **Add transaction** – Choose Income or Expense, enter amount, category, optional description, and date, then click “Add transaction”.
2. **Current balance** – Shows total income, total expenses, and balance (income − expenses).
3. **Monthly summary** – Use the month/year dropdowns to view income, expenses, net, and category-wise expense bars for that month.
4. **Recent transactions** – List of latest transactions with option to delete (×).

Clearing site data or LocalStorage for this origin will reset all data.
