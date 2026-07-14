var 当前地图 = '';
var 玩家数据 = {};
var 战斗中 = false;

function 发送请求(url, data, callback) {
    var formData = new FormData();
    for (var key in data) {
        formData.append(key, data[key]);
    }
    
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(result) {
        callback(result);
    })
    .catch(function(error) {
        console.error('请求失败:', error);
        alert('网络错误: ' + error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    刷新玩家信息();
    刷新地图();
});

function 刷新玩家信息() {
    发送请求('api/character.php', {动作: '获取角色信息'}, function(result) {
        if (result.成功) {
            玩家数据 = result.数据;
            更新玩家信息显示();
        }
    });
}

function 更新玩家信息显示() {
    document.getElementById('角色名').textContent = 玩家数据.角色名;
    document.getElementById('等级').textContent = 玩家数据.等级;
    document.getElementById('门派').textContent = 玩家数据.门派;
    document.getElementById('生命').textContent = 玩家数据.生命;
    document.getElementById('最大生命').textContent = 玩家数据.最大生命;
    document.getElementById('灵力').textContent = 玩家数据.灵力;
    document.getElementById('最大灵力').textContent = 玩家数据.最大灵力;
    document.getElementById('经验').textContent = 玩家数据.经验;
    document.getElementById('升级所需').textContent = 玩家数据.等级 * 100;
    document.getElementById('货币').textContent = 玩家数据.货币;
}

function 刷新地图() {
    发送请求('api/map.php', {动作: '获取当前地图'}, function(result) {
        if (result.成功) {
            var 地图 = result.数据;
            当前地图 = 地图.地图名;
            document.getElementById('地图名').textContent = 地图.地图名;
            document.getElementById('地图描述').textContent = 地图.描述;
            
            var NPC列表 = document.getElementById('NPC列表');
            NPC列表.innerHTML = '';
            地图.NPC列表.forEach(function(npc) {
                var btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.textContent = npc;
                btn.onclick = function() { 点击NPC(npc); };
                NPC列表.appendChild(btn);
            });
            
            var 怪物列表 = document.getElementById('怪物列表');
            怪物列表.innerHTML = '';
            地图.怪物列表.forEach(function(怪物) {
                var btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.textContent = 怪物;
                btn.onclick = function() { 点击怪物(怪物); };
                怪物列表.appendChild(btn);
            });
            
            var 玩家列表 = document.getElementById('玩家列表');
            玩家列表.innerHTML = '';
            地图.玩家列表.forEach(function(玩家) {
                var btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.textContent = 玩家.角色名 + '(Lv.' + 玩家.等级 + ')';
                btn.onclick = function() { 点击玩家(玩家); };
                玩家列表.appendChild(btn);
            });
            
            ['前', '后', '左', '右'].forEach(function(方向) {
                var btn = document.getElementById('方向-' + 方向);
                if (地图.可移动方向[方向]) {
                    btn.disabled = false;
                    btn.textContent = (方向 == '前' ? '↑ ' : 方向 == '后' ? '↓ ' : 方向 == '左' ? '← ' : '') + 地图.可移动方向[方向] + (方向 == '右' ? ' →' : '');
                } else {
                    btn.disabled = true;
                    btn.textContent = (方向 == '左' ? '← ' : '') + 方向 + (方向 == '右' ? ' →' : '');
                }
            });
        }
    });
}

function 移动(方向) {
    发送请求('api/map.php', {动作: '移动', 方向: 方向}, function(result) {
        if (result.成功) {
            刷新地图();
            刷新玩家信息();
        } else {
            alert(result.消息);
        }
    });
}

function 点击NPC(NPC名) {
    发送请求('api/npc.php', {动作: '获取NPC信息', NPC名: NPC名}, function(result) {
        if (result.成功) {
            var npc = result.数据;
            var html = '<h2>' + NPC名 + '</h2>';
            html += '<div class="npc-dialog">' + npc.描述 + '</div>';
            html += '<div style="display:flex;gap:10px;flex-wrap:wrap;">';
            html += '<button class="btn btn-primary" onclick="与NPC对话(\'' + NPC名 + '\')">对话</button>';
            if (npc.商店) {
                html += '<button class="btn btn-primary" onclick="打开NPC商店(\'' + NPC名 + '\')">商店</button>';
            }
            if (npc.任务列表.length > 0) {
                html += '<button class="btn btn-primary" onclick="查看NPC任务(\'' + NPC名 + '\')">任务</button>';
            }
            html += '</div>';
            打开弹窗(html);
        }
    });
}

function 与NPC对话(NPC名) {
    发送请求('api/npc.php', {动作: '与NPC对话', NPC名: NPC名}, function(result) {
        if (result.成功) {
            var html = '<h2>' + NPC名 + '</h2>';
            html += '<div class="npc-dialog">' + result.消息 + '</div>';
            html += '<button class="btn btn-primary" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
        }
    });
}

function 打开NPC商店(NPC名) {
    发送请求('api/npc.php', {动作: '打开NPC商店', NPC名: NPC名}, function(result) {
        if (result.成功) {
            var 商店 = result.数据;
            显示商店界面(商店.商店名, 商店.物品列表);
        } else {
            alert(result.消息);
        }
    });
}

function 查看NPC任务(NPC名) {
    发送请求('api/quest.php', {动作: '获取可接任务', NPC名: NPC名}, function(result) {
        if (result.成功) {
            var html = '<h2>可接任务</h2>';
            if (result.数据.length == 0) {
                html += '<p>暂无可接任务</p>';
            } else {
                result.数据.forEach(function(任务) {
                    html += '<div class="quest-item">';
                    html += '<div class="item-info">';
                    html += '<div class="name">' + 任务.名称 + '</div>';
                    html += '<div class="desc">' + 任务.描述 + '</div>';
                    html += '<div class="desc">奖励: 经验' + 任务.奖励经验 + ' 货币' + 任务.奖励货币;
                    if (任务.奖励物品) {
                        html += ' ' + 任务.奖励物品 + 'x' + 任务.奖励物品数量;
                    }
                    html += '</div></div>';
                    html += '<div class="item-actions">';
                    html += '<button class="btn btn-success" onclick="接受任务(\'' + 任务.名称 + '\')">接受</button>';
                    html += '</div></div>';
                });
            }
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
        }
    });
}

function 接受任务(任务名) {
    发送请求('api/quest.php', {动作: '接受任务', 任务名: 任务名}, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭弹窗();
        } else {
            alert(result.消息);
        }
    });
}

