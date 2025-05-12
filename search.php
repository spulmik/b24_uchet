<?php
declare(strict_types=1);
header('Content-Type: application/json');

use Bitrix24\SDK\Services\ServiceBuilderFactory;
require_once 'vendor/autoload.php';

// Создание подключения к Bitrix24
$B24 = ServiceBuilderFactory::createServiceBuilderFromWebhook(
    'https://b24-w4x2f8.bitrix24.ru/rest/1/62vvcftaaaszkhfk/'
);

// Получаем параметр поиска
$searchQuery = $_GET['q'] ?? null;

// Подготовка фильтра для поиска по названию сделки
$filter = [];
if ($searchQuery) {
    $filter['%TITLE'] = $searchQuery;
}

// Получаем сделки
$response = $B24->core->call('crm.deal.list', [
    'select'=> ['ID', 'TITLE', 'COMPANY_ID', 'CONTACT_ID'],
    'order' => ['ID' => 'DESC'],
    'filter' => $filter,
    'start' => 0,
    'limit' => 6,
]);

$result = $response->getResponseData()->getResult();
$deals = $result ?? [];

$data = [];

// Обрабатываем каждую сделку
foreach($deals as $deal){
    // Название компании
    $companyName = '';
    if (!empty($deal['COMPANY_ID'])) {
        $companyResponse = $B24->core->call('crm.company.get', [
            'id' => (int)$deal['COMPANY_ID'],
        ]);
        $companyData = $companyResponse->getResponseData()->getResult();
        if (!empty($companyData['TITLE'])) {
            $companyName = $companyData['TITLE'];
        }
    }

    // Имя контакта
    $contactName = '';
    if (!empty($deal['CONTACT_ID'])) {
        $contactResponse = $B24->core->call('crm.contact.get', [
            'id' => (int)$deal['CONTACT_ID'],
        ]);
        $contactData = $contactResponse->getResponseData()->getResult();
        if (!empty($contactData['NAME']) || !empty($contactData['LAST_NAME'])) {
            $contactName = trim(($contactData['NAME'] ?? '') . ' ' . ($contactData['LAST_NAME'] ?? ''));
        }
    }

    // Сохраняем результат
    $data[] = [
        'title' => $deal['TITLE'],
        'company' => $companyName,
        'contact' => $contactName,
    ];
}

echo json_encode($data);