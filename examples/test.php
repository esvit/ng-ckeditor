<?php

require_once '../vendor/autoload.php';

/**
 * @var HTMLPurifier_Config $config
 */
$config = HTMLPurifier_Config::createDefault();

$config->set('Core.Encoding', 'UTF-8');
$config->set('URI.Base', 'http://news.mistinfo.com');
$content = json_decode(file_get_contents('php://input'));
$pur = new HTMLPurifier($config);
$content = $pur->purify($content->content);

file_put_contents('1.html', $content);