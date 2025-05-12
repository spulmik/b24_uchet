    const input = document.getElementById('search-input');      // Поле ввода поиска
    const resultsDiv = document.getElementById('results');      // Контейнер для вывода сделок

    // Функция загрузки сделок с сервера
    async function fetchDeals(query) {
        const response = await fetch('search.php?q=' + encodeURIComponent(query)); // Отправляем запрос с параметром q
        const deals = await response.json(); // Получаем результат в формате JSON
        resultsDiv.innerHTML = ''; // Очищаем блок вывода

        // Если ничего не найдено — показываем сообщение
        if (deals.length === 0) {
            resultsDiv.innerHTML = '<p>Ничего не найдено</p>';
            return;
        }

        // Перебираем полученные сделки
        for (const deal of deals) {
            const div = document.createElement('div');
            div.className = 'deal-block';
            div.innerHTML = `
                <strong>Сделка:</strong> ${deal.title}<br>
                <strong>Компания:</strong> ${deal.company}<br>
                <strong>Контакт:</strong> ${deal.contact}
            `;

            // 🔽 При клике на сделку заполняем форму
            div.addEventListener('click', () => {
                document.querySelector('input[name="deal_title"]').value = deal.title;
                document.querySelector('input[name="company_name"]').value = deal.company;
                document.querySelector('input[name="contact_name"]').value = deal.contact;
            });

            resultsDiv.appendChild(div); // Добавляем блок в HTML
        }
    }

    // Обработка ввода в поле поиска
    input.addEventListener('input', () => {
        const query = input.value.trim(); // Получаем текст из поля
        fetchDeals(query); // Загружаем сделки с фильтром
    });

    // При загрузке страницы — показать 6 последних сделок
    window.addEventListener('DOMContentLoaded', () => {
        fetchDeals(''); // Пустой запрос — покажет последние
    });
