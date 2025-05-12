<?php

declare(strict_types=1);

use Bitrix24\SDK\Services\ServiceBuilderFactory;

require_once 'vendor/autoload.php';

$B24 = ServiceBuilderFactory::createServiceBuilderFromWebhook(
    'https://b24-w4x2f8.bitrix24.ru/rest/1/62vvcftaaaszkhfk/'
);
