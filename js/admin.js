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
    
    document.getElementById('用户管理面板').style.display = 'none';
    document.getElementById('配置管理面板').style.display = 'none';
    
    if (标签名 == '用户管理') {
        document.getElementById('用户管理面板').style.display = 'block';
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
            html += '<button class="btn btn-primary" onclick="关闭弹窗()">关闭</button>';
            打开弹窗(html);
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
    html += '<button class="btn btn-primary" style="margin-top:15px;" onclick="关闭弹窗()">取消</button>';
    打开弹窗(html);
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
            关闭弹窗();
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

function 打开弹窗(内容) {
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