function 点击怪物(怪物名) {
    发送请求('api/battle.php', {动作: '获取怪物信息', 怪物名: 怪物名}, function(result) {
        if (result.成功) {
            var 怪物 = result.数据;
            var html = '<h2>' + 怪物.怪物名 + '</h2>';
            html += '<div class="monster-info">';
            html += '<h3>怪物属性</h3>';
            html += '<div class="monster-stats">';
            html += '<div class="stat-item"><div class="label">等级</div><div class="value">' + 怪物.等级 + '</div></div>';
            html += '<div class="stat-item"><div class="label">生命</div><div class="value">' + 怪物.生命 + '</div></div>';
            html += '<div class="stat-item"><div class="label">攻击</div><div class="value">' + 怪物.攻击 + '</div></div>';
            html += '<div class="stat-item"><div class="label">防御</div><div class="value">' + 怪物.防御 + '</div></div>';
            html += '</div>';
            html += '<h3>击杀奖励</h3>';
            html += '<p>经验: ' + 怪物.经验奖励 + '</p>';
            html += '<p>货币: ' + 怪物.货币奖励 + '</p>';
            html += '<h3>掉落物品</h3>';
            html += '<div class="drop-list">';
            怪物.掉落物品.forEach(function(掉落) {
                html += '<div class="drop-item">' + 掉落.物品名 + ' x' + 掉落.数量 + ' (概率:' + 掉落.概率 + '%)</div>';
            });
            html += '</div></div>';
            html += '<div style="display:flex;gap:10px;">';
            html += '<button class="btn btn-danger" onclick="开始战斗(\'' + 怪物名 + '\')">战斗</button>';
            html += '<button class="btn btn-primary" onclick="关闭弹窗()">关闭</button>';
            html += '</div>';
            打开弹窗(html);
        }
    });
}

