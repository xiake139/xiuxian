<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>修仙世界 - 创建角色</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <div class="auth-box">
            <h1>修仙世界</h1>
            <h2>创建角色</h2>
            <form id="createCharForm">
                <div class="form-group">
                    <label>角色名</label>
                    <input type="text" id="角色名" required>
                </div>
                <div class="form-group">
                    <label>性别</label>
                    <select id="性别">
                        <option value="男">男</option>
                        <option value="女">女</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>门派</label>
                    <select id="门派">
                        <option value="青云派">青云派</option>
                        <option value="天音寺">天音寺</option>
                        <option value="合欢派">合欢派</option>
                        <option value="鬼王宗">鬼王宗</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">创建角色</button>
            </form>
            <div id="message" class="message"></div>
        </div>
    </div>
    <script src="js/character.js"></script>
</body>
</html>
