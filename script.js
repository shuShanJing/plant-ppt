// 导航菜单交互
Reveal.on('slidechanged', function(event) {
    // 更新活动菜单项
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    const currentSlide = Reveal.getCurrentSlide();
    const slideIndex = Reveal.getIndices().h;
    const menuItem = document.querySelector(`.menu-item[href="#/${slideIndex + 1}"]`);
    if (menuItem) menuItem.classList.add('active');
    
    // 更新进度条（假设总幻灯片数）
    const totalSlides = document.querySelectorAll('.slides section').length;
    const progress = ((slideIndex + 1) / totalSlides) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
});

// 点击菜单跳转（需防止Reveal默认行为）
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const slideNum = parseInt(this.getAttribute('href').replace('#/', ''));
        Reveal.slide(slideNum - 1);
    });
});