function 开始战斗(怪物名) {
    发送请求('api/battle.php', {动作: '开始战斗', 怪物名: 怪物名}, function(result) {
        if (result.成功) {
            战斗中 = true;
            显示战斗界面(result);
        } else {
            alert(result.消息);
        }
    });
}

function 显示战斗界面(战斗数据) {
    var html = '<h2>战斗中</h2>';
    html += '<div class="battle-area">';
    html += '<div class="battle-status">';
    html += '<div class="battle-entity">';
    html += '<h3>你</h3>';
    html += '<div class="health-bar"><div class="health-fill" id="玩家生命条" style="width:100%"></div></div>';
    html += '<div class="health-text" id="玩家生命文本">' + 战斗数据.数据.玩家生命 + '/' + 战斗数据.数据.玩家最大生命 + '</div>';
    html += '<div class="health-bar" style="background:rgba(0,100,255,0.3);"><div class="health-fill" id="玩家灵力条" style="width:100%;background:linear-gradient(90deg,#4444ff,#6666ff);"></div></div>';
    html += '<div class="health-text" id="玩家灵力文本">' + 战斗数据.数据.玩家灵力 + '/' + 战斗数据.数据.玩家最大灵力 + '</div>';
    html += '</div>';
    html += '<div class="battle-entity">';
    html += '<h3 id="战斗怪物名">' + 战斗数据.数据.怪物名 + '</h3>';
    html += '<div class="health-bar"><div class="health-fill" id="怪物生命条" style="width:100%"></div></div>';
    html += '<div class="health-text" id="怪物生命文本">' + 战斗数据.数据.怪物生命 + '/' + 战斗数据.数据.怪物最大生命 + '</div>';
    html += '</div></div>';
    html += '<div class="battle-log" id="战斗日志">' + 战斗数据.消息.replace(/\\n/g, '<br>') + '</div>';
    html += '<div class="battle-actions">';
    html += '<button class="btn btn-primary" onclick="普通攻击()">普通攻击</button>';
    html += '<button class="btn btn-primary" onclick="选择技能()">技能</button>';
    html += '<button class="btn btn-primary" onclick="战斗使用物品()">物品</button>';
    html += '<button class="btn btn-danger" onclick="逃跑()">逃跑</button>';
    html += '</div></div>';
    打开弹窗(html);
}

function 普通攻击() {
    发送请求('api/battle.php', {动作: '普通攻击'}, function(result) {
        更新战斗界面(result);
    });
}

function 选择技能() {
    发送请求('api/skill.php', {动作: '获取技能列表'}, function(result) {
        if (result.成功) {
            var html = '<h2>选择技能</h2>';
            result.数据.所有技能.forEach(function(技能) {
                if (技能.已学 && 技能.类型 == '攻击') {
                    html += '<div class="skill-item">';
                    html += '<div class="item-info">';
                    html += '<div class="name">' + 技能.名称 + '</div>';
                    html += '<div class="desc">' + 技能.描述 + ' | 消耗灵力: ' + 技能.消耗灵力 + '</div>';
                    html += '</div>';
                    html += '<div class="item-actions">';
                    html += '<button class="btn btn-success" onclick="使用技能(\'' + 技能.名称 + '\')">使用</button>';
                    html += '</div></div>';
                }
            });
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="返回战斗()">返回</button>';
            打开弹窗(html);
        }
    });
}

function 使用技能(技能名) {
    发送请求('api/battle.php', {动作: '使用技能', 技能名: 技能名}, function(result) {
        更新战斗界面(result);
    });
}

function 战斗使用物品() {
    发送请求('api/bag.php', {动作: '获取背包'}, function(result) {
        if (result.成功) {
            var html = '<h2>选择物品</h2>';
            var 有消耗品 = false;
            result.数据.forEach(function(物品) {
                if (物品.类型 == '药品' || 物品.类型 == '丹药') {
                    有消耗品 = true;
                    html += '<div class="bag-item">';
                    html += '<div class="item-info">';
                    html += '<div class="name">' + 物品.名称 + ' x' + 物品.数量 + '</div>';
                    html += '<div class="desc">' + 物品.描述 + '</div>';
                    html += '</div>';
                    html += '<div class="item-actions">';
                    html += '<button class="btn btn-success" onclick="战斗使用药品(\'' + 物品.名称 + '\')">使用</button>';
                    html += '</div></div>';
                }
            });
            if (!有消耗品) {
                html += '<p>没有可用的消耗品</p>';
            }
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="返回战斗()">返回</button>';
            打开弹窗(html);
        }
    });
}

