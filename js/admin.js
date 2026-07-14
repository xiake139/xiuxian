var 已登录管理员 = false;

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
        callback({成功: false, 消息: '网络错误'});
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var 管理员账号 = document.getElementById('管理员账号').value;
            var 管理员密码 = document.getElementById('管理员密码').value;
            
            发送请求('api/admin.php', {
                动作: '管理员登录',
                管理员账号: 管理员账号,
                管理员密码: 管理员密码
            }, function(result) {
                if (result.成功) {
                    已登录管理员 = true;
                    document.getElementById('login-section').style.display = 'none';
                    document.getElementById('admin-panel').style.display = 'block';
                    获取用户列表();
                    获取地图列表();
                    获取怪物列表();
                    获取物品列表();
                    获取NPC列表();
                    获取技能列表();
                    获取任务列表();
                    获取商店列表();
                    获取配置文件列表();
                } else {
                    显示消息('admin-message', result.消息, 'error');
                }
            });
        });
    }
});

function 显示消息(元素ID, 消息, 类型) {
    var msgElement = document.getElementById(元素ID);
    msgElement.textContent = 消息;
    msgElement.className = 'message ' + 类型;
    setTimeout(function() {
        msgElement.className = 'message';
    }, 3000);
}

function 切换标签(标签名) {
    var tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    var panels = ['用户管理面板', '地图管理面板', '怪物管理面板', '物品管理面板', 'NPC管理面板', '技能管理面板', '任务管理面板', '商店管理面板', '配置管理面板'];
    panels.forEach(function(panel) {
        document.getElementById(panel).style.display = 'none';
    });
    
    if (标签名 == '用户管理') {
        document.getElementById('用户管理面板').style.display = 'block';
        获取用户列表();
    } else if (标签名 == '地图管理') {
        document.getElementById('地图管理面板').style.display = 'block';
        获取地图列表();
    } else if (标签名 == '怪物管理') {
        document.getElementById('怪物管理面板').style.display = 'block';
        获取怪物列表();
    } else if (标签名 == '物品管理') {
        document.getElementById('物品管理面板').style.display = 'block';
        获取物品列表();
    } else if (标签名 == 'NPC管理') {
        document.getElementById('NPC管理面板').style.display = 'block';
        获取NPC列表();
    } else if (标签名 == '技能管理') {
        document.getElementById('技能管理面板').style.display = 'block';
        获取技能列表();
    } else if (标签名 == '任务管理') {
        document.getElementById('任务管理面板').style.display = 'block';
        获取任务列表();
    } else if (标签名 == '商店管理') {
        document.getElementById('商店管理面板').style.display = 'block';
        获取商店列表();
    } else if (标签名 == '配置管理') {
        document.getElementById('配置管理面板').style.display = 'block';
    }
}

