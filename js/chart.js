  // Данные графика по неделям, месяцам, годам
  const chartData = {
    week: {
      categories: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      income: [4000, 3000, 2000, 2800, 1800, 2300, 3500],
      expenses: [2500, 1400, 3700, 3800, 4700, 3900, 4200]
    },
    month: {
      categories: ['1-7', '8-14', '15-21', '22-28', '29-31'],
      income: [15000, 12000, 10000, 13000, 11000],
      expenses: [11000, 9000, 14000, 12000, 13000]
    },
    year: {
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      income: [12000, 15000, 18000, 14000, 16000, 13000, 17000, 18000, 14000, 15000, 19000, 20000],
      expenses: [10000, 11000, 12000, 13000, 14000, 11000, 15000, 16000, 12000, 14000, 13000, 16000]
    }
  };

  // Базовые настройки графика
  const options = {
    chart: {
      type: 'area', //Тип графика
      height: 350,
      animations: { //Врубил анимации
        enabled: true,
        easing: 'easeinout', //+ плавность
        speed: 800
      },
      toolbar: { //ну тут и так  понятно
        show: false
      }
    },
    colors: ['#4b7bec', '#20bf6b'],//Линии
    dataLabels: {  //Подписи
      enabled: false
    },
    stroke: {//Лини плавные
      curve: 'smooth'
    },
    series: [],//Данные доходов и расходов (по оси х и у)
    xaxis: {//По х
      categories: []
    },
    tooltip: {
      x: {//Врубили подсказки
        show: true
      },
      y: {//Добавили к числу 'Р'
        formatter: val => val + ' ₽'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.8,
        opacityTo: 0.4,
        stops: [0, 90, 100]
      }
    }
  };

  // Инициализация графика
  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();

  /**
   * Функция для обновления данных на графике
   * @param {string} period - 'week' | 'month' | 'year'
   * @param {HTMLElement} el - активный div, на который нажали
   */
  function updateChart(period, el) {
    const data = chartData[period];

    // Обновляем данные графика
    chart.updateOptions({
      series: [
        { name: 'Доходы', data: data.income },
        { name: 'Расходы', data: data.expenses }
      ],
      xaxis: {
        categories: data.categories
      }
    });

    // Снимаем класс "active" со всех div-кнопок
    document.querySelectorAll('.review-container-header-nav-button')
      .forEach(btn => btn.classList.remove('active'));

    // Добавляем "active" только к нажатому элементу
    el.classList.add('active');
  }
  // Инициализация графика при загрузке страницы (недельный)
  updateChart('week', document.querySelector('.review-container-header-nav-button.active'));