function 战斗使用药品(物品名) {
    发送请求('api/bag.php', {动作: '使用物品', 物品名: 物品名}, function(result) {
        if (result.成功) {
            alert(result.消息);
            刷新玩家信息();
            普通攻击();
        } else {
            alert(result.消息);
        }
    });
}

function 返回战斗() {
    var 日志 = document.getElementById('战斗日志');
    if (日志) {
        关闭弹窗();
        document.getElementById('modal').style.display = 'block';
    }
}

function 逃跑() {
    发送请求('api/battle.php', {动作: '逃跑'}, function(result) {
        if (result.成功) {
            if (result.数据 && result.数据.战斗结束) {
                alert(result.消息);
                战斗中 = false;
                关闭弹窗();
                刷新玩家信息();
                刷新地图();
            } else {
                更新战斗界面(result);
            }
        } else {
            alert(result.消息);
        }
    });
}

function 更新战斗界面(result) {
    var 日志 = document.getElementById('战斗日志');
    if (日志) {
        日志.innerHTML += '<br>' + result.消息.replace(/\\n/g, '<br>');
        日志.scrollTop = 日志.scrollHeight;
    }
    
    if (result.数据) {
        if (result.数据.玩家生命 !== undefined) {
            var 玩家生命百分比 = (result.数据.玩家生命 / result.数据.玩家最大生命) * 100;
            var 玩家生命条 = document.getElementById('玩家生命条');
            if (玩家生命条) 玩家生命条.style.width = 玩家生命百分比 + '%';
            var 玩家生命文本 = document.getElementById('玩家生命文本');
            if (玩家生命文本) 玩家生命文本.textContent = result.数据.玩家生命 + '/' + result.数据.玩家最大生命;
        }
        
        if (result.数据.玩家灵力 !== undefined) {
            var 玩家灵力百分比 = (result.数据.玩家灵力 / result.数据.玩家最大灵力) * 100;
            var 玩家灵力条 = document.getElementById('玩家灵力条');
            if (玩家灵力条) 玩家灵力条.style.width = 玩家灵力百分比 + '%';
            var 玩家灵力文本 = document.getElementById('玩家灵力文本');
            if (玩家灵力文本) 玩家灵力文本.textContent = result.数据.玩家灵力 + '/' + result.数据.玩家最大灵力;
        }
        
        if (result.数据.怪物生命 !== undefined) {
            var 怪物生命百分比 = (result.数据.怪物生命 / result.数据.怪物最大生命) * 100;
            var 怪物生命条 = document.getElementById('怪物生命条');
            if (怪物生命条) 怪物生命条.style.width = 怪物生命百分比 + '%';
            var 怪物生命文本 = document.getElementById('怪物生命文本');
            if (怪物生命文本) 怪物生命文本.textContent = result.数据.怪物生命 + '/' + result.数据.怪物最大生命;
        }
        
        if (result.数据.战斗结束) {
            战斗中 = false;
            setTimeout(function() {
                alert(result.消息);
                关闭弹窗();
                刷新玩家信息();
                刷新地图();
            }, 500);
        }
    }
}

function 点击玩家(玩家) {
    var html = '<h2>' + 玩家.角色名 + '</h2>';
    html += '<p>等级: ' + 玩家.等级 + '</p>';
    html += '<p>位置: ' + 玩家.位置 + '</p>';
    html += '<div style="display:flex;gap:10px;margin-top:15px;">';
    html += '<button class="btn btn-primary" onclick="显示赠送物品(\'' + 玩家.用户名 + '\')">赠送物品</button>';
    html += '<button class="btn btn-primary" onclick="显示赠送货币(\'' + 玩家.用户名 + '\')">赠送货币</button>';
    html += '<button class="btn btn-primary" onclick="关闭弹窗()">关闭</button>';
    html += '</div>';
    打开弹窗(html);
}

