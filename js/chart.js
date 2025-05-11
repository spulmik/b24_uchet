const supabaseClient = window.supabase.createClient(
  'https://abtfcuhinfxsvnzsnqbf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidGZjdWhpbmZ4c3ZuenNucWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjMwNzcsImV4cCI6MjA2MjUzOTA3N30.R-izBVryybf8BH9GiMG4LOzEFtgfE_PKonD3uOPr6_o'
);

// DOM элементы
const paymentForm = document.getElementById('payment-form');//форма для ввода платежей
const transactionsList = document.getElementById('transactions-list-content');//Список для показа платежей
const typeButtons = document.querySelectorAll('.switchIncome');//переключение Доход/Расход
let currentFilter = 'week'; //Переменная для текущего фильтра(неделя)

// Скрытое поле type — создаём программно, если его нет
if (!document.getElementById('type')) {
  const hiddenTypeInput = document.createElement('input');
  hiddenTypeInput.type = 'hidden';
  hiddenTypeInput.id = 'type';
  paymentForm.appendChild(hiddenTypeInput);
}

// Обработка переключателей доход/расход
typeButtons.forEach(el => {
  el.addEventListener('click', () => {
    typeButtons.forEach(btn => btn.classList.remove('active')); //Убираем выделение с др. кнопок
    el.classList.add('active');//Выделяем нажатую кнопку
    document.getElementById('type').value = el.dataset.type;//сохраняем выбранный тип в скрытое поле
  });
});

// Форматируем числа при вводе, добавляем дробление тыс, млн, и т.д
document.getElementById('amount').addEventListener('input', function () {
  const rawValue = this.value.replace(/\D/g, '');//Удалить все символы, кроме цифр
  const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');//Добавить пробелы
  this.value = formatted;//Записываем отформатированное число обратно в поле
});

// Добавление платежа в базу данных
async function addPayment(amount, type, date, deal_title, company_name, contact_name, commentary) {
  const parsedAmount = parseFloat(amount.replace(/\s/g, ''));//Убираем пробелы
  const { data, error } = await supabaseClient.from('payments').insert([{
    amount: parsedAmount,//Сумма
    type,//тип
    date,
    deal_title,
    company_name,
    contact_name,
    commentary,
    created_at: new Date().toISOString(),//Время добавления
  }]);

  if (error) {
    console.error('Ошибка при добавлении платежа:', error.message);//Если ошибка выводим в консоль
    alert('Ошибка: ' + error.message);//Показываем ошибку пользователю
  } else {
    loadTransactions();//Перезагрузка списка транзакций
    loadChartData(currentFilter);//Перезагружаем данные для графика с таким фильтром
  }
}

// Обработка формы
paymentForm.addEventListener('submit', function (event) {
  event.preventDefault();//Отменяем стандартную отправку формы

  const type = document.getElementById('type').value;//тип платежы
  const date = document.getElementById('date').value;
  const deal_title = document.getElementById('deal_title').value;
  const amount = document.getElementById('amount').value;
  const company_name = document.getElementById('company_name').value;
  const contact_name = document.getElementById('contact_name').value;
  const commentary = document.getElementById('commentary').value;//комментарий
  //Проверяем все ли обязательные поля заполнены или можно просто в htmml "required"
  if (!amount || !type || !date) {
    alert('Пожалуйста, заполните обязательные поля (сумма, дата, тип).');
    return;
  }

  addPayment(amount, type, date, deal_title, company_name, contact_name, commentary);//Добавляем платеж
  paymentForm.reset();//Очищаем форму
});

// Загрузка транзакций
async function loadTransactions() {
  const { data, error } = await supabaseClient
    .from('payments')//Выбор таблицы
    .select('*')//Все поля
    .order('created_at', { ascending: false })//Сортируем по дате добавления(от новых к старым)
    .limit(50);//транзакций до 50

  if (error) return console.error('Ошибка при загрузке:', error.message);//Если ошибка, выводим ее в консоль
//Очищаем список транзакций
  transactionsList.innerHTML = '';
  data.forEach(transaction => {
    const div = document.createElement('div');//Создаем новый div для каждой транзакции
    div.className = transaction.type === 'income' ? 'income' : 'expense';//задаем класс
    div.innerHTML = `
      <strong>${transaction.date}</strong><br>
      <strong>Сделка:</strong> ${transaction.deal_title}<br>
      <strong>${transaction.type === 'income' ? 'Доход' : 'Расход'}:</strong> ${transaction.amount} ₽<br>
      <strong>Компания:</strong> ${transaction.company_name}<br>
      <strong>Контакт:</strong> ${transaction.contact_name}<br>
      <strong>Комментарий:</strong> ${transaction.commentary || ''}<br>
      <hr>
    `;
    transactionsList.appendChild(div);//Добавляем элемент в список
  });
}

// === Chart ===//Инициализируем
let chart;
function createChart() {
  chart = new ApexCharts(document.querySelector("#chart"), { // создаём новый график в контейнере с id "chart"
    //Далее обычна конфигурация графика
    chart: { type: 'area', height: 350,
      toolbar: { show: false },
      animations: { enabled: true } },
    colors: ['#918ebd', '#9ec9b1'],
    dataLabels: { enabled: false },//Подписи
    stroke: { curve: 'smooth' },//плавные линии
    series: [
      { name: 'Доходы', data: [] },
      { name: 'Расходы', data: [] }
    ],
    xaxis: { categories: [] },//Ось х будет пустой
    tooltip: {
      y: { formatter: (val) => `${val.toLocaleString()} ₽` }//Отображение разделения на тыс.
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.8,
        opacityTo: 0.6,
        stops: [0, 90, 100]
      }
    }
  });

  chart.render();//Отображение графика
}

// Загрузка данных для графика
async function loadChartData(filter = 'week') {
  const { data, error } = await supabaseClient
    .from('payments')//Таблица payments
    .select('*')//Все поля
    .order('date', { ascending: true });//Сортировка по дате

  if (error) return console.error('Ошибка при загрузке графика:', error.message);//также как и в графике

  // Группировка данных по фильтру (неделя, месяц, год)
  const grouped = {};
  const dateFormatter = (d) => {//Функция для форматирования
    const date = new Date(d);
    if (filter === 'week') {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });//День недели
    } else if (filter === 'month') {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });//Месяц
    } else {
      return date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });//Год
    }
  };
//Группируем данные по фильтру
  data.forEach(entry => {
    const label = dateFormatter(entry.date);
    if (!grouped[label]) grouped[label] = { income: 0, expenses: 0 };
    grouped[label][entry.type] += entry.amount;
  });

  const labels = Object.keys(grouped);
  const incomeData = labels.map(label => grouped[label].income || 0);
  const expenseData = labels.map(label => grouped[label].expenses || 0);

  chart.updateOptions({
    xaxis: { categories: labels },
    series: [
      { name: 'Доходы', data: incomeData },
      { name: 'Расходы', data: expenseData }
    ]
  });
}

// Обновление фильтра
window.updateChart = function (filter, el) {
  currentFilter = filter;

  document.querySelectorAll('.review-container-header-nav-button').forEach(btn => {
    btn.classList.remove('active');
  });
  el.classList.add('active');

  loadChartData(filter);
};

// Инициализация
window.addEventListener('load', () => {
  createChart();
  loadTransactions();
  loadChartData('week');
});
