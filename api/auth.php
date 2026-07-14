<?php
require_once 'core.php';

$动作 = isset($_POST['动作']) ? $_POST['动作'] : '';

switch ($动作) {
    case '注册':
        $用户名 = isset($_POST['用户名']) ? trim($_POST['用户名']) : '';
        $密码 = isset($_POST['密码']) ? $_POST['密码'] : '';
        $确认密码 = isset($_POST['确认密码']) ? $_POST['确认密码'] : '';
        
        if (empty($用户名) || empty($密码)) {
            JSON返回(false, '用户名和密码不能为空');
        }
        if ($密码 !== $确认密码) {
            JSON返回(false, '两次密码不一致');
        }
        if (用户存在($用户名)) {
            JSON返回(false, '用户名已存在');
        }
        
        $系统配置 = 读取配置('系统配置');
        $用户数据 = [
            '账号' => [
                '用户名' => $用户名,
                '密码' => md5($密码),
                '注册时间' => date('Y-m-d H:i:s'),
                '是否已创建角色' => '否'
            ]
        ];
        
        if (写入用户数据($用户名, $用户数据)) {
            JSON返回(true, '注册成功，请登录');
        } else {
            JSON返回(false, '注册失败');
        }
        break;
        
    case '登录':
        $用户名 = isset($_POST['用户名']) ? trim($_POST['用户名']) : '';
        $密码 = isset($_POST['密码']) ? $_POST['密码'] : '';
        
        if (empty($用户名) || empty($密码)) {
            JSON返回(false, '用户名和密码不能为空');
        }
        
        $用户数据 = 读取用户数据($用户名);
        if (!$用户数据) {
            JSON返回(false, '用户不存在');
        }
        if ($用户数据['账号']['密码'] !== md5($密码)) {
            JSON返回(false, '密码错误');
        }
        
        $_SESSION['用户名'] = $用户名;
        JSON返回(true, '登录成功', [
            '已创建角色' => $用户数据['账号']['是否已创建角色']
        ]);
        break;
        
    case '退出登录':
        session_destroy();
        JSON返回(true, '已退出登录');
        break;
        
    case '检查登录':
        if (isset($_SESSION['用户名'])) {
            $用户数据 = 读取用户数据($_SESSION['用户名']);
            JSON返回(true, '已登录', [
                '用户名' => $_SESSION['用户名'],
                '已创建角色' => $用户数据['账号']['是否已创建角色']
            ]);
        } else {
            JSON返回(false, '未登录');
        }
        break;
        
    default:
        JSON返回(false, '无效的操作');
        break;
}
?>
