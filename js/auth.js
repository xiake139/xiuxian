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

function 显示消息(元素ID, 消息, 类型) {
    var msgElement = document.getElementById(元素ID);
    msgElement.textContent = 消息;
    msgElement.className = 'message ' + 类型;
}

document.addEventListener('DOMContentLoaded', function() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var 用户名 = document.getElementById('用户名').value;
            var 密码 = document.getElementById('密码').value;
            
            发送请求('api/auth.php', {
                动作: '登录',
                用户名: 用户名,
                密码: 密码
            }, function(result) {
                if (result.成功) {
                    显示消息('message', result.消息, 'success');
                    setTimeout(function() {
                        window.location.href = 'index.php';
                    }, 1000);
                } else {
                    显示消息('message', result.消息, 'error');
                }
            });
        });
    }
    
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var 用户名 = document.getElementById('用户名').value;
            var 密码 = document.getElementById('密码').value;
            var 确认密码 = document.getElementById('确认密码').value;
            
            发送请求('api/auth.php', {
                动作: '注册',
                用户名: 用户名,
                密码: 密码,
                确认密码: 确认密码
            }, function(result) {
                if (result.成功) {
                    显示消息('message', result.消息, 'success');
                    setTimeout(function() {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    显示消息('message', result.消息, 'error');
                }
            });
        });
    }
});
