document.addEventListener('DOMContentLoaded', function() {
    var createCharForm = document.getElementById('createCharForm');
    if (createCharForm) {
        createCharForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var 角色名 = document.getElementById('角色名').value;
            var 性别 = document.getElementById('性别').value;
            var 门派 = document.getElementById('门派').value;
            
            发送请求('api/character.php', {
                动作: '创建角色',
                角色名: 角色名,
                性别: 性别,
                门派: 门派
            }, function(result) {
                if (result.成功) {
                    显示消息('message', result.消息, 'success');
                    setTimeout(function() {
                        window.location.href = 'game.php';
                    }, 1500);
                } else {
                    显示消息('message', result.消息, 'error');
                }
            });
        });
    }
});

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
