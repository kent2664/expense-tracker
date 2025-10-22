/// ===================================
// Data Persistence Logic (localStorage)
// ===================================

const STORAGE_KEY = 'expenseTrackerData';
let selectedCategory = null; 
// currentMonth will be set to the actual current month in initApp/initIndexPage
let currentMonth = new Date().toLocaleString('default', { month: 'long' });
let currentCategoryFilter = 'All'; 

/**
 * Default limit structure for initialization.
 */
const defaultCategoryLimits = {
    "Transportation": 0,
    "Education": 0,
    "Medical": 0,
    "Essentials": 0,
    "Clothes": 0,
    "Phone": 0,
    "Eat-out": 0,
    "Savings": 0,
    "Date": 0,
    "Work Out": 0,
};

/**
 * Default data structure.
 * - categoryLimits is an object mapping month name to its limits.
 * - monthlyBudget is an object mapping month name to its calculated budget.
 */
const defaultData = {
    budget: 0, 
    categoryLimits: {}, // { "MonthName": { "Category": limit_amount, ... } }
    monthlyBudget: {}, // { "MonthName": calculated_budget }
    expenses: []
};

/**
 * Helper function to check if a value is a plain object
 */
function isObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Loads data from localStorage or returns default data.
 * @returns {object} The application data (budget and expenses).
 */
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsedData = JSON.parse(data);
        
        // ** Migration Logic for Old Budget Structure **
        // If data.categoryLimits is NOT an object (it was the old flat structure)
        if (parsedData.categoryLimits && !isObject(parsedData.categoryLimits)) {
            const tempLimits = { ...defaultCategoryLimits, ...parsedData.categoryLimits };
            const calculatedBudget = Object.values(tempLimits).reduce((sum, limit) => sum + limit, 0);
            
            // Migrate old flat structure to new monthly structure for the current month
            const initialMonth = new Date().toLocaleString('en-US', { month: 'long' });
            parsedData.categoryLimits = { [initialMonth]: tempLimits };
            parsedData.monthlyBudget = { [initialMonth]: calculatedBudget };
            // Set data.budget to 0 as it's now calculated monthly
            parsedData.budget = 0; 
        }
        
        // Ensures the main objects exist
        if (!parsedData.categoryLimits) parsedData.categoryLimits = {};
        if (!parsedData.monthlyBudget) parsedData.monthlyBudget = {};

        return parsedData;
    }
    return defaultData;
}

/**
 * Saves data to localStorage.
 * @param {object} data The application data to save.
 */
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Generates a simple unique ID.
 * @returns {number} The new ID.
 */
function generateId(data) {
    // Finds the maximum ID in existing expenses
    const maxId = data.expenses.reduce((max, expense) => Math.max(max, expense.id), 0);
    return maxId + 1;
}

// ===================================
// Interaction Functions (Category Buttons)
// ===================================

/**
 * Adds the click listener for all category buttons on a page.
 * @param {string} containerId The ID of the buttons container.
 * @param {string} buttonClass The CSS class of the buttons.
 */
function setupCategoryListeners(containerId, buttonClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('click', (e) => {
        // Finds the nearest category button that was clicked
        const button = e.target.closest(`.${buttonClass}`);
        if (!button) return;

        // Removes the selection class from all buttons
        document.querySelectorAll(`.${buttonClass}`).forEach(btn => {
            btn.classList.remove('border-2', 'border-[var(--main-color)]', 'text-[var(--main-color)]');
        });

        // Adds the selection class to the clicked button
        button.classList.add('border-2', 'border-[var(--main-color)]', 'text-[var(--main-color)]');

        // Updates the global variable
        selectedCategory = button.dataset.category;
    });
}

/**
 * Sets the selected category (used to populate the edit form).
 * @param {string} categoryName The name of the category to be selected.
 * @param {string} buttonClass The CSS class of the buttons.
 */
function setSelectedCategory(categoryName, buttonClass) {
    document.querySelectorAll(`.${buttonClass}`).forEach(btn => {
        if (btn.dataset.category === categoryName) {
            btn.classList.add('border-2', 'border-[var(--main-color)]', 'text-[var(--main-color)]');
            selectedCategory = categoryName;
        } else {
            btn.classList.remove('border-2', 'border-[var(--main-color)]', 'text-[var(--main-color)]');
        }
    });
}

