const incomeInput = document.getElementById('income');
const totalSpendEl = document.getElementById('total-spend');
const remainingEl = document.getElementById('remaining');
const inputSection = document.getElementById('input-section');
const chartCtx = document.getElementById('budgetChart').getContext('2d');
const donutCtx = document.getElementById('donutChart').getContext('2d');

// Initial categories
let categories = [
  { name: 'Housing', id: 'housing', subs: [] },
  { name: 'Loans', id: 'loans', subs: [] },
  { name: 'Food', id: 'food', subs: [] },
  { name: 'Fun', id: 'fun', subs: [] },
  { name: 'Subscriptions', id: 'subscriptions', subs: [] },
  { name: 'Transportation', id: 'transportation', subs: [] }
];

// Pie chart: Category breakdown
let chart = new Chart(chartCtx, {
  type: 'pie',
  data: {
    labels: categories.map(c => c.name),
    datasets: [{
      data: categories.map(() => 0),
      backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#7c4dff', '#4db6ac', '#ff9f40'],
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: $${context.parsed}`
        }
      }
    }
  }
});

// Donut chart: Remaining vs Spent
let donutChart = new Chart(donutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Spent', 'Remaining'],
    datasets: [{
      data: [0, 100],
      backgroundColor: ['#ff6384', '#4CAF50'],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: $${context.parsed}`
        }
      }
    }
  }
});

// Budget calculation and updates
function updateBudget() {
  const income = parseFloat(incomeInput.value) || 0;
  let totalSpend = 0;

  const values = categories.map(cat => {
    const subTotal = (cat.subs || []).reduce((sum, subId) => {
      const val = parseFloat(document.getElementById(subId)?.value || 0);
      return sum + val;
    }, 0);

    const categoryTotalEl = document.getElementById(`total-${cat.id}`);
    if (categoryTotalEl) {
      categoryTotalEl.textContent = subTotal.toFixed(2);
    }

    totalSpend += subTotal;
    return subTotal;
  });

  totalSpendEl.textContent = totalSpend.toFixed(2);
  remainingEl.textContent = (income - totalSpend).toFixed(2);

  chart.data.datasets[0].data = values;
  chart.data.labels = categories.map(c => c.name);
  chart.update();

  donutChart.data.datasets[0].data = [totalSpend, Math.max(income - totalSpend, 0)];
  donutChart.update();
}

// Add a new subcategory input
function createSubcategoryInput(parentId, subName = '', value = 0) {
  const subContainer = document.getElementById(`subs-${parentId}`);
  const subId = `${parentId}-sub-${Math.floor(Math.random() * 10000)}`;

  const wrapper = document.createElement('label');
  wrapper.innerText = `${subName}: $`;
  wrapper.style.marginLeft = '1rem';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'space-between';

  const input = document.createElement('input');
  input.type = 'number';
  input.id = subId;
  input.value = value;
  input.dataset.parent = parentId;
  input.className = 'sub-input';
  input.addEventListener('input', updateBudget);

  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = '&times;';
  removeBtn.style.marginLeft = '1rem';
  removeBtn.className = 'remove-sub';
  removeBtn.onclick = () => {
    wrapper.remove();
    const cat = categories.find(c => c.id === parentId);
    if (cat) {
      cat.subs = cat.subs.filter(id => id !== subId);
    }
    updateBudget();
  };

  wrapper.appendChild(input);
  wrapper.appendChild(removeBtn);
  subContainer.appendChild(wrapper);

  const category = categories.find(c => c.id === parentId);
  if (category) {
    category.subs.push(subId);
  }

  updateBudget();
}

// "+ Add Subcategory" button handler
function addSubcategory(parentId) {
  const subName = prompt('Subcategory name:');
  if (subName) {
    createSubcategoryInput(parentId, subName);
  }
}

// Add new custom category
function addCategory(name) {
  const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 10000);
  const safeName = name.trim();
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

  categories.push({ name: safeName, id, subs: [] });

  const wrapper = document.createElement('div');
  wrapper.className = 'category';
  wrapper.setAttribute('data-name', safeName);

  const header = document.createElement('div');
  header.className = 'category-header';
  header.innerHTML = `${safeName} Total: $<span id="total-${id}">0</span>`;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-category';
  deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
  deleteBtn.onclick = () => {
    if (confirm(`Are you sure you want to delete the category "${safeName}"?`)) {
      wrapper.remove();
      categories = categories.filter(c => c.id !== id);
      updateBudget();
    }
  };
  header.appendChild(deleteBtn);

  const subBtn = document.createElement('button');
  subBtn.className = 'add-sub';
  subBtn.innerText = '+ Add Subcategory';
  subBtn.onclick = () => addSubcategory(id);

  const subContainer = document.createElement('div');
  subContainer.className = 'subcategories';
  subContainer.id = `subs-${id}`;

  wrapper.appendChild(header);
  wrapper.appendChild(subBtn);
  wrapper.appendChild(subContainer);
  inputSection.appendChild(wrapper);

  chart.data.datasets[0].backgroundColor.push(color);
  updateBudget();
}

// Default subcategories
const defaultSubcategories = {
  housing: ['Base Rent', 'Wifi', 'Utilities', 'Electric'],
  loans: ['Student Loans', 'Car Payments'],
  subscriptions: ['Netflix', 'Apple Care', 'Apple TV'],
  food: ['Groceries', 'Restaurants'],
  transportation: ['Gas']
};

// Load default subcategories and add delete buttons to all
for (const [catId, names] of Object.entries(defaultSubcategories)) {
  names.forEach(name => createSubcategoryInput(catId, name));
}

// Add delete buttons to all non-Income categories
document.querySelectorAll('.category').forEach(cat => {
  const name = cat.getAttribute('data-name');
  if (name.toLowerCase() === 'income') return;

  const header = cat.querySelector('.category-header');
  if (header && !header.querySelector('.delete-category')) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-category';
    deleteBtn.innerHTML = '<i class="fa fa-times"></i>';
    deleteBtn.onclick = () => {
      if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
        cat.remove();
        categories = categories.filter(c => c.name !== name);
        updateBudget();
      }
    };
    header.appendChild(deleteBtn);
  }
});

// Budget update on income change
incomeInput.addEventListener('input', updateBudget);

// Handle "Add Category" button
document.getElementById('add-category-btn').addEventListener('click', () => {
  const input = document.getElementById('new-category-name');
  const name = input.value.trim();
  if (name) {
    addCategory(name);
    input.value = '';
  }
});

// Theme toggle with localStorage persistence
const themeToggle = document.getElementById('toggle-theme');
const savedTheme = localStorage.getItem('theme');
const prefersDark = savedTheme === 'dark' || savedTheme === null;

document.body.classList.toggle('dark', prefersDark);
if (themeToggle) themeToggle.checked = prefersDark;

themeToggle.addEventListener('change', function () {
  const dark = this.checked;
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

// Initial update
updateBudget();
