<?php
header('Content-Type: text/html; charset=utf-8');
session_start();

define('ROOT_PATH', dirname(__DIR__));
define('CONFIG_PATH', ROOT_PATH . '/config');
define('DATA_PATH', ROOT_PATH . '/data');

function 读取配置($文件名) {
    $路径 = CONFIG_PATH . '/' . $文件名 . '.ini';
    if (!file_exists($路径)) {
        return [];
    }
    return parse_ini_file($路径, true, INI_SCANNER_RAW);
}

function 写入配置($文件名, $数据) {
    $路径 = CONFIG_PATH . '/' . $文件名 . '.ini';
    $内容 = '';
    foreach ($数据 as $节 => $项) {
        $内容 .= "[$节]\n";
        foreach ($项 as $键 => $值) {
            if (is_array($值)) {
                $值 = implode(',', $值);
            }
            $内容 .= "$键 = $值\n";
        }
        $内容 .= "\n";
    }
    return file_put_contents($路径, $内容);
}

function 读取用户数据($用户名) {
    $路径 = DATA_PATH . '/users/' . $用户名 . '.ini';
    if (!file_exists($路径)) {
        return null;
    }
    return parse_ini_file($路径, true, INI_SCANNER_RAW);
}

function 写入用户数据($用户名, $数据) {
    $路径 = DATA_PATH . '/users/' . $用户名 . '.ini';
    $内容 = '';
    foreach ($数据 as $节 => $项) {
        $内容 .= "[$节]\n";
        foreach ($项 as $键 => $值) {
            if (is_array($值)) {
                $值 = implode(',', $值);
            }
            $内容 .= "$键 = $值\n";
        }
        $内容 .= "\n";
    }
    return file_put_contents($路径, $内容);
}

function 用户存在($用户名) {
    return file_exists(DATA_PATH . '/users/' . $用户名 . '.ini');
}

function 生成ID() {
    return uniqid() . '_' . rand(1000, 9999);
}

function JSON返回($成功, $消息 = '', $数据 = []) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        '成功' => $成功,
        '消息' => $消息,
        '数据' => $数据
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function 获取当前用户() {
    if (!isset($_SESSION['用户名'])) {
        return null;
    }
    return 读取用户数据($_SESSION['用户名']);
}

function 计算升级所需经验($等级) {
    return $等级 * 100;
}

function 检查升级(&$玩家数据) {
    $当前等级 = $玩家数据['角色']['等级'];
    $当前经验 = $玩家数据['角色']['经验'];
    $所需经验 = 计算升级所需经验($当前等级);
    
    $升级次数 = 0;
    while ($当前经验 >= $所需经验) {
        $当前经验 -= $所需经验;
        $当前等级++;
        $升级次数++;
        $所需经验 = 计算升级所需经验($当前等级);
    }
    
    if ($升级次数 > 0) {
        $玩家数据['角色']['等级'] = $当前等级;
        $玩家数据['角色']['经验'] = $当前经验;
        $玩家数据['角色']['最大生命'] += $升级次数 * 20;
        $玩家数据['角色']['生命'] = $玩家数据['角色']['最大生命'];
        $玩家数据['角色']['最大灵力'] += $升级次数 * 10;
        $玩家数据['角色']['灵力'] = $玩家数据['角色']['最大灵力'];
        $玩家数据['角色']['攻击'] += $升级次数 * 3;
        $玩家数据['角色']['防御'] += $升级次数 * 2;
        return $升级次数;
    }
    return 0;
}

function 添加物品到背包(&$玩家数据, $物品名, $数量 = 1) {
    if (!isset($玩家数据['背包'])) {
        $玩家数据['背包'] = [];
    }
    
    if (isset($玩家数据['背包'][$物品名])) {
        $玩家数据['背包'][$物品名] += $数量;
    } else {
        $玩家数据['背包'][$物品名] = $数量;
    }
}

function 从背包移除物品(&$玩家数据, $物品名, $数量 = 1) {
    if (!isset($玩家数据['背包'][$物品名]) || $玩家数据['背包'][$物品名] < $数量) {
        return false;
    }
    
    $玩家数据['背包'][$物品名] -= $数量;
    if ($玩家数据['背包'][$物品名] <= 0) {
        unset($玩家数据['背包'][$物品名]);
    }
    return true;
}

function 获取物品信息($物品名) {
    $物品配置 = 读取配置('物品配置');
    return isset($物品配置[$物品名]) ? $物品配置[$物品名] : null;
}

function 获取怪物信息($怪物名) {
    $怪物配置 = 读取配置('怪物配置');
    return isset($怪物配置[$怪物名]) ? $怪物配置[$怪物名] : null;
}

function 获取NPC信息($NPC名) {
    $NPC配置 = 读取配置('NPC配置');
    return isset($NPC配置[$NPC名]) ? $NPC配置[$NPC名] : null;
}

function 获取技能信息($技能名) {
    $技能配置 = 读取配置('技能配置');
    return isset($技能配置[$技能名]) ? $技能配置[$技能名] : null;
}

function 获取地图信息($地图名) {
    $地图配置 = 读取配置('地图配置');
    return isset($地图配置[$地图名]) ? $地图配置[$地图名] : null;
}

function 获取所有在线玩家() {
    $玩家列表 = [];
    $目录 = DATA_PATH . '/users';
    if (!is_dir($目录)) {
        return $玩家列表;
    }
    $文件 = scandir($目录);
    foreach ($文件 as $文件名) {
        if (pathinfo($文件名, PATHINFO_EXTENSION) == 'ini') {
            $用户名 = pathinfo($文件名, PATHINFO_FILENAME);
            $用户数据 = 读取用户数据($用户名);
            if ($用户数据 && isset($用户数据['角色'])) {
                $玩家列表[] = [
                    '用户名' => $用户名,
                    '角色名' => $用户数据['角色']['角色名'],
                    '等级' => $用户数据['角色']['等级'],
                    '位置' => $用户数据['角色']['位置']
                ];
            }
        }
    }
    return $玩家列表;
}

function 获取当前地图玩家($地图名) {
    $所有玩家 = 获取所有在线玩家();
    $当前玩家 = [];
    foreach ($所有玩家 as $玩家) {
        if ($玩家['位置'] == $地图名) {
            $当前玩家[] = $玩家;
        }
    }
    return $当前玩家;
}
?>
