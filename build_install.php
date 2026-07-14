<?php
/**
 * 生成一键安装文件
 */

function 获取所有文件($目录, $前缀 = '') {
    $结果 = [];
    $排除 = ['.git', 'data', 'install.php', 'build_install.php', '更新'];
    
    if (!is_dir($目录)) return $结果;
    
    $文件 = scandir($目录);
    foreach ($文件 as $文件名) {
        if ($文件名 == '.' || $文件名 == '..') continue;
        if (in_array($文件名, $排除)) continue;
        
        $路径 = $目录 . '/' . $文件名;
        $相对路径 = $前缀 ? $前缀 . '/' . $文件名 : $文件名;
        
        if (is_dir($路径)) {
            $结果 = array_merge($结果, 获取所有文件($路径, $相对路径));
        } else {
            $结果[$相对路径] = file_get_contents($路径);
        }
    }
    return $结果;
}

$文件列表 = 获取所有文件(__DIR__);

$install内容 = '<?php
/**
 * 修仙世界 - 一键安装程序
 * 版本: v1.3
 * 生成时间: ' . date('Y-m-d H:i:s') . '
 * 使用方法：将install.php上传到网站根目录，浏览器访问即可自动安装
 */

header(\'Content-Type: text/html; charset=utf-8\');
error_reporting(E_ALL);
ini_set(\'display_errors\', 1);

$install_dir = dirname(__FILE__);
$step = isset($_GET[\'step\']) ? intval($_GET[\'step\']) : 1;

function 写入文件($路径, $内容) {
    $目录 = dirname($路径);
    if (!is_dir($目录)) {
        mkdir($目录, 0755, true);
    }
    return file_put_contents($路径, $内容);
}

if ($step == 1) {
    echo \'<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>修仙世界 - 安装程序</title>
<style>
body { font-family: "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); color: #e8e8e8; margin: 0; padding: 50px; }
.container { max-width: 700px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
h1 { color: #ffd700; text-align: center; }
h2 { color: #ffd700; }
.btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ffd700, #ff8c00); color: #1a1a2e; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; border: none; cursor: pointer; }
.btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(255,215,0,0.4); }
.checklist { list-style: none; padding: 0; }
.checklist li { padding: 10px; margin: 5px 0; background: rgba(255,255,255,0.05); border-radius: 5px; }
.ok { color: #44ff44; }
.error { color: #ff4444; }
</style>
</head>
<body>
<div class="container">
<h1>修仙世界 - 安装程序</h1>
<h2>环境检测</h2>
<ul class="checklist">\';
    
    $php_version = phpversion();
    $php_ok = version_compare($php_version, \'5.4.0\', \'>=\');
    echo \'<li class="\' . ($php_ok ? \'ok\' : \'error\') . \'">PHP版本: \' . $php_version . \' (需要5.4+) \' . ($php_ok ? \'✓ 通过\' : \'✗ 不通过\') . \'</li>\';
    
    $write_ok = is_writable($install_dir);
    echo \'<li class="\' . ($write_ok ? \'ok\' : \'error\') . \'">目录可写: \' . ($write_ok ? \'✓ 通过\' : \'✗ 不通过，请设置目录权限\') . \'</li>\';
    
    $pdo_ok = extension_loaded(\'pdo\');
    echo \'<li class="\' . ($pdo_ok ? \'ok\' : \'error\') . \'">PDO扩展: \' . ($pdo_ok ? \'✓ 通过\' : \'✗ 不通过\') . \'</li>\';
    
    $session_ok = extension_loaded(\'session\');
    echo \'<li class="\' . ($session_ok ? \'ok\' : \'error\') . \'">Session扩展: \' . ($session_ok ? \'✓ 通过\' : \'✗ 不通过\') . \'</li>\';
    
    echo \'</ul>\';
    
    if ($php_ok && $write_ok && $pdo_ok && $session_ok) {
        echo \'<p style="text-align:center;margin-top:30px;"><a href="?step=2" class="btn">开始安装</a></p>\';
    } else {
        echo \'<p class="error" style="text-align:center;">环境检测不通过，请修复后重试</p>\';
    }
    
    echo \'</div></body></html>\';
} elseif ($step == 2) {
    
    $文件列表 = 获取文件列表();
    $成功数 = 0;
    $失败数 = 0;
    $失败列表 = [];
    
    foreach ($文件列表 as $相对路径 => $内容) {
        $完整路径 = $install_dir . \'/\' . $相对路径;
        if (写入文件($完整路径, $内容)) {
            $成功数++;
        } else {
            $失败数++;
            $失败列表[] = $相对路径;
        }
    }
    
    echo \'<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>修仙世界 - 安装程序</title>
<style>
body { font-family: "Microsoft YaHei", sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); color: #e8e8e8; margin: 0; padding: 50px; }
.container { max-width: 700px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
h1 { color: #ffd700; text-align: center; }
h2 { color: #ffd700; }
.btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #ffd700, #ff8c00); color: #1a1a2e; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
.ok { color: #44ff44; }
.error { color: #ff4444; }
.file-list { max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin: 20px 0; }
.file-item { padding: 5px; font-size: 13px; }
</style>
</head>
<body>
<div class="container">
<h1>修仙世界 - 安装程序</h1>
<h2>安装结果</h2>
<p>成功: <span class="ok">\' . $成功数 . \'</span> 个文件</p>
<p>失败: <span class="error">\' . $失败数 . \'</span> 个文件</p>\';
    
    if ($失败数 > 0) {
        echo \'<h3>失败文件列表:</h3><div class="file-list">\';
        foreach ($失败列表 as $文件) {
            echo \'<div class="file-item error">\' . $文件 . \'</div>\';
        }
        echo \'</div>\';
    }
    
    if ($失败数 == 0) {
        echo \'<div class="ok" style="text-align:center;font-size:18px;margin:20px 0;">安装成功！</div>\';
        echo \'<p style="text-align:center;"><b>默认管理员账号:</b> admin / admin123</p>\';
        echo \'<p style="text-align:center;margin-top:30px;"><a href="index.php" class="btn">进入游戏</a> &nbsp; <a href="admin.html" class="btn">管理后台</a></p>\';
        echo \'<p style="text-align:center;margin-top:20px;font-size:12px;color:#888;">提示：为了安全，安装完成后请删除install.php文件</p>\';
    }
    
    echo \'</div></body></html>\';
}

function 获取文件列表() {
    return [
';

foreach ($文件列表 as $路径 => $内容) {
    $install内容 .= "        '" . str_replace("'", "\\'", $路径) . "' => '";
    $install内容 .= str_replace("\\", "\\\\", str_replace("'", "\\'", str_replace("\n", "\\n", str_replace("\r", "", $内容))));
    $install内容 .= "',\n";
}

$install内容 .= "    ];
}
?>";

file_put_contents(__DIR__ . '/install.php', $install内容);
echo "install.php 生成成功！大小: " . round(strlen($install内容) / 1024, 2) . " KB\n";

// 也生成更新文件
$更新文件名 = '更新/更新_' . date('Ymd_Hi') . '_v1.3.php';
copy(__DIR__ . '/install.php', __DIR__ . '/' . $更新文件名);
echo "更新文件生成成功: $更新文件名\n";