// ===================================
// Per Page Initialization Functions
// ===================================

function initIndexPage() {
    // 1. Set currentMonth to the actual current month name
    currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    // 2. Setup Month and Category Dropdown Listeners
    setupDropdownListeners();

    // 3. Render Expenses (filtered by current month/category)
    // Initializes the current month display based on the actual current month
    const currentMonthDisplay = document.getElementById('current-month-display');
    if (currentMonthDisplay) currentMonthDisplay.textContent = currentMonth;
    
    renderExpenses(currentMonth, currentCategoryFilter);
    
    // 4. Calculate Totals (including remaining budget)
    calculateTotals();

    // 5. Check and show limit notifications
    checkCategoryLimits(); 

    // 6. Event listener for expense edit links
    const expenseListContainer = document.getElementById('expense-list-container');
    if (expenseListContainer) {
        expenseListContainer.addEventListener('click', (e) => {
            const link = e.target.closest('.edit-expense-link');
            if (link) {
                e.preventDefault();
                const expenseId = link.dataset.id;
                // Stores the expense ID in localStorage for the edit page
                localStorage.setItem('editingExpenseId', expenseId);
                // UPDATED: Path now points to pages/editExpense.html
                window.location.href = 'pages/editExpense.html'; 
            }
        });
    }
}

/**
 * Sets up listeners for Month and Category dropdowns on the index page.
 */
function setupDropdownListeners() {
    // Selectors for Month
    const monthSelectorBtn = document.getElementById('month-selector-btn');
    const monthDropdown = document.getElementById('month-dropdown');
    const monthArrow = document.getElementById('month-arrow');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const monthOptions = document.querySelectorAll('.month-option');

    // Selectors for Category
    const categoryFilterBtn = document.getElementById('category-filter-btn');
    const categoryDropdown = document.getElementById('category-dropdown');
    const currentCategoryDisplay = document.getElementById('current-category-display');
    const categoryOptions = document.querySelectorAll('.category-option');

    // Initialize month display based on the global variable
    if (currentMonthDisplay) currentMonthDisplay.textContent = currentMonth;


    // =========================================================================
    // 1. Month Dropdown Logic
    // =========================================================================
    if (monthSelectorBtn && monthDropdown) {
        monthSelectorBtn.addEventListener('click', () => {
            const isHidden = monthDropdown.classList.contains('hidden');
            
            // Closes the category dropdown, if open
            if(categoryDropdown) categoryDropdown.classList.add('hidden'); 

            if (isHidden) {
                monthDropdown.classList.remove('hidden');
                if(monthArrow) monthArrow.classList.add('rotate-180');
            } else {
                monthDropdown.classList.add('hidden');
                if(monthArrow) monthArrow.classList.remove('rotate-180');
            }
        });
    }

    // Select Month
    monthOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const newMonth = e.target.getAttribute('data-month');
            
            currentMonth = newMonth; // UPDATES THE GLOBAL VARIABLE
            
            // 1. Updates text and hides
            if(currentMonthDisplay) currentMonthDisplay.textContent = newMonth;
            if(monthDropdown) monthDropdown.classList.add('hidden');
            if(monthArrow) monthArrow.classList.remove('rotate-180');

            // 2. Updates selection style
            monthOptions.forEach(opt => {
                opt.classList.remove('text-[var(--main-color)]');
                opt.classList.add('text-[var(--text-color)]');
            });
            e.target.classList.remove('text-[var(--text-color)]');
            e.target.classList.add('text-[var(--main-color)]');

            // 3. RELOADS EXPENSES AND UPDATES TOTALS/NOTIFICATIONS
            renderExpenses(currentMonth, currentCategoryFilter);
            calculateTotals();
            checkCategoryLimits();
        });
    });

    // =========================================================================
    // 2. Category Dropdown Logic (Filter)
    // =========================================================================
    if (categoryFilterBtn && categoryDropdown) {
        categoryFilterBtn.addEventListener('click', () => {
            const isHidden = categoryDropdown.classList.contains('hidden');
            
            // Closes the month dropdown, if open
            if(monthDropdown) monthDropdown.classList.add('hidden'); 
            if(monthArrow) monthArrow.classList.remove('rotate-180');

            if (isHidden) {
                categoryDropdown.classList.remove('hidden');
            } else {
                categoryDropdown.classList.add('hidden');
            }
        });
    }

    // Select Category
    categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const newCategory = e.target.getAttribute('data-category');
            const categoryText = e.target.textContent.trim();

            currentCategoryFilter = newCategory; // UPDATES THE GLOBAL VARIABLE
            
            // 1. Updates text and hides
            if(currentCategoryDisplay) currentCategoryDisplay.textContent = categoryText;
            if(categoryDropdown) categoryDropdown.classList.add('hidden');

            // 2. Updates selection style
            categoryOptions.forEach(opt => {
                opt.classList.remove('text-[var(--main-color)]');
                opt.classList.add('text-[var(--text-color)]');
            });
            e.target.classList.remove('text-[var(--text-color)]');
            e.target.classList.add('text-[var(--main-color)]');

            // 3. RELOADS EXPENSES
            renderExpenses(currentMonth, currentCategoryFilter);
        });
    });


    // Close any dropdown when clicking outside
    document.addEventListener('click', (e) => {
        // Checks if the click was inside or on a month dropdown button
        const isMonthClick = monthSelectorBtn && (monthSelectorBtn.contains(e.target) || monthDropdown.contains(e.target));
        // Checks if the click was inside or on a category dropdown button
        const isCategoryClick = categoryFilterBtn && (categoryFilterBtn.contains(e.target) || categoryDropdown.contains(e.target));
        
        // If not a month click and month is open, close it
        if (!isMonthClick && monthDropdown && !monthDropdown.classList.contains('hidden')) {
            monthDropdown.classList.add('hidden');
            if(monthArrow) monthArrow.classList.remove('rotate-180');
        }
        
        // If not a category click and category is open, close it
        if (!isCategoryClick && categoryDropdown && !categoryDropdown.classList.contains('hidden')) {
            categoryDropdown.classList.add('hidden');
        }
    });
}


