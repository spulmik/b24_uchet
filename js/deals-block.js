// Инициализация Supabase
const supabaseClient = window.supabase.createClient(
  'https://abtfcuhinfxsvnzsnqbf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidGZjdWhpbmZ4c3ZuenNucWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjMwNzcsImV4cCI6MjA2MjUzOTA3N30.R-izBVryybf8BH9GiMG4LOzEFtgfE_PKonD3uOPr6_o'
);

const paymentForm = document.getElementById('payment-form');
const transactionsList = document.getElementById('transactions-list-content');
const typeButtons = document.querySelectorAll('.switchIncome');

// Создаем скрытое поле для типа, если его нет
let typeInput = document.getElementById('type');
if (!typeInput) {
  typeInput = document.createElement('input');
  typeInput.type = 'hidden';
  typeInput.id = 'type';
  paymentForm.appendChild(typeInput);
}
typeInput.value = 'income'; // по умолчанию

// Обработка переключателя доход/расход
typeButtons.forEach(el => {
  el.addEventListener('click', () => {
    typeButtons.forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
    typeInput.value = el.dataset.type;
  });
});

// Автоформатирование суммы
const amountInput = document.getElementById('amount');
amountInput.addEventListener('input', function () {
  let rawValue = this.value.replace(/\D/g, '');
  let formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  this.value = formatted;
});

// Добавление платежа
async function addPayment(amount, type, date, deal_title, company_name, contact_name, commentary) {
  const { data, error } = await supabaseClient
    .from('payments')
    .insert([{
      amount: amount,
      type,
      date,
      deal_title,
      company_name,
      contact_name,
      commentary,
      created_at: new Date().toISOString(),
    }]);

  if (error) {
    console.error('Ошибка при добавлении платежа:', error.message);
    alert('Ошибка при добавлении платежа: ' + error.message);
  } else {
    console.log('Платеж добавлен:', data);
    loadTransactions();
  }
}

let chart;

// Загрузка и отображение транзакций + обновление графика
async function loadTransactions() {
  const { data, error } = await supabaseClient
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Ошибка при загрузке транзакций:', error.message);
    return;
  }

  transactionsList.innerHTML = '';
  const incomeData = [];
  const expenseData = [];
  const categories = [];

  data.forEach(transaction => {
    const div = document.createElement('div');
    div.className = transaction.type === 'income' ? 'income' : 'expense';
    div.innerHTML = `
      <strong>${transaction.date}</strong><br>
      <strong>Сделка:</strong> ${transaction.deal_title}<br>
      <strong>${transaction.type === 'income' ? 'Доход' : 'Расход'}:</strong> ${transaction.amount} ₽<br>
      <strong>Компания:</strong> ${transaction.company_name}<br>
      <strong>Контакт:</strong> ${transaction.contact_name}<br>
      <strong>Комментарий:</strong> ${transaction.commentary || ''}<br>
      <hr>
    `;
    transactionsList.appendChild(div);

    const cleanAmount = parseFloat(transaction.amount);
    if (!isNaN(cleanAmount)) {
      if (!categories.includes(transaction.date)) {
        categories.push(transaction.date);
      }
      if (transaction.type === 'income') {
        incomeData.push(cleanAmount);
      } else {
        expenseData.push(cleanAmount);
      }
    }
  });

  renderChart(categories.reverse(), incomeData.reverse(), expenseData.reverse());
}

function renderChart(categories, incomeData, expenseData) {
  const options = {
    chart: {
      type: 'area',
      height: 350,
      animations: { enabled: true },
      toolbar: { show: false }
    },
    colors: ['#4b7bec', '#fc5c65'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    series: [
      { name: 'Доходы', data: incomeData },
      { name: 'Расходы', data: expenseData }
    ],
    xaxis: { categories: categories },
    tooltip: {
      y: {
        formatter: (val) => val + " ₽"
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.6,
        opacityTo: 0,
        stops: [0, 90, 100]
      }
    }
  };

  if (chart) {
    chart.updateOptions(options);
  } else {
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  }
}

// Отправка формы
paymentForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const rawAmount = document.getElementById('amount').value;
  const amount = parseFloat(rawAmount.replace(/\s/g, ''));

  const type = document.getElementById('type').value;
  const date = document.getElementById('date').value;
  const deal_title = document.getElementById('deal_title').value;
  const company_name = document.getElementById('company_name').value;
  const contact_name = document.getElementById('contact_name').value;
  const commentary = document.getElementById('commentary').value;

  if (!amount || !type || !date) {
    alert('Пожалуйста, заполните обязательные поля (сумма, дата, тип).');
    return;
  }

  addPayment(amount, type, date, deal_title, company_name, contact_name, commentary);
  paymentForm.reset();
  typeInput.value = 'income';
  typeButtons.forEach(btn => btn.classList.remove('active'));
  document.getElementById('income').classList.add('active');
});

window.addEventListener('load', loadTransactions);
