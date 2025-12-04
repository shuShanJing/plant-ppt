// script.js - 完全重写，确保正确的加载顺序
console.log('📜 script.js开始执行');

// ===== 1. 加载状态管理 =====
const dependencies = {
    THREE: false,
    Reveal: false,
    OrbitControls: false
};

// ===== 2. 检查并加载依赖 =====

// 检查THREE是否已加载
function checkThree() {
    if (typeof THREE !== 'undefined') {
        console.log('✅ THREE已加载');
        dependencies.THREE = true;
        
        // 检查OrbitControls是否已附加到THREE
        if (typeof THREE.OrbitControls !== 'undefined') {
            console.log('✅ OrbitControls已加载');
            dependencies.OrbitControls = true;
        } else {
            console.warn('⚠️ OrbitControls未附加到THREE，可能需要手动加载');
            // 尝试加载OrbitControls
            loadOrbitControls();
        }
        
        checkAllDependencies();
    } else {
        console.warn('⚠️ THREE未定义，等待中...');
        setTimeout(checkThree, 100);
    }
}

// 加载OrbitControls
function loadOrbitControls() {
    console.log('📦 正在加载OrbitControls...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/controls/OrbitControls.min.js';
    script.onload = function() {
        console.log('✅ OrbitControls加载完成');
        dependencies.OrbitControls = true;
        checkAllDependencies();
    };
    script.onerror = function() {
        console.error('❌ OrbitControls加载失败');
    };
    document.head.appendChild(script);
}

// 检查Reveal.js
function checkReveal() {
    if (typeof Reveal !== 'undefined') {
        console.log('✅ Reveal.js已加载');
        dependencies.Reveal = true;
        initRevealJS();
        checkAllDependencies();
    } else {
        console.warn('⚠️ 等待Reveal.js加载...');
        setTimeout(checkReveal, 100);
    }
}

// 检查所有依赖是否就绪
function checkAllDependencies() {
    if (dependencies.THREE && dependencies.Reveal) {
        console.log('🎉 所有核心依赖加载完成！');
        
        // 告诉earth.js可以开始初始化了
        window.earthReady = true;
        
        // 如果earth.js已经加载，触发它的初始化
        if (typeof window.onEarthReady === 'function') {
            window.onEarthReady();
        }
    }
}

// ===== 3. 初始化Reveal.js =====
function initRevealJS() {
    if (window.revealInitialized) return;
    
    try {
        Reveal.initialize({
            hash: true,
            transition: 'convex',
            plugins: [RevealNotes, RevealMarkdown, RevealHighlight],
            showNotes: false,
            showSlideNumber: 'all',
            // 确保fragments启用
            fragments:true,
        });
        
        window.revealInitialized = true;
        console.log('✅ Reveal.js初始化完成!');
        
        // 初始化音效系统
        initAudioSystem();
        
    } catch (error) {
        console.error('❌ Reveal.js初始化失败:', error);
    }
}


// ===== 4. 音效系统 =====
function initAudioSystem() {
    console.log('🔊 初始化音效系统...');
    
    const bgAudio = document.getElementById('bg-audio');
    const toggleBtn = document.getElementById('toggle-bg-audio');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeDisplay = document.getElementById('volume-display');
    
    if (!bgAudio || !toggleBtn) return;

    // 添加音频事件监听器
    bgAudio.addEventListener('loadeddata', function() {
        console.log('✅ 音频已加载完成');
    });

    bgAudio.addEventListener('error', function(e) {
        console.error('❌ 音频加载失败:', bgAudio.error);
        toggleBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        toggleBtn.title = '音频加载失败';
        toggleBtn.classList.add('disabled');
    });
    
    // 1. 设置初始状态
    bgAudio.volume = 0.3;
    bgAudio.muted = true; // 先静音，避免自动播放策略
    
    // 2. 标记用户是否已交互
    let userInteracted = false;
    
    // 3. 用户首次点击页面时启用音频
    function enableAudio() {
        if (userInteracted) return;
        
        userInteracted = true;
        bgAudio.muted = false;
        console.log('✅ 用户已交互，音频已启用');
        
        // 更新按钮状态为"可播放"
        toggleBtn.innerHTML = '<i class="fas fa-music"></i>';
        toggleBtn.title = '点击播放背景音乐';
        toggleBtn.classList.remove('disabled'); // 移除禁用状态
        
        // 移除事件监听器，避免重复触发
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
    }
    
    // 4. 监听用户交互
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    
    // 5. 播放/暂停按钮逻辑（最终修复版）
    toggleBtn.addEventListener('click', async function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('🔘 音频按钮点击，用户已交互:', userInteracted);
        
        // 用户交互检查
        if (!userInteracted) {
            console.log('⏳ 等待用户交互，先激活音频系统');
            enableAudio();
            return;
        }
        
        // 防抖（防止快速双击）
        const now = Date.now();
        if (this.lastClick && now - this.lastClick < 500) { // 增加到500ms
            console.log('⏳ 点击太快，忽略');
            return;
        }
        this.lastClick = now;
        
        // 禁用按钮防止重复点击
        this.classList.add('disabled');
        
        try {
            if (bgAudio.paused) {
                console.log('尝试播放音频...');
                await bgAudio.play();
                console.log('播放成功');
                this.innerHTML = '<i class="fas fa-volume-up"></i>';
                this.title = '暂停音乐';
            } else {
                console.log('暂停音频');
                bgAudio.pause();
                this.innerHTML = '<i class="fas fa-music"></i>';
                this.title = '播放音乐';
            }
        } catch (error) {
            console.warn('音频操作失败:', error.name, error.message);
            
            // 处理中断错误
            if (error.name === 'AbortError') {
                console.log('🔄 播放被中断,同步UI状态');
                // 根据实际状态同步UI
                setTimeout(() => {
                    if (bgAudio.paused) {
                        this.innerHTML = '<i class="fas fa-music"></i>';
                        this.title = '播放音乐';
                    } else {
                        this.innerHTML = '<i class="fas fa-volume-up"></i>';
                        this.title = '暂停音乐';
                    }
                }, 100);
            } else if (error.name === 'NotAllowedError') {
                console.log('❌ 浏览器阻止了音频播放');
                this.innerHTML = '<i class="fas fa-ban"></i>';
                this.title = '浏览器阻止播放，请检查权限';
            }
        } finally {
            // 重新启用按钮（稍微延迟）
            setTimeout(() => {
                this.classList.remove('disabled');
                console.log('✅ 按钮已重新启用');
            }, 400);
        }
    });

    // 6. 音量控制
    if (volumeSlider && volumeDisplay) {
        volumeSlider.addEventListener('input', function() {
            const volume = parseFloat(this.value);
            bgAudio.volume = volume;
            volumeDisplay.textContent = Math.round(volume * 100) + '%';
        });
    }
    
    // 7. 幻灯片切换音效（轻量版）
    Reveal.on('slidechanged', function(event) {
        const sound = document.getElementById('page-turn-sound');
        if (sound && userInteracted) {
            sound.currentTime = 0;
            sound.volume = 0.3;
            sound.play().catch(e => {
                // 静默失败，不打印错误
            });
        }
    });
    
    // 8. 初始按钮状态
    toggleBtn.classList.add('disabled'); // 初始为禁用状态
    toggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    toggleBtn.title = '点击页面任意位置激活音频';
    
    console.log('✅ 音效系统已初始化（等待用户交互）');
}