function initAddExpensePage() {
    // 1. Setup category buttons
    setupCategoryListeners('category-buttons-container', 'category-btn');
    
    // 2. Setup form
    const form = document.getElementById('add-expense-form');
    if (form) {
        form.addEventListener('submit', handleAddExpense);
    }
}

function initEditBudgetPage() {
    const data = loadData();
    
    // 1. Set up the Month Selector for Budgeting
    const monthSelectorBtn = document.getElementById('budget-month-selector-btn');
    const monthDropdown = document.getElementById('budget-month-dropdown');
    const monthOptions = document.querySelectorAll('.budget-month-option');
    const currentMonthDisplay = document.getElementById('budget-current-month-display');
    
    // Set the initial display to the global currentMonth
    if (currentMonthDisplay) currentMonthDisplay.textContent = currentMonth;
    
    // Dropdown toggle logic
    if (monthSelectorBtn && monthDropdown) {
        monthSelectorBtn.addEventListener('click', () => {
            monthDropdown.classList.toggle('hidden');
        });
    }
    
    // Month selection logic
    monthOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const newMonth = e.target.getAttribute('data-month');
            
            // Updates the display and closes the dropdown
            if(currentMonthDisplay) currentMonthDisplay.textContent = newMonth;
            if(monthDropdown) monthDropdown.classList.add('hidden');
            
            // Re-loads limits for the newly selected month
            loadCategoryLimitsForMonth(newMonth, data);

            // Update selection style
            monthOptions.forEach(opt => {
                opt.classList.remove('text-[var(--main-color)]');
                opt.classList.add('text-[var(--text-color)]');
            });
            e.target.classList.remove('text-[var(--text-color)]');
            e.target.classList.add('text-[var(--main-color)]');
        });
    });

    // 2. Load the current category limits for the INITIAL month display
    loadCategoryLimitsForMonth(currentMonth, data);

    // 3. Setup form
    const form = document.getElementById('edit-budget-form');
    if (form) {
        // Adds the listener to save the limits (and calculate the budget)
        form.addEventListener('submit', handleEditBudget);
    }
}

