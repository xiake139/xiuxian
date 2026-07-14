<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>修仙世界</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="game-container">
        <div class="main-content">
            <div class="map-area">
                <h2 id="地图名">青云村</h2>
                <p id="地图描述"></p>
                
                <div class="map-section">
                    <h3>NPC</h3>
                    <div id="NPC列表" class="item-list"></div>
                </div>
                
                <div class="map-section">
                    <h3>怪物</h3>
                    <div id="怪物列表" class="item-list"></div>
                </div>
                
                <div class="map-section">
                    <h3>玩家</h3>
                    <div id="玩家列表" class="item-list"></div>
                </div>
                
                <div class="map-nav">
                    <button id="方向-左" class="btn nav-btn" onclick="移动('左')">← 左</button>
                    <div class="nav-middle">
                        <button id="方向-前" class="btn nav-btn" onclick="移动('前')">↑ 前</button>
                        <button id="方向-后" class="btn nav-btn" onclick="移动('后')">↓ 后</button>
                    </div>
                    <button id="方向-右" class="btn nav-btn" onclick="移动('右')">右 →</button>
                </div>
            </div>
            
            <div class="side-panel">
                <div class="menu">
                    <button class="menu-btn" onclick="显示面板('状态')">状态</button>
                    <button class="menu-btn" onclick="显示面板('背包')">背包</button>
                    <button class="menu-btn" onclick="显示面板('装备')">装备</button>
                    <button class="menu-btn" onclick="显示面板('技能')">技能</button>
                    <button class="menu-btn" onclick="显示面板('任务')">任务</button>
                    <button class="menu-btn" onclick="显示面板('商店')">系统商店</button>
                    <button class="menu-btn" onclick="签到()">签到</button>
                    <button class="menu-btn" onclick="刷新地图()">刷新</button>
                    <button class="menu-btn" onclick="退出登录()" style="background:rgba(255,68,68,0.2);border-color:rgba(255,68,68,0.5);color:#ff4444;">退出</button>
                </div>
            </div>
        </div>
        
        <div id="modal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="关闭弹窗()">&times;</span>
                <div id="modal-body"></div>
            </div>
        </div>
    </div>
    
    <script src="js/game.js"></script>
</body>
</html>
