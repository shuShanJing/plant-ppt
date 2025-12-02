// ==== 1. 初始化配置（立即执行）====
(function initReveal() {
    // 检查是否已初始化
    if (window.revealInitialized) return;
    
    // 等待Reveal库加载
    if (typeof Reveal === 'undefined') {
        setTimeout(initReveal, 100);
        return;
    }
    
    // 初始化配置
    Reveal.initialize({
        hash: true,
        transition: 'convex',
        plugins: [RevealNotes, RevealMarkdown, RevealHighlight],
        showNotes: false,
        showSlideNumber: 'all'
    });
    
    window.revealInitialized = true;
    console.log('✅ Reveal.js初始化完成！');
})();

// ==== 2. 导航菜单功能（在Reveal就绪后执行）====
function setupNavigation() {
    if (typeof Reveal === 'undefined') {
        setTimeout(setupNavigation, 100);
        return;
    }
    
    // 点击菜单跳转
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const slideNum = parseInt(this.getAttribute('href').replace('#/', ''));
            Reveal.slide(slideNum - 1);
        });
    });
    
    // 幻灯片切换时更新导航
    Reveal.on('slidechanged', function(event) {
        // 更新活动菜单项
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const slideIndex = Reveal.getIndices().h;
        const menuItem = document.querySelector(`.menu-item[href="#/${slideIndex + 1}"]`);
        if (menuItem) menuItem.classList.add('active');
        
        // 更新进度条
        const totalSlides = document.querySelectorAll('.slides section').length;
        const progress = ((slideIndex + 1) / totalSlides) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    });
    
    console.log('✅ 导航菜单初始化完成！');
}

// ==== 3. 演讲者视图增强 ====
Reveal.on('ready', function() {
    console.log('🎯 Reveal.js完全就绪！');
    setupNavigation(); // 确保导航在Reveal就绪后设置
    
    // 演讲者视图提示
    Reveal.on('speakernotes', function(event) {
        console.log(`🎤 演讲者视图: ${event.type}`);
        if (event.type === 'shown') {
            console.log('💡 提示：演讲者视图已打开，备注在右侧窗口');
        }
    });
});

// ==== 4. 快捷键提示 ====
document.addEventListener('keydown', function(e) {
    switch(e.key.toLowerCase()) {
        case 's':
            console.log('💡 按 S 打开演讲者视图');
            break;
        case 'f':
            console.log('💡 按 F 切换全屏');
            break;
        case 'b':
            console.log('💡 按 B 黑屏暂停');
            break;
    }
});