function 显示赠送物品(目标玩家) {
    发送请求('api/bag.php', {动作: '获取背包'}, function(result) {
        if (result.成功) {
            var html = '<h2>赠送物品给 ' + 目标玩家 + '</h2>';
            html += '<div class="gift-form">';
            html += '<div class="form-group"><label>选择物品</label>';
            html += '<select id="赠送物品选择">';
            result.数据.forEach(function(物品) {
                html += '<option value="' + 物品.名称 + '">' + 物品.名称 + ' (数量:' + 物品.数量 + ')</option>';
            });
            html += '</select></div>';
            html += '<div class="form-group"><label>数量</label>';
            html += '<input type="number" id="赠送数量" value="1" min="1"></div>';
            html += '<button class="btn btn-success" onclick="赠送物品(\'' + 目标玩家 + '\')">确认赠送</button>';
            html += '</div>';
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">取消</button>';
            打开弹窗(html);
        }
    });
}

function 赠送物品(目标玩家) {
    var 物品名 = document.getElementById('赠送物品选择').value;
    var 数量 = document.getElementById('赠送数量').value;
    
    发送请求('api/npc.php', {
        动作: '赠送物品',
        目标玩家: 目标玩家,
        物品名: 物品名,
        数量: 数量
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭弹窗();
        } else {
            alert(result.消息);
        }
    });
}

function 显示赠送货币(目标玩家) {
    var html = '<h2>赠送货币给 ' + 目标玩家 + '</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>数量</label>';
    html += '<input type="number" id="赠送货币数量" value="100" min="1"></div>';
    html += '<button class="btn btn-success" onclick="赠送货币(\'' + 目标玩家 + '\')">确认赠送</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">取消</button>';
    打开弹窗(html);
}

function 赠送货币(目标玩家) {
    var 数量 = document.getElementById('赠送货币数量').value;
    
    发送请求('api/npc.php', {
        动作: '赠送货币',
        目标玩家: 目标玩家,
        数量: 数量
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            刷新玩家信息();
            关闭弹窗();
        } else {
            alert(result.消息);
        }
    });
}

function 显示面板(面板名) {
    switch(面板名) {
        case '背包':
            显示背包();
            break;
        case '装备':
            显示装备();
            break;
        case '技能':
            显示技能();
            break;
        case '任务':
            显示任务();
            break;
        case '商店':
            显示系统商店();
            break;
    }
}

function 显示背包() {
    发送请求('api/bag.php', {动作: '获取背包'}, function(result) {
        if (result.成功) {
            var html = '<h2>背包</h2>';
            if (result.数据.length == 0) {
                html += '<p>背包空空如也</p>';
            } else {
                result.数据.forEach(function(物品) {
                    html += '<div class="bag-item">';
                    html += '<div class="item-info">';
                    html += '<div class="name">' + 物品.名称 + ' x' + 物品.数量 + '</div>';
                    html += '<div class="desc">' + 物品.描述 + ' | 类型:' + 物品.类型 + ' | 等级:' + 物品.等级 + '</div>';
                    html += '</div>';
                    html += '<div class="item-actions">';
                    if (物品.类型 == '药品' || 物品.类型 == '丹药') {
                        html += '<button class="btn btn-success" onclick="使用物品(\'' + 物品.名称 + '\')">使用</button>';
                    }
                    if (物品.类型 == '武器' || 物品.类型 == '防具' || 物品.类型 == '饰品') {
                        html += '<button class="btn btn-success" onclick="装备物品(\'' + 物品.名称 + '\')">装备</button>';
                    }
                    html += '<button class="btn btn-danger" onclick="丢弃物品(\'' + 物品.名称 + '\')">丢弃</button>';
                    html += '</div></div>';
                });
            }
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
        }
    });
}

function 使用物品(物品名) {
    发送请求('api/bag.php', {动作: '使用物品', 物品名: 物品名}, function(result) {
        if (result.成功) {
            alert(result.消息);
            刷新玩家信息();
            显示背包();
        } else {
            alert(result.消息);
        }
    });
}

