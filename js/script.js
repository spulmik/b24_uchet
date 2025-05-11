//Крестик
function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'block';
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }
//Закрытие модального окна
  function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('show');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
//Также закрытие модального окна
  function outsideClick(event, modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.modal-content');
    if (!content.contains(event.target)) {
      if (modalId === 'modal2' || (modalId === 'modal1' && document.getElementById('modal2').style.display !== 'block')) {
        closeModal(modalId);
      }
    }
  }


  //Активный элемент(Обзор/)
  function setActiveTab(element) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
  }
  function showTab(tabId, btn) {
    // Скрываем весь контент
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Показываем выбранный
    document.getElementById(tabId).classList.add('active');

    // Удаляем активность с кнопок
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Делаем активной текущую
    btn.classList.add('active');
  }
/* //Добавление дробленных чисел (10 000, 100 000 т.п.)
document.getElementById('amount').addEventListener('input', function (e) {
    let rawValue = this.value.replace(/\D/g, '');//Удаляет всё, кроме цифр
    let formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    this.value = formatted;
  });
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.payment-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
  });
});
*///Вместе не работает