/**
 * Helper function to load and display category limits for a specific month.
 * @param {string} monthName The name of the month.
 * @param {object} data The application data.
 */
function loadCategoryLimitsForMonth(monthName, data) {
    // Gets the limits for the specified month, or the default limits (all 0)
    // Ensures that if new default limits were added, they appear as 0.00
    const monthLimitsFromStorage = data.categoryLimits[monthName] || {};
    // Combine default structure with loaded data to ensure all fields are present
    const monthLimits = { ...defaultCategoryLimits, ...monthLimitsFromStorage };
    
    const limitInputs = document.querySelectorAll('.category-limit-input');
    
    // Load category limit fields
    limitInputs.forEach(input => {
        const category = input.getAttribute('data-category');
        // Populates with the saved limit or '0.00'
        if (monthLimits[category] !== undefined) {
            input.value = monthLimits[category].toFixed(2);
        } else {
            // Should not happen with the spread operator above, but as a fallback
            input.value = '0.00'; 
        }
    });
}

function initEditExpensePage() {
    // Get the ID of the expense to be edited
    const expenseId = localStorage.getItem('editingExpenseId');
    const data = loadData();
    // Find the expense by ID
    const expense = data.expenses.find(e => e.id == expenseId);

    if (!expense) {
        alert('Expense not found!');
        // UPDATED: Redirect path back to the home page
        window.location.href = '../index.html'; 
        return;
    }

    // Convert date from DD/MM/YYYY to YYYY-MM-DD for the input[type="date"]
    let dateISO = '';
    if (expense.date) {
        const parts = expense.date.split('/');
        // Check if the date is in the correct format before attempting to convert
        if (parts.length === 3) {
            dateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    
    // 1. Populate the form for editing
    document.getElementById('expense-amount').value = expense.amount.toFixed(2);
    document.getElementById('expense-description').value = expense.description;
    // The ID is saved in a hidden field for reference
    document.getElementById('expense-id-input').value = expense.id; 
    
    // Populate the date input
    const dateInput = document.getElementById('expense-date-input-edit');
    if (dateInput) {
        dateInput.value = dateISO; 
    }

    // 2. Pre-select the category
    setupCategoryListeners('category-buttons-container-edit', 'category-btn-edit');
    setSelectedCategory(expense.category, 'category-btn-edit');


    // 3. Event Listeners for Update and Delete
    document.getElementById('edit-expense-form')?.addEventListener('submit', handleUpdateExpense);
    document.getElementById('delete-expense-btn')?.addEventListener('click', handleDeleteExpense);
    
    // Saves the old value to calculate the difference in the budget during the update
    // This is no longer strictly needed for data.budget, but kept for future potential use
    localStorage.setItem('editingExpenseOriginalAmount', expense.amount);
}

/**
 * Checks the remaining budget and updates the visual status (color and notification).
 * Implements the "Budget Saving" alert feature.
 */
function checkBudgetStatus(remainingBudget) {
    const budgetCard = document.getElementById('budget-card-link');
    const notificationDot = document.getElementById('notification-dot');
    
    // Defines the limit for a 'low' budget (Example: less than 100)
    const LOW_BUDGET_THRESHOLD = 100;

    // 1. Resets classes for the budget card and the notification dot
    if (budgetCard) {
        // Removes all status colors before applying the new one
        budgetCard.classList.remove('bg-red-600', 'bg-yellow-600', 'bg-[var(--main-color)]');
    }
    // Notification dot is handled by checkCategoryLimits or overridden here if budget is overspent
    // Resetting the dot's red/yellow state is done later in this function/checkCategoryLimits
    
    // 2. Applies classes based on the remaining budget status
    if (budgetCard) {
        const budgetTextElements = budgetCard.querySelectorAll('p'); // Get all <p> inside the card

        // Clears text color classes to apply the correct one
        budgetTextElements.forEach(p => {
             p.classList.remove('text-[var(--bg-color)]', 'text-[var(--text-color)]');
        });
        
        if (remainingBudget < 0) {
            // Status: OVERSPENT (Red Alert)
            budgetCard.classList.add('bg-red-600');
            // Light text for red/yellow backgrounds
            budgetTextElements.forEach(p => { p.classList.add('text-[var(--text-color)]'); });

            if (notificationDot) {
                notificationDot.classList.remove('hidden');
                notificationDot.classList.remove('bg-yellow-500'); // Remove yellow if already set
                notificationDot.classList.add('bg-red-500');
            }
        } else if (remainingBudget <= LOW_BUDGET_THRESHOLD) {
            // Status: LOW (Yellow Warning)
            budgetCard.classList.add('bg-yellow-600');
            // Light text for red/yellow backgrounds
            budgetTextElements.forEach(p => { p.classList.add('text-[var(--text-color)]'); });

            // Note: The notification dot status for LOW budget is now delegated to checkCategoryLimits 
            // to show only one warning (either low budget or category limit). 
            // For now, we only use the dot for OVERSPENT (red) or Category Limit (yellow).

        } else {
            // Status: OK (Main Color - Green)
            budgetCard.classList.add('bg-[var(--main-color)]');
            // Dark text for the default green background
            budgetTextElements.forEach(p => { p.classList.add('text-[var(--bg-color)]'); });
            // The dot remains hidden for OK status, unless checkCategoryLimits shows it
        }
    }
}


// ===================================
// Main Application Logic
// ===================================

/**
 * Calculates and displays totals on the home page.
 * The total expense is calculated only for the selected month.
 * The budget is the calculated total monthly budget.
 */
function calculateTotals() {
    const data = loadData();
    
    // Month name to number mapping
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    const currentMonthNumber = monthNames.findIndex(name => name === currentMonth) + 1;
    
    // 1. Get the TOTAL MONTHLY BUDGET for the current month
    // Uses the calculated monthly budget, defaults to 0 if not set
    const totalMonthlyBudget = data.monthlyBudget[currentMonth] || 0; 

    // 2. Total expenses for the SELECTED MONTH
    const totalMonthlyExpenses = data.expenses
        .filter(expense => {
            const dateParts = expense.date.split('/');
            if (dateParts.length !== 3) return false; 
            const expenseMonth = parseInt(dateParts[1]);
            return expenseMonth === currentMonthNumber;
        })
        .reduce((sum, expense) => sum + expense.amount, 0); 

    // 3. Calculate Remaining Budget for the current month
    const remainingBudget = totalMonthlyBudget - totalMonthlyExpenses;

    // Currency formatting (example: CAD)
    const formatter = new Intl.NumberFormat('en-US', { 
        style: 'currency',
        currency: 'CAD', 
    });

    // Updates the total expense display
    const expenseDisplay = document.getElementById('expense-total-display');
    if(expenseDisplay) expenseDisplay.textContent = formatter.format(totalMonthlyExpenses);

    // Updates the remaining budget display
    const budgetDisplay = document.getElementById('budget-display');
    if(budgetDisplay) budgetDisplay.textContent = formatter.format(remainingBudget);

    // Checks and updates the visual status of the budget card
    checkBudgetStatus(remainingBudget);
}

/**
 * Renders the list of expenses on the home page, applying filters.
 * @param {string} monthFilter The name of the month to filter (e.g., 'September').
 * @param {string} categoryFilter The category to filter (e.g., 'All' or 'Transportation').
 */
function renderExpenses(monthFilter = 'September', categoryFilter = 'All') {
    const container = document.getElementById('expense-list-container');
    if (!container) return;

    const data = loadData();
    container.innerHTML = ''; // Clears the existing list

    // Month name to number mapping (for comparison)
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    // Gets the month number (1 to 12)
    const monthNumber = monthNames.findIndex(name => name === monthFilter) + 1;


    // 1. Filter expenses
    const filteredExpenses = data.expenses.filter(expense => {
        // Date format is DD/MM/YYYY
        const dateParts = expense.date.split('/');
        // Ignores expenses with invalid date format
        if (dateParts.length !== 3) return false; 
        
        const expenseMonth = parseInt(dateParts[1]); // Month is the second element (MM)

        // Checks if the month matches (or if the filter is 'All')
        const isMonthMatch = (monthFilter === 'All' || expenseMonth === monthNumber);
        
        // Checks if the category matches (or if the filter is 'All')
        const isCategoryMatch = (categoryFilter === 'All' || expense.category === categoryFilter);

        return isMonthMatch && isCategoryMatch;
    });

    // 2. Render filtered expenses
    if (filteredExpenses.length === 0) {
        container.innerHTML = '<p class="w-full text-center mt-8 text-gray-400">No expenses found for this month and category.</p>';
        return;
    }

    filteredExpenses.reverse().forEach(expense => { // Displays the most recent ones first
        const expenseCard = document.createElement('div');
        expenseCard.className = 'w-full min-w-[var(--min-width-expense)] max-w-[var(--max-width-expense)] h-28 bg-[var(--sub-color)] rounded-2xl flex flex-col';
        
        // Date formatting to get only the day
        const day = expense.date.split('/')[0];

        // Normalizes the category name for the icon path
        let iconName = expense.category.toLowerCase().replace(/ /g, '').replace(/-/g, '');
        // Specific mappings for icon names
        if (iconName.includes('transportation')) iconName = 'transportation';
        if (iconName.includes('eatout')) iconName = 'eat-out';
        if (iconName.includes('workout')) iconName = 'gym';
        if (iconName.includes('clothes')) iconName = 'clothes';
        if (iconName.includes('date')) iconName = 'dating';
        if (iconName.includes('savings')) iconName = 'save';
        
        // The expense amount is displayed as negative on the frontend (to indicate spending)
        expenseCard.innerHTML = `
            <div class="w-full h-4/6 flex flex-col justify-center items-center">
                <div class="w-full flex flex-row justify-between items-center px-2">
                    <p class="text-sm">${day}</p>
                    <img src="./assets/icons/${iconName}.png" alt="${expense.category}" class="w-4 h-4 my-1">
                </div>
                <p class="text-xl font-bold text-[var(--main-color)] overflow-hidden whitespace-nowrap text-ellipsis max-w-full truncate">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' }).format(-expense.amount)}</p>
                <p class="text-xs text-gray-400 px-6 w-full truncate">${expense.description}</p>
            </div>
            <div
                class="w-full h-2/6 bg-[var(--sub-color)] flex justify-center items-center rounded-2xl border border-gray-800">
                <a href="pages/editExpense.html" class="block edit-expense-link" data-id="${expense.id}">Edit</a>
            </div>
        `;
        container.appendChild(expenseCard);
    });
}

/**
 * Converts date from YYYY-MM-DD (Input Date) to DD/MM/YYYY (Storage Format).
 * @param {string} dateISO Date in ISO format.
 * @returns {string} Date in DD/MM/YYYY format.
 */
function convertDateToStorageFormat(dateISO) {
    const parts = dateISO.split('-');
    if (parts.length === 3) {
        // parts[0] is year (YYYY), parts[1] is month (MM), parts[2] is day (DD)
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    // Returns empty string if the format is not as expected
    return '';
}

/**
 * Returns the month number based on the name.
 * @param {string} monthName Month name (e.g., 'September').
 * @returns {number} Month number (1 to 12).
 */
function getMonthNumber(monthName) {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    // Returns index + 1 (January is 0 + 1 = 1)
    const index = monthNames.findIndex(name => name === monthName);
    return index !== -1 ? index + 1 : -1;
}

/**
 * Checks if any category has reached 90% or more of its limit
 * and updates the notification icon on index.html.
 */
function checkCategoryLimits() {
    const data = loadData();
    const expenses = data.expenses;
    // CORRECTED: Get the limits ONLY for the current month. If none are set, use default (all 0).
    const limitsFromStorage = data.categoryLimits[currentMonth] || {};
    const limits = { ...defaultCategoryLimits, ...limitsFromStorage }; // Ensure all categories are checked
    
    // The notification dot (usually a red circle)
    const dot = document.getElementById('notification-dot');
    
    if (!dot) return;
    
    // Month name to number mapping
    const currentMonthNumber = getMonthNumber(currentMonth);

    // 1. Calculates the total spent per category in the current month
    const spentByCategory = expenses.reduce((acc, expense) => {
        // Date format is DD/MM/YYYY
        const dateParts = expense.date.split('/');
        // Ignores invalid date formats
        if (dateParts.length !== 3) return acc; 
        
        const expenseMonth = parseInt(dateParts[1]);

        if (expenseMonth === currentMonthNumber) {
            const category = expense.category;
            // Sums the spending in the current category
            acc[category] = (acc[category] || 0) + expense.amount;
        }
        return acc;
    }, {});
    
    let limitExceeded = false;

    // 2. Compares with limits (now iterating over categories, not month names)
    for (const category in limits) { 
        const limit = limits[category];
        const spent = spentByCategory[category] || 0;
        
        // Checks if spending reached 90% or more of the limit AND if the limit was set (greater than 0)
        if (limit > 0 && spent >= limit * 0.9) {
            limitExceeded = true;
            break; // Exits the loop as soon as a category exceeded the limit
        }
    }
    
    // 3. Updates the icon (shows or hides the dot)
    const budgetCard = document.getElementById('budget-card-link');
    // Check if the budget status is already RED (overspent), which has priority
    const isBudgetOverspent = budgetCard && budgetCard.classList.contains('bg-red-600');
    
    if (isBudgetOverspent) {
        // If overspent, the dot is already RED and visible from checkBudgetStatus.
        return; 
    }
    
    // If not overspent, check for category limit warning
    if (limitExceeded) {
        dot.classList.remove('hidden');
        // Ensure it's yellow for category warning
        dot.classList.remove('bg-red-500'); 
        dot.classList.add('bg-yellow-500');
    } else {
        // Only hide if the budget is not overspent AND no category limit exceeded
        dot.classList.add('hidden');
        dot.classList.remove('bg-yellow-500'); 
    }
}


/**
 * Handles the submission of the Add Expense form.
 * @param {Event} e The form submission event.
 */
function handleAddExpense(e) {
    e.preventDefault();
    
    // Checks if a category has been selected
    if (!selectedCategory) {
        alert('Please select a category.');
        return;
    }

    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const dateISO = document.getElementById('expense-date-input').value; // READS THE DATE FROM INPUT (YYYY-MM-DD)
    const dateStr = convertDateToStorageFormat(dateISO); // CONVERTS TO DD/MM/YYYY

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid expense amount.');
        return;
    }

    const data = loadData();
    const newExpense = {
        id: generateId(data),
        amount: amount,
        category: selectedCategory, // Uses the globally selected category
        description: description || 'No description',
        date: dateStr // SAVES THE FORMATTED DATE
    };

    data.expenses.push(newExpense);
    saveData(data);
    
    alert('Expense added successfully!');
    // ATUALIZADO: Caminho de redirecionamento para a home page (um nível acima de 'pages/')
    // This is the fix, assuming 'addExpense.html' is now inside 'pages/'
    window.location.href = '../index.html'; 
}

/**
 * Handles the submission of the Edit Budget form.
 * **NEW LOGIC**: Calculates the total monthly budget based on the sum of category limits.
 * @param {Event} e The form submission event.
 */
function handleEditBudget(e) {
    e.preventDefault();

    const data = loadData();
    
    // 1. GET THE MONTH BEING EDITED
    const monthToEdit = document.getElementById('budget-current-month-display').textContent.trim();

    // 2. READ CATEGORY LIMITS AND CALCULATE TOTAL BUDGET
    const newCategoryLimits = {};
    const limitInputs = document.querySelectorAll('.category-limit-input');
    
    let totalCalculatedBudget = 0;
    let isValid = true;
    
    limitInputs.forEach(input => {
        const category = input.getAttribute('data-category');
        const limit = parseFloat(input.value);
        
        if (isNaN(limit) || limit < 0) {
            alert(`Please enter a valid limit value for ${category}.`);
            isValid = false;
            return;
        }
        newCategoryLimits[category] = limit;
        totalCalculatedBudget += limit; // Sums all limits
    });

    if (!isValid) return;

    // 3. SAVE TO DATA STRUCTURE
    // Stores the category limits for the selected month
    data.categoryLimits[monthToEdit] = newCategoryLimits;
    // Stores the calculated total budget for the selected month
    data.monthlyBudget[monthToEdit] = totalCalculatedBudget;

    saveData(data);
    
    alert(`Budget and category limits for ${monthToEdit} updated successfully! Total Budget: ${totalCalculatedBudget.toFixed(2)} CAD`);
    // UPDATED: Redirect path to the home page (one level above 'pages/')
    window.location.href = '../index.html'; 
}

/**
 * Handles updating an expense.
 * **NEW LOGIC**: No direct budget adjustment needed, as the budget is calculated monthly.
 * @param {Event} e The form submission event.
 */
function handleUpdateExpense(e) {
    e.preventDefault();

    if (!selectedCategory) {
        alert('Please select a category.');
        return;
    }

    const id = parseInt(document.getElementById('expense-id-input').value);
    const newAmount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const dateISO = document.getElementById('expense-date-input-edit').value; // READS THE DATE FROM INPUT (YYYY-MM-DD)
    const dateStr = convertDateToStorageFormat(dateISO); // CONVERTS TO DD/MM/YYYY
    // const originalAmount = parseFloat(localStorage.getItem('editingExpenseOriginalAmount') || '0'); 

    if (isNaN(newAmount) || newAmount <= 0) {
        alert('Please enter a valid expense amount.');
        return;
    }

    const data = loadData();
    // Finds the index of the expense to be updated
    const expenseIndex = data.expenses.findIndex(e => e.id === id);

    if (expenseIndex !== -1) {
        // 1. No need to adjust the total budget anymore, as it's calculated on demand.

        // 2. Update the expense
        data.expenses[expenseIndex].amount = newAmount;
        data.expenses[expenseIndex].category = selectedCategory; 
        data.expenses[expenseIndex].description = description || 'No description';
        data.expenses[expenseIndex].date = dateStr; // SAVES THE UPDATED DATE
        
        saveData(data);
        // Clears the temporary value
        localStorage.removeItem('editingExpenseOriginalAmount');
        alert('Expense updated successfully!');
        // UPDATED: Redirect path to the home page (one level above 'pages/')
        window.location.href = '../index.html';
    } else {
        alert('Error finding expense to update.');
    }
}

/**
 * Handles the deletion of an expense.
 * **NEW LOGIC**: No direct budget adjustment needed, as the budget is calculated monthly.
 */
function handleDeleteExpense() {
    // Confirmation before deleting
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const id = parseInt(document.getElementById('expense-id-input').value);
    const data = loadData();

    // Finds the expense amount before deleting (no longer needed to adjust data.budget)
    // const expenseToDelete = data.expenses.find(e => e.id === id);

    // Filters to remove the expense with the corresponding ID
    data.expenses = data.expenses.filter(e => e.id !== id);
    saveData(data);

    alert('Expense deleted successfully!');
    // Clears temporary editing data
    localStorage.removeItem('editingExpenseId'); 
    localStorage.removeItem('editingExpenseOriginalAmount');
    // UPDATED: Redirect path to the home page (one level above 'pages/')
    window.location.href = '../index.html'; 
}


// ===================================
// Routing (Initialization)
// ===================================

/**
 * Initializes the correct function depending on the current page.
 */
function initApp() {
    // Set the initial currentMonth to the actual current month name for consistency
    currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    
    // Clears the selected category when changing pages
    selectedCategory = null; 

    const path = window.location.pathname;
    
    // Sets the current date in date inputs (runs on all pages with input[type="date"])
    const dateInputs = document.querySelectorAll('input[type="date"]');
    // Gets today's date in ISO format (YYYY-MM-DD)
    const todayISO = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        // Sets to the current date only if the field is empty (e.g., when creating a new expense)
        if (!input.value) {
            input.value = todayISO;
        }
    });

    // Determines the page and initializes the correct function
    // Checks if it is the home page (index.html or root path)
    if (path.includes('index.html') || path.endsWith('/')) {
        initIndexPage();
    } 
    // Checks if it is the add expense page
    else if (path.includes('addExpense.html')) {
        initAddExpensePage();
    } 
    // Checks if it is the edit budget page
    else if (path.includes('editBudget.html')) {
        initEditBudgetPage();
    } 
    // Checks if it is the edit expense page
    else if (path.includes('editExpense.html')) {
        initEditExpensePage();
    }
    
}

// Starts the application when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', initApp);