function 装备物品(物品名) {
    发送请求('api/equipment.php', {动作: '装备物品', 物品名: 物品名}, function(result) {
        if (result.成功) {
            alert('装备成功');
            刷新玩家信息();
            显示背包();
        } else {
            alert(result.消息);
        }
    });
}

function 丢弃物品(物品名) {
    if (confirm('确定要丢弃 ' + 物品名 + ' 吗？')) {
        发送请求('api/bag.php', {动作: '丢弃物品', 物品名: 物品名, 数量: 1}, function(result) {
            if (result.成功) {
                显示背包();
            } else {
                alert(result.消息);
            }
        });
    }
}

function 显示装备() {
    发送请求('api/equipment.php', {动作: '获取装备'}, function(result) {
        if (result.成功) {
            var 装备 = result.数据.装备;
            var 总属性 = result.数据.总属性;
            var html = '<h2>装备</h2>';
            html += '<div class="monster-stats" style="margin-bottom:20px;">';
            html += '<div class="stat-item"><div class="label">总攻击</div><div class="value">' + 总属性.攻击 + '</div></div>';
            html += '<div class="stat-item"><div class="label">总防御</div><div class="value">' + 总属性.防御 + '</div></div>';
            html += '<div class="stat-item"><div class="label">最大生命</div><div class="value">' + 总属性.最大生命 + '</div></div>';
            html += '<div class="stat-item"><div class="label">最大灵力</div><div class="value">' + 总属性.最大灵力 + '</div></div>';
            html += '</div>';
            
            ['武器', '防具', '饰品'].forEach(function(部位) {
                html += '<div class="equip-item">';
                html += '<div class="item-info">';
                html += '<div class="name">' + 部位 + ': ';
                if (装备[部位]) {
                    html += 装备[部位].名称;
                    html += '</div>';
                    html += '<div class="desc">攻击+' + 装备[部位].信息.攻击 + ' 防御+' + 装备[部位].信息.防御 + ' 生命+' + 装备[部位].信息.生命 + '</div>';
                } else {
                    html += '未装备</div>';
                    html += '<div class="desc">暂无装备</div>';
                }
                html += '</div>';
                html += '<div class="item-actions">';
                if (装备[部位]) {
                    html += '<button class="btn btn-danger" onclick="卸下装备(\'' + 部位 + '\')">卸下</button>';
                }
                html += '</div></div>';
            });
            
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
        }
    });
}

function 卸下装备(部位) {
    发送请求('api/equipment.php', {动作: '卸下装备', 部位: 部位}, function(result) {
        if (result.成功) {
            alert('卸下成功');
            刷新玩家信息();
            显示装备();
        } else {
            alert(result.消息);
        }
    });
}

function 显示技能() {
    发送请求('api/skill.php', {动作: '获取技能列表'}, function(result) {
        if (result.成功) {
            var html = '<h2>技能</h2>';
            result.数据.所有技能.forEach(function(技能) {
                html += '<div class="skill-item">';
                html += '<div class="item-info">';
                html += '<div class="name">' + 技能.名称 + '</div>';
                html += '<div class="desc">' + 技能.描述 + ' | 类型:' + 技能.类型 + ' | 消耗灵力:' + 技能.消耗灵力 + '</div>';
                html += '</div>';
                html += '<div class="item-actions">';
                if (技能.已学) {
                    html += '<span style="color:#44ff44;">已学习</span>';
                } else {
                    html += '<button class="btn btn-success" onclick="学习技能(\'' + 技能.名称 + '\')">学习</button>';
                }
                html += '</div></div>';
            });
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
        }
    });
}

function 学习技能(技能名) {
    发送请求('api/skill.php', {动作: '学习技能', 技能名: 技能名}, function(result) {
        if (result.成功) {
            alert(result.消息);
            显示技能();
        } else {
            alert(result.消息);
        }
    });
}