function 获取用户列表() {
    发送请求('api/admin.php', {动作: '获取所有用户'}, function(result) {
        if (result.成功) {
            var html = '';
            result.数据.forEach(function(用户) {
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 用户.用户名 + '</div>';
                html += '<div class="details">角色: ' + 用户.角色名 + ' | 等级: ' + 用户.等级 + ' | 已创建角色: ' + 用户.是否已创建角色 + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看用户数据(\'' + 用户.用户名 + '\')">查看</button>';
                html += '<button class="btn btn-success" onclick="编辑用户数据(\'' + 用户.用户名 + '\')">编辑</button>';
                html += '<button class="btn btn-danger" onclick="重置用户(\'' + 用户.用户名 + '\')">重置</button>';
                html += '<button class="btn btn-danger" onclick="删除用户(\'' + 用户.用户名 + '\')">删除</button>';
                html += '</div></div>';
            });
            document.getElementById('用户列表').innerHTML = html;
        }
    });
}

function 查看用户数据(用户名) {
    发送请求('api/admin.php', {动作: '读取用户数据', 用户名: 用户名}, function(result) {
        if (result.成功) {
            var html = '<h2>' + 用户名 + ' - 数据详情</h2>';
            for (var 节 in result.数据) {
                html += '<div class="section-block">';
                html += '<h4>[' + 节 + ']</h4>';
                for (var 键 in result.数据[节]) {
                    html += '<div class="key-value-row">';
                    html += '<span class="key">' + 键 + '</span>';
                    html += '<span class="value">' + result.数据[节][键] + '</span>';
                    html += '</div>';
                }
                html += '</div>';
            }
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 编辑用户数据(用户名) {
    var html = '<h2>编辑 ' + 用户名 + ' 的数据</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>节 (如: 角色、背包、装备等)</label>';
    html += '<input type="text" id="编辑节" placeholder="例如: 角色"></div>';
    html += '<div class="form-group"><label>键</label>';
    html += '<input type="text" id="编辑键" placeholder="例如: 等级"></div>';
    html += '<div class="form-group"><label>值</label>';
    html += '<input type="text" id="编辑值" placeholder="例如: 10"></div>';
    html += '<button class="btn btn-success" onclick="执行编辑用户(\'' + 用户名 + '\')">确认修改</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行编辑用户(用户名) {
    var 节 = document.getElementById('编辑节').value;
    var 键 = document.getElementById('编辑键').value;
    var 值 = document.getElementById('编辑值').value;
    
    if (!节 || !键) {
        alert('节和键不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '写入用户数据',
        用户名: 用户名,
        节: 节,
        键: 键,
        值: 值
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取用户列表();
        } else {
            alert(result.消息);
        }
    });
}

function 重置用户(用户名) {
    if (confirm('确定要重置 ' + 用户名 + ' 的所有数据吗？此操作不可恢复！')) {
        发送请求('api/admin.php', {动作: '重置用户数据', 用户名: 用户名}, function(result) {
            if (result.成功) {
                alert(result.消息);
                获取用户列表();
            } else {
                alert(result.消息);
            }
        });
    }
}

function 删除用户(用户名) {
    if (confirm('确定要删除用户 ' + 用户名 + ' 吗？此操作不可恢复！')) {
        发送请求('api/admin.php', {动作: '删除用户', 用户名: 用户名}, function(result) {
            if (result.成功) {
                alert(result.消息);
                获取用户列表();
            } else {
                alert(result.消息);
            }
        });
    }
}

function 显示添加用户表单() {
    var html = '<h2>添加用户</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>用户名</label><input type="text" id="新用户名" required></div>';
    html += '<div class="form-group"><label>密码</label><input type="password" id="新密码" required></div>';
    html += '<button class="btn btn-success" onclick="执行添加用户()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加用户() {
    var 用户名 = document.getElementById('新用户名').value;
    var 密码 = document.getElementById('新密码').value;
    
    if (!用户名 || !密码) {
        alert('用户名和密码不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加用户',
        用户名: 用户名,
        密码: 密码
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取用户列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取地图列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '地图配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var 地图名 in result.数据) {
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 地图名 + '</div>';
                html += '<div class="details">描述: ' + result.数据[地图名]['描述'] + ' | 坐标: ' + (result.数据[地图名]['坐标'] || '未设置') + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看地图详情(\'' + 地图名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('地图列表').innerHTML = html;
        }
    });
}

function 查看地图详情(地图名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '地图配置'}, function(result) {
        if (result.成功 && result.数据[地图名]) {
            var 地图 = result.数据[地图名];
            var html = '<h2>' + 地图名 + ' - 地图详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">描述</span><span class="value">' + 地图['描述'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">NPC</span><span class="value">' + (地图['NPC'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">怪物</span><span class="value">' + (地图['怪物'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">前</span><span class="value">' + (地图['前'] || '不可通行') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">后</span><span class="value">' + (地图['后'] || '不可通行') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">左</span><span class="value">' + (地图['左'] || '不可通行') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">右</span><span class="value">' + (地图['右'] || '不可通行') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">坐标</span><span class="value">' + (地图['坐标'] || '未设置') + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加地图表单() {
    var html = '<h2>添加地图</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>地图名</label><input type="text" id="新地图名" required></div>';
    html += '<div class="form-group"><label>描述</label><textarea id="新地图描述" required></textarea></div>';
    html += '<div class="form-group"><label>NPC (多个用逗号分隔)</label><input type="text" id="新地图NPC"></div>';
    html += '<div class="form-group"><label>怪物 (多个用逗号分隔)</label><input type="text" id="新地图怪物"></div>';
    html += '<div class="form-group"><label>前 (连接的地图名)</label><input type="text" id="新地图前"></div>';
    html += '<div class="form-group"><label>后 (连接的地图名)</label><input type="text" id="新地图后"></div>';
    html += '<div class="form-group"><label>左 (连接的地图名)</label><input type="text" id="新地图左"></div>';
    html += '<div class="form-group"><label>右 (连接的地图名)</label><input type="text" id="新地图右"></div>';
    html += '<button class="btn btn-success" onclick="执行添加地图()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加地图() {
    var 地图名 = document.getElementById('新地图名').value;
    var 描述 = document.getElementById('新地图描述').value;
    var NPC = document.getElementById('新地图NPC').value;
    var 怪物 = document.getElementById('新地图怪物').value;
    var 前 = document.getElementById('新地图前').value;
    var 后 = document.getElementById('新地图后').value;
    var 左 = document.getElementById('新地图左').value;
    var 右 = document.getElementById('新地图右').value;
    
    if (!地图名 || !描述) {
        alert('地图名和描述不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加地图',
        地图名: 地图名,
        描述: 描述,
        NPC: NPC,
        怪物: 怪物,
        前: 前,
        后: 后,
        左: 左,
        右: 右
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取地图列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取怪物列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '怪物配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var 怪物名 in result.数据) {
                var 怪物 = result.数据[怪物名];
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 怪物名 + '</div>';
                html += '<div class="details">等级: ' + 怪物['等级'] + ' | 生命: ' + 怪物['生命'] + ' | 攻击: ' + 怪物['攻击'] + ' | 防御: ' + 怪物['防御'] + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看怪物详情(\'' + 怪物名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('怪物列表').innerHTML = html;
        }
    });
}

function 查看怪物详情(怪物名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '怪物配置'}, function(result) {
        if (result.成功 && result.数据[怪物名]) {
            var 怪物 = result.数据[怪物名];
            var html = '<h2>' + 怪物名 + ' - 怪物详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">描述</span><span class="value">' + 怪物['描述'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">等级</span><span class="value">' + 怪物['等级'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">生命</span><span class="value">' + 怪物['生命'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">攻击</span><span class="value">' + 怪物['攻击'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">防御</span><span class="value">' + 怪物['防御'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">经验奖励</span><span class="value">' + 怪物['经验奖励'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">货币奖励</span><span class="value">' + 怪物['货币奖励'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">掉落物品</span><span class="value">' + (怪物['掉落物品'] || '无') + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加怪物表单() {
    var html = '<h2>添加怪物</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>怪物名</label><input type="text" id="新怪物名" required></div>';
    html += '<div class="form-group"><label>描述</label><input type="text" id="新怪物描述" required></div>';
    html += '<div class="form-group"><label>等级</label><input type="number" id="新怪物等级" value="1" min="1"></div>';
    html += '<div class="form-group"><label>生命</label><input type="number" id="新怪物生命" value="50" min="1"></div>';
    html += '<div class="form-group"><label>攻击</label><input type="number" id="新怪物攻击" value="5" min="1"></div>';
    html += '<div class="form-group"><label>防御</label><input type="number" id="新怪物防御" value="2" min="0"></div>';
    html += '<div class="form-group"><label>经验奖励</label><input type="number" id="新怪物经验奖励" value="10" min="1"></div>';
    html += '<div class="form-group"><label>货币奖励</label><input type="number" id="新怪物货币奖励" value="5" min="1"></div>';
    html += '<div class="form-group"><label>掉落物品 (格式: 物品名:数量范围:掉落率,如:兔毛:1-3:80)</label><input type="text" id="新怪物掉落"></div>';
    html += '<button class="btn btn-success" onclick="执行添加怪物()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加怪物() {
    var 怪物名 = document.getElementById('新怪物名').value;
    var 描述 = document.getElementById('新怪物描述').value;
    var 等级 = document.getElementById('新怪物等级').value;
    var 生命 = document.getElementById('新怪物生命').value;
    var 攻击 = document.getElementById('新怪物攻击').value;
    var 防御 = document.getElementById('新怪物防御').value;
    var 经验奖励 = document.getElementById('新怪物经验奖励').value;
    var 货币奖励 = document.getElementById('新怪物货币奖励').value;
    var 掉落物品 = document.getElementById('新怪物掉落').value;
    
    if (!怪物名 || !描述) {
        alert('怪物名和描述不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加怪物',
        怪物名: 怪物名,
        描述: 描述,
        等级: 等级,
        生命: 生命,
        攻击: 攻击,
        防御: 防御,
        经验奖励: 经验奖励,
        货币奖励: 货币奖励,
        掉落物品: 掉落物品
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取怪物列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取物品列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '物品配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var 物品名 in result.数据) {
                var 物品 = result.数据[物品名];
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 物品名 + '</div>';
                html += '<div class="details">类型: ' + 物品['类型'] + ' | 等级: ' + 物品['等级'] + ' | 价格: ' + 物品['价格'] + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看物品详情(\'' + 物品名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('物品列表').innerHTML = html;
        }
    });
}

function 查看物品详情(物品名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '物品配置'}, function(result) {
        if (result.成功 && result.数据[物品名]) {
            var 物品 = result.数据[物品名];
            var html = '<h2>' + 物品名 + ' - 物品详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">描述</span><span class="value">' + 物品['描述'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">类型</span><span class="value">' + 物品['类型'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">等级</span><span class="value">' + 物品['等级'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">攻击</span><span class="value">' + 物品['攻击'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">防御</span><span class="value">' + 物品['防御'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">生命</span><span class="value">' + 物品['生命'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">灵力</span><span class="value">' + 物品['灵力'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">恢复生命</span><span class="value">' + 物品['恢复生命'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">恢复灵力</span><span class="value">' + 物品['恢复灵力'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">价格</span><span class="value">' + 物品['价格'] + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加物品表单() {
    var html = '<h2>添加物品</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>物品名</label><input type="text" id="新物品名" required></div>';
    html += '<div class="form-group"><label>描述</label><input type="text" id="新物品描述" required></div>';
    html += '<div class="form-group"><label>类型</label>';
    html += '<select id="新物品类型">';
    html += '<option value="武器">武器</option><option value="防具">防具</option><option value="饰品">饰品</option>';
    html += '<option value="药品">药品</option><option value="丹药">丹药</option><option value="材料">材料</option>';
    html += '</select></div>';
    html += '<div class="form-group"><label>等级</label><input type="number" id="新物品等级" value="1" min="1"></div>';
    html += '<div class="form-group"><label>攻击</label><input type="number" id="新物品攻击" value="0" min="0"></div>';
    html += '<div class="form-group"><label>防御</label><input type="number" id="新物品防御" value="0" min="0"></div>';
    html += '<div class="form-group"><label>生命</label><input type="number" id="新物品生命" value="0" min="0"></div>';
    html += '<div class="form-group"><label>灵力</label><input type="number" id="新物品灵力" value="0" min="0"></div>';
    html += '<div class="form-group"><label>恢复生命</label><input type="number" id="新物品恢复生命" value="0" min="0"></div>';
    html += '<div class="form-group"><label>恢复灵力</label><input type="number" id="新物品恢复灵力" value="0" min="0"></div>';
    html += '<div class="form-group"><label>价格</label><input type="number" id="新物品价格" value="0" min="0"></div>';
    html += '<button class="btn btn-success" onclick="执行添加物品()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加物品() {
    var 物品名 = document.getElementById('新物品名').value;
    var 描述 = document.getElementById('新物品描述').value;
    var 类型 = document.getElementById('新物品类型').value;
    var 等级 = document.getElementById('新物品等级').value;
    var 攻击 = document.getElementById('新物品攻击').value;
    var 防御 = document.getElementById('新物品防御').value;
    var 生命 = document.getElementById('新物品生命').value;
    var 灵力 = document.getElementById('新物品灵力').value;
    var 恢复生命 = document.getElementById('新物品恢复生命').value;
    var 恢复灵力 = document.getElementById('新物品恢复灵力').value;
    var 价格 = document.getElementById('新物品价格').value;
    
    if (!物品名 || !类型 || !描述) {
        alert('物品名、类型和描述不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加物品',
        物品名: 物品名,
        描述: 描述,
        类型: 类型,
        等级: 等级,
        攻击: 攻击,
        防御: 防御,
        生命: 生命,
        灵力: 灵力,
        恢复生命: 恢复生命,
        恢复灵力: 恢复灵力,
        价格: 价格
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取物品列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取NPC列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: 'NPC配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var NPC名 in result.数据) {
                var NPC = result.数据[NPC名];
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + NPC名 + '</div>';
                html += '<div class="details">描述: ' + NPC['描述'] + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看NPC详情(\'' + NPC名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('NPC列表').innerHTML = html;
        }
    });
}

function 查看NPC详情(NPC名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: 'NPC配置'}, function(result) {
        if (result.成功 && result.数据[NPC名]) {
            var NPC = result.数据[NPC名];
            var html = '<h2>' + NPC名 + ' - NPC详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">描述</span><span class="value">' + NPC['描述'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">对话</span><span class="value">' + (NPC['对话'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">商店</span><span class="value">' + (NPC['商店'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">任务</span><span class="value">' + (NPC['任务'] || '无') + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加NPC表单() {
    var html = '<h2>添加NPC</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>NPC名</label><input type="text" id="新NPC名" required></div>';
    html += '<div class="form-group"><label>描述</label><input type="text" id="新NPC描述" required></div>';
    html += '<div class="form-group"><label>对话</label><input type="text" id="新NPC对话"></div>';
    html += '<div class="form-group"><label>商店 (商店名)</label><input type="text" id="新NPC商店"></div>';
    html += '<div class="form-group"><label>任务 (任务名)</label><input type="text" id="新NPC任务"></div>';
    html += '<button class="btn btn-success" onclick="执行添加NPC()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加NPC() {
    var NPC名 = document.getElementById('新NPC名').value;
    var 描述 = document.getElementById('新NPC描述').value;
    var 对话 = document.getElementById('新NPC对话').value;
    var 商店 = document.getElementById('新NPC商店').value;
    var 任务 = document.getElementById('新NPC任务').value;
    
    if (!NPC名 || !描述) {
        alert('NPC名和描述不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加NPC',
        NPC名: NPC名,
        描述: 描述,
        对话: 对话,
        商店: 商店,
        任务: 任务
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取NPC列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取技能列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '技能配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var 技能名 in result.数据) {
                var 技能 = result.数据[技能名];
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 技能名 + '</div>';
                html += '<div class="details">类型: ' + 技能['类型'] + ' | 等级: ' + 技能['等级'] + ' | 学习等级: ' + 技能['学习等级'] + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看技能详情(\'' + 技能名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('技能列表').innerHTML = html;
        }
    });
}

function 查看技能详情(技能名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '技能配置'}, function(result) {
        if (result.成功 && result.数据[技能名]) {
            var 技能 = result.数据[技能名];
            var html = '<h2>' + 技能名 + ' - 技能详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">描述</span><span class="value">' + 技能['描述'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">类型</span><span class="value">' + 技能['类型'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">等级</span><span class="value">' + 技能['等级'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">消耗灵力</span><span class="value">' + 技能['消耗灵力'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">伤害倍率</span><span class="value">' + 技能['伤害倍率'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">效果</span><span class="value">' + (技能['效果'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">恢复生命</span><span class="value">' + 技能['恢复生命'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">恢复灵力</span><span class="value">' + 技能['恢复灵力'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">学习等级</span><span class="value">' + 技能['学习等级'] + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加技能表单() {
    var html = '<h2>添加技能</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>技能名</label><input type="text" id="新技能名" required></div>';
    html += '<div class="form-group"><label>描述</label><input type="text" id="新技能描述" required></div>';
    html += '<div class="form-group"><label>类型</label>';
    html += '<select id="新技能类型">';
    html += '<option value="攻击">攻击</option><option value="防御">防御</option><option value="恢复">恢复</option>';
    html += '</select></div>';
    html += '<div class="form-group"><label>等级</label><input type="number" id="新技能等级" value="1" min="1"></div>';
    html += '<div class="form-group"><label>消耗灵力</label><input type="number" id="新技能消耗灵力" value="0" min="0"></div>';
    html += '<div class="form-group"><label>伤害倍率</label><input type="number" id="新技能伤害倍率" value="1.0" step="0.1"></div>';
    html += '<div class="form-group"><label>效果</label><input type="text" id="新技能效果" placeholder="如: 增加50%防御，持续3回合"></div>';
    html += '<div class="form-group"><label>恢复生命</label><input type="number" id="新技能恢复生命" value="0" min="0"></div>';
    html += '<div class="form-group"><label>恢复灵力</label><input type="number" id="新技能恢复灵力" value="0" min="0"></div>';
    html += '<div class="form-group"><label>学习等级</label><input type="number" id="新技能学习等级" value="1" min="1"></div>';
    html += '<button class="btn btn-success" onclick="执行添加技能()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加技能() {
    var 技能名 = document.getElementById('新技能名').value;
    var 描述 = document.getElementById('新技能描述').value;
    var 类型 = document.getElementById('新技能类型').value;
    var 等级 = document.getElementById('新技能等级').value;
    var 消耗灵力 = document.getElementById('新技能消耗灵力').value;
    var 伤害倍率 = document.getElementById('新技能伤害倍率').value;
    var 效果 = document.getElementById('新技能效果').value;
    var 恢复生命 = document.getElementById('新技能恢复生命').value;
    var 恢复灵力 = document.getElementById('新技能恢复灵力').value;
    var 学习等级 = document.getElementById('新技能学习等级').value;
    
    if (!技能名 || !类型 || !描述) {
        alert('技能名、类型和描述不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加技能',
        技能名: 技能名,
        描述: 描述,
        类型: 类型,
        等级: 等级,
        消耗灵力: 消耗灵力,
        伤害倍率: 伤害倍率,
        效果: 效果,
        恢复生命: 恢复生命,
        恢复灵力: 恢复灵力,
        学习等级: 学习等级
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取技能列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取任务列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '任务配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var 任务名 in result.数据) {
                var 任务 = result.数据[任务名];
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 任务名 + '</div>';
                html += '<div class="details">NPC: ' + 任务['NPC'] + ' | 类型: ' + 任务['类型'] + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看任务详情(\'' + 任务名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('任务列表').innerHTML = html;
        }
    });
}

function 查看任务详情(任务名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '任务配置'}, function(result) {
        if (result.成功 && result.数据[任务名]) {
            var 任务 = result.数据[任务名];
            var html = '<h2>' + 任务名 + ' - 任务详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">描述</span><span class="value">' + 任务['描述'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">NPC</span><span class="value">' + 任务['NPC'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">类型</span><span class="value">' + 任务['类型'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">目标怪物</span><span class="value">' + (任务['目标怪物'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">目标数量</span><span class="value">' + 任务['目标数量'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">目标物品</span><span class="value">' + (任务['目标物品'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">奖励经验</span><span class="value">' + 任务['奖励经验'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">奖励货币</span><span class="value">' + 任务['奖励货币'] + '</span></div>';
            html += '<div class="key-value-row"><span class="key">奖励物品</span><span class="value">' + (任务['奖励物品'] || '无') + '</span></div>';
            html += '<div class="key-value-row"><span class="key">奖励物品数量</span><span class="value">' + 任务['奖励物品数量'] + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加任务表单() {
    var html = '<h2>添加任务</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>任务名</label><input type="text" id="新任务名" required></div>';
    html += '<div class="form-group"><label>描述</label><input type="text" id="新任务描述" required></div>';
    html += '<div class="form-group"><label>NPC</label><input type="text" id="新任务NPC"></div>';
    html += '<div class="form-group"><label>类型</label>';
    html += '<select id="新任务类型">';
    html += '<option value="杀怪">杀怪</option><option value="收集">收集</option><option value="杀怪多目标">杀怪多目标</option>';
    html += '</select></div>';
    html += '<div class="form-group"><label>目标怪物</label><input type="text" id="新任务目标怪物" placeholder="如: 野兔"></div>';
    html += '<div class="form-group"><label>目标数量</label><input type="number" id="新任务目标数量" value="0" min="0"></div>';
    html += '<div class="form-group"><label>目标物品</label><input type="text" id="新任务目标物品" placeholder="如: 花瓣"></div>';
    html += '<div class="form-group"><label>奖励经验</label><input type="number" id="新任务奖励经验" value="0" min="0"></div>';
    html += '<div class="form-group"><label>奖励货币</label><input type="number" id="新任务奖励货币" value="0" min="0"></div>';
    html += '<div class="form-group"><label>奖励物品</label><input type="text" id="新任务奖励物品"></div>';
    html += '<div class="form-group"><label>奖励物品数量</label><input type="number" id="新任务奖励物品数量" value="0" min="0"></div>';
    html += '<button class="btn btn-success" onclick="执行添加任务()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加任务() {
    var 任务名 = document.getElementById('新任务名').value;
    var 描述 = document.getElementById('新任务描述').value;
    var NPC = document.getElementById('新任务NPC').value;
    var 类型 = document.getElementById('新任务类型').value;
    var 目标怪物 = document.getElementById('新任务目标怪物').value;
    var 目标数量 = document.getElementById('新任务目标数量').value;
    var 目标物品 = document.getElementById('新任务目标物品').value;
    var 奖励经验 = document.getElementById('新任务奖励经验').value;
    var 奖励货币 = document.getElementById('新任务奖励货币').value;
    var 奖励物品 = document.getElementById('新任务奖励物品').value;
    var 奖励物品数量 = document.getElementById('新任务奖励物品数量').value;
    
    if (!任务名 || !描述 || !类型) {
        alert('任务名、描述和类型不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加任务',
        任务名: 任务名,
        描述: 描述,
        NPC: NPC,
        类型: 类型,
        目标怪物: 目标怪物,
        目标数量: 目标数量,
        目标物品: 目标物品,
        奖励经验: 奖励经验,
        奖励货币: 奖励货币,
        奖励物品: 奖励物品,
        奖励物品数量: 奖励物品数量
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取任务列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取商店列表() {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '商店配置'}, function(result) {
        if (result.成功) {
            var html = '';
            for (var 商店名 in result.数据) {
                var 商店 = result.数据[商店名];
                html += '<div class="user-item">';
                html += '<div class="user-info">';
                html += '<div class="username">' + 商店名 + '</div>';
                html += '<div class="details">物品: ' + (商店['物品'] || '无') + '</div>';
                html += '</div>';
                html += '<div class="user-actions">';
                html += '<button class="btn btn-primary" onclick="查看商店详情(\'' + 商店名 + '\')">详情</button>';
                html += '</div></div>';
            }
            document.getElementById('商店列表').innerHTML = html;
        }
    });
}

function 查看商店详情(商店名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: '商店配置'}, function(result) {
        if (result.成功 && result.数据[商店名]) {
            var 商店 = result.数据[商店名];
            var html = '<h2>' + 商店名 + ' - 商店详情</h2>';
            html += '<div class="section-block">';
            html += '<div class="key-value-row"><span class="key">物品</span><span class="value">' + (商店['物品'] || '无') + '</span></div>';
            html += '</div>';
            html += '<button class="btn btn-primary" onclick="关闭管理员弹窗()">关闭</button>';
            打开管理员弹窗(html);
        }
    });
}

function 显示添加商店表单() {
    var html = '<h2>添加商店</h2>';
    html += '<div class="gift-form">';
    html += '<div class="form-group"><label>商店名</label><input type="text" id="新商店名" required></div>';
    html += '<div class="form-group"><label>物品 (多个用逗号分隔)</label><input type="text" id="新商店物品"></div>';
    html += '<button class="btn btn-success" onclick="执行添加商店()">确认添加</button>';
    html += '</div>';
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭管理员弹窗()">取消</button>';
    打开管理员弹窗(html);
}

function 执行添加商店() {
    var 商店名 = document.getElementById('新商店名').value;
    var 物品 = document.getElementById('新商店物品').value;
    
    if (!商店名) {
        alert('商店名不能为空');
        return;
    }
    
    发送请求('api/admin.php', {
        动作: '添加商店',
        商店名: 商店名,
        物品: 物品
    }, function(result) {
        if (result.成功) {
            alert(result.消息);
            关闭管理员弹窗();
            获取商店列表();
        } else {
            alert(result.消息);
        }
    });
}

function 获取配置文件列表() {
    发送请求('api/admin.php', {动作: '获取所有配置文件'}, function(result) {
        if (result.成功) {
            var html = '';
            result.数据.forEach(function(配置文件) {
                html += '<div class="config-item" onclick="查看配置文件(\'' + 配置文件 + '\')">' + 配置文件 + '.ini</div>';
            });
            document.getElementById('配置文件列表').innerHTML = html;
        }
    });
}

function 查看配置文件(配置文件名) {
    发送请求('api/admin.php', {动作: '读取配置文件', 配置文件名: 配置文件名}, function(result) {
        if (result.成功) {
            document.getElementById('当前配置文件名').textContent = 配置文件名 + '.ini';
            document.getElementById('配置内容').style.display = 'block';
            
            var html = '';
            for (var 节 in result.数据) {
                html += '<div class="section-block">';
                html += '<h4>[' + 节 + '] <button class="edit-btn" onclick="编辑配置项(\'' + 配置文件名 + '\',\'' + 节 + '\')">添加/编辑</button></h4>';
                for (var 键 in result.数据[节]) {
                    html += '<div class="key-value-row">';
                    html += '<span class="key">' + 键 + '</span>';
                    html += '<span class="value">' + result.数据[节][键] + '</span>';
                    html += '<button class="edit-btn" onclick="编辑配置值(\'' + 配置文件名 + '\',\'' + 节 + '\',\'' + 键 + '\',\'' + result.数据[节][键] + '\')">编辑</button>';
                    html += '</div>';
                }
                html += '</div>';
            }
            document.getElementById('配置节列表').innerHTML = html;
        }
    });
}

function 编辑配置值(配置文件名, 节, 键, 当前值) {
    var 新值 = prompt('修改 ' + 键 + ' 的值:', 当前值);
    if (新值 !== null) {
        发送请求('api/admin.php', {
            动作: '写入配置文件',
            配置文件名: 配置文件名,
            节: 节,
            键: 键,
            值: 新值
        }, function(result) {
            if (result.成功) {
                alert(result.消息);
                查看配置文件(配置文件名);
            } else {
                alert(result.消息);
            }
        });
    }
}

function 编辑配置项(配置文件名, 节) {
    var 键 = prompt('输入键名:');
    if (键 !== null && 键 !== '') {
        var 值 = prompt('输入值:');
        if (值 !== null) {
            发送请求('api/admin.php', {
                动作: '写入配置文件',
                配置文件名: 配置文件名,
                节: 节,
                键: 键,
                值: 值
            }, function(result) {
                if (result.成功) {
                    alert(result.消息);
                    查看配置文件(配置文件名);
                } else {
                    alert(result.消息);
                }
            });
        }
    }
}

function 重置所有数据() {
    if (confirm('确定要重置所有用户数据吗？此操作不可恢复！所有用户数据将被删除！')) {
        if (confirm('再次确认：真的要删除所有用户数据吗？')) {
            发送请求('api/admin.php', {动作: '重置所有数据'}, function(result) {
                if (result.成功) {
                    alert(result.消息);
                    获取用户列表();
                } else {
                    alert(result.消息);
                }
            });
        }
    }
}

function 退出管理员() {
    if (confirm('确定要退出管理员吗？')) {
        已登录管理员 = false;
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('管理员账号').value = '';
        document.getElementById('管理员密码').value = '';
    }
}

function 打开管理员弹窗(内容) {
    var modalHtml = '<div id="admin-modal" class="modal" style="display:block;">';
    modalHtml += '<div class="modal-content">';
    modalHtml += '<span class="close" onclick="关闭管理员弹窗()">&times;</span>';
    modalHtml += '<div id="admin-modal-body">' + 内容 + '</div>';
    modalHtml += '</div></div>';
    
    var oldModal = document.getElementById('admin-modal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function 关闭管理员弹窗() {
    var modal = document.getElementById('admin-modal');
    if (modal) modal.remove();
}

window.addEventListener('click', function(event) {
    var modal = document.getElementById('admin-modal');
    if (modal && event.target == modal) {
        关闭管理员弹窗();
    }
});
