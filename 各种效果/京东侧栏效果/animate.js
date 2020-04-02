function animate(obj, target, callback) {
    // 先清除以前的定时器，只保留当前的一个定时器执行
    clearInterval(obj.timer);
    obj.timer = setInterval(function() {
        var step = (target - obj.offsetLeft)/10
        step = step > 0 ? Math.ceil(step) : Math.floor(step)  
        if (obj.offsetLeft == target) {
            // 停止动画 本质是停止定时器
            clearInterval(obj.timer);
            if(callback){
                // 调用回调函数
                callback()
            }
        }
        // 慢慢变小实现缓动效果 步长公式：（目标值-现在位置）/10
        obj.style.left = obj.offsetLeft + step + 'px';

    }, 15);
}