function 显示任务() {
    发送请求('api/quest.php', {动作: '获取已接任务'}, function(result) {
        if (result.成功) {
            var html = '<h2>已接任务</h2>';
            if (result.数据.length == 0) {
                html += '<p>暂无已接任务，去找NPC接取任务吧！</p>';
            } else {
                result.数据.forEach(function(任务) {
                    html += '<div class="quest-item">';
                    html += '<div class="item-info">';
                    html += '<div class="name">' + 任务.名称 + '</div>';
                    html += '<div class="desc">' + 任务.描述 + '</div>';
                    html += '<div class="desc">进度: ' + 任务.进度 + '/' + 任务.目标 + '</div>';
                    html += '<div class="quest-progress"><div class="quest-progress-fill" style="width:' + (任务.进度 / 任务.目标 * 100) + '%"></div></div>';
                    html += '<div class="desc">奖励: 经验' + 任务.奖励经验 + ' 货币' + 任务.奖励货币 + '</div>';
                    html += '</div>';
                    html += '<div class="item-actions">';
                    if (任务.进度 >= 任务.目标) {
                        html += '<button class="btn btn-success" onclick="提交任务(\'' + 任务.名称 + '\')">提交</button>';
                    }
                    html += '</div></div>';
                });
            }
            html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
        }
    });
}

function 提交任务(任务名) {
    发送请求('api/quest.php', {动作: '提交任务', 任务名: 任务名}, function(result) {
        if (result.成功) {
            alert(result.消息);
            刷新玩家信息();
            显示任务();
        } else {
            alert(result.消息);
        }
    });
}

function 显示系统商店() {
    发送请求('api/shop.php', {动作: '获取商店物品', 商店名: '系统商店'}, function(result) {
        if (result.成功) {
            显示商店界面(result.数据.商店名, result.数据.物品列表);
        }
    });
}

function 显示商店界面(商店名, 物品列表) {
    var html = '<h2>' + 商店名 + '</h2>';
    html += '<div style="margin-bottom:10px;color:#ffd700;">当前货币: <span id="商店货币">' + 玩家数据.货币 + '</span></div>';
    物品列表.forEach(function(物品) {
        html += '<div class="shop-item">';
        html += '<div class="item-info">';
        html += '<div class="name">' + 物品.名称 + '</div>';
        html += '<div class="desc">' + 物品.描述 + ' | 类型:' + 物品.类型 + ' | 等级:' + 物品.等级 + '</div>';
        html += '</div>';
        html += '<div class="item-actions">';
        html += '<span style="color:#ffd700;margin-right:10px;">' + 物品.价格 + '币</span>';
        html += '<button class="btn btn-success" onclick="购买物品(\'' + 商店名 + '\',\'' + 物品.名称 + '\',' + 物品.价格 + ')">购买</button>';
        html += '</div></div>';
    });
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">关闭</button>';
    打开弹窗(html);
}

function 购买物品(商店名, 物品名, 价格) {
    var 数量 = prompt('购买数量:', '1');
    if (数量 && parseInt(数量) > 0) {
        发送请求('api/shop.php', {动作: '购买物品', 物品名: 物品名, 数量: parseInt(数量)}, function(result) {
            if (result.成功) {
                alert(result.消息);
                刷新玩家信息();
                玩家数据.货币 = result.数据.剩余货币;
                document.getElementById('商店货币').textContent = result.数据.剩余货币;
            } else {
                alert(result.消息);
            }
        });
    }
}

function 签到() {
    发送请求('api/signin.php', {动作: '签到'}, function(result) {
        if (result.成功) {
            alert(result.消息);
            刷新玩家信息();
        } else {
            alert(result.消息);
        }
    });
}

function 打开弹窗(内容) {
    document.getElementById('modal-body').innerHTML = 内容;
    document.getElementById('modal').style.display = 'block';
}

function 关闭弹窗() {
    document.getElementById('modal').style.display = 'none';
    if (战斗中) {
        战斗中 = false;
        发送请求('api/battle.php', {动作: '逃跑'}, function() {});
    }
}

function 退出登录() {
    if (confirm('确定要退出登录吗？')) {
        发送请求('api/auth.php', {动作: '退出登录'}, function(result) {
            window.location.href = 'login.html';
        });
    }
}

window.onclick = function(event) {
    var modal = document.getElementById('modal');
    if (event.target == modal) {
        关闭弹窗();
    }
}
