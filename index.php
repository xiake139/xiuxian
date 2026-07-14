<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

if (isset($_SESSION['用户名'])) {
    require_once 'api/core.php';
    $用户数据 = 读取用户数据($_SESSION['用户名']);
    if ($用户数据['账号']['是否已创建角色'] == '是') {
        header('Location: game.php');
        exit;
    } else {
        header('Location: create_character.php');
        exit;
    }
} else {
    header('Location: login.html');
    exit;
}
?>
