<?php
//директива в PHP(строгая типизация)
declare(strict_types=1);
//Определяем пространство имен
use Bitrix24\SDK\Services\ServiceBuilderFactory;
//файл включался только один раз
require_once 'vendor/autoload.php';
$B24 = ServiceBuilderFactory::createServiceBuilderFromWebhook(
    'https://b24-w4x2f8.bitrix24.ru/rest/1/62vvcftaaaszkhfk/'
);
//Поиск
$searchQuery = $_GET['q'] ?? null;

$filter = [];
if ($searchQuery) {
    $filter['%TITLE'] = $searchQuery; // Поиск по части названия сделки
}

// Получаем список сделок
$response = $B24->core->call('crm.deal.list', [
    'select'=> ['ID', 'TITLE', 'COMPANY_ID', 'CONTACT_ID'],
    'order' => ['ID','DESC'],
    'filter'=> $filter,
    'start' => 0,
    'limit' => 6,  
]);
//Получаем результат
$result = $response->getResponseData()->getResult();
$deals = $result ?? [];
//Пробежка по массиву, после получение данных
foreach ($deals as $deal) {
$title = htmlspecialchars($deal['TITLE']);
$companyName ='';
$contactName ='';
}
//Для хтмл переменная
$dealsBlocksHTML = '';
//Проверка на пустоту и если есть данные, то берем из название
if(!empty($deal['COMPANY_ID'])){
    $companyResponse = $B24->core->call('crm.company.get', [
        'id' => (int)$deal['COMPANY_ID'],
    ]);
    //Именно тут и берем из название
    $companyData = $companyResponse->getResponseData()->getResult();
    if(!empty($companyData['TITLE'])){
        $companyName = htmlspecialchars($companyData['TITLE']);
    }
}
//То же самое что и со сделками, но с контактами
if (!empty($deal['CONTACT_ID'])) {
    $contactResponse = $B24->core->call('crm.contact.get', [
        'id' => (int)$deal['CONTACT_ID'],
    ]);
    //Тут ФИО
    $contactData = $contactResponse->getResponseData()->getResult();
    if (!empty($contactData['NAME'])) {
        $contactName = htmlspecialchars($contactData['NAME']);
        // Добавим фамилию, если есть
        if (!empty($contactData['LAST_NAME'])) {
            $contactName .= ' ' . htmlspecialchars($contactData['LAST_NAME']);
        }
    }
}
//Делаем блоки для стилизации и ".=" метод добавления к существующей переменной
$dealsBlocksHTML .= '<div class="deal-block">';
$dealsBlocksHTML .= '<span class="deals-title-blocks">' . $title . '</span>';
$dealsBlocksHTML .= '<span class="company-name">' . $companyName . '</span>';
$dealsBlocksHTML .= '<span class="contact-name">' . $contactName . '</span>';
$dealsBlocksHTML .= '</div>';


//определили переменную $template
$template = file_get_contents('template.html');
$template = str_replace('{{deals}}', $dealsBlocksHTML, $template);
$template = str_replace('{{query}}', htmlspecialchars($searchQuery ?? ''), $template);
echo $template;