// ===== 5. 导航菜单 =====
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 移除所有active类
            menuItems.forEach(i => i.classList.remove('active'));
            // 添加当前active类
            this.classList.add('active');
        });
    });
    
    // 更新进度条
    Reveal.on('slidechanged', function(event) {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const total = document.querySelectorAll('.slides > section').length;
            const current = Reveal.getState().indexh + 1;
            const progress = (current / total) * 100;
            progressFill.style.width = progress + '%';
        }
    });
    
    console.log('✅ 导航菜单初始化完成！');
}

// ===== 6. 页面加载完成后的初始化 =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM加载完成');
    
    // 开始检查依赖
    checkThree();
    checkReveal();
    
    // 初始化导航
    initNavigation();
    
    // 🎵 修复音乐自动播放问题
    setTimeout(() => {
        const audio = document.getElementById('bg-audio');
        const playBtn = document.getElementById('toggle-bg-audio');
        
        if (audio && playBtn) {
            console.log('🎵 初始化音频系统');
            
            // 尝试静音播放（绕过浏览器限制）
            audio.muted = true;
            audio.play().then(() => {
                console.log('✅ 音频预加载成功');
                audio.pause();
                audio.muted = false;
                audio.currentTime = 0;
                
                // 更新按钮状态
                playBtn.innerHTML = '<i class="fas fa-music"></i>';
                playBtn.title = '点击播放音乐';
            }).catch(error => {
                console.log('⚠️ 音频预加载失败（正常，需要用户交互）:', error.message);
            });
            
            // 用户点击页面任意位置后启用音频
            function enableAudio() {
                audio.play().catch(e => {
                    console.log('等待用户交互...');
                });
                document.removeEventListener('click', enableAudio);
            }
            
            document.addEventListener('click', enableAudio);
        }
    }, 1000);
});

// ===== 7. 提供给earth.js的接口 =====
// 让earth.js知道什么时候可以安全初始化
window.waitForEarthDependencies = function(callback) {
    if (dependencies.THREE && dependencies.Reveal) {
        callback();
    } else {
        const checkInterval = setInterval(() => {
            if (dependencies.THREE && dependencies.Reveal) {
                clearInterval(checkInterval);
                callback();
            }
        }, 100);
    }
};

console.log('📜 script.js加载完成,等待DOM...');