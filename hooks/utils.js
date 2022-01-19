export const openBrowser = (url)=> {
    window.common ? window.common.openBrowser(url) : window.AdSDK.openBrowser(url)
}
export const debounce = (func, wait, immediate) => {
    let timer;
    let context;
    let args;
    // let toast = null;

    // 延迟执行函数
    const later = () =>
        setTimeout(() => {
            // 延迟函数执行完毕，清空缓存的定时器序号
            timer = null;
            // 延迟执行的情况下，函数会在延迟函数中执行
            // 使用到之前缓存的参数和上下文
            if (!immediate) {
                func.apply(context, args);
                // eslint-disable-next-line no-multi-assign
                context = args = null;
            }
        }, wait);

    // 这里返回的函数是每次实际调用的函数
    // eslint-disable-next-line func-names
    return function (...params) {
        // 如果没有创建延迟执行函数（later），就创建一个
        if (!timer) {
            timer = later();
            // 如果是立即执行，调用函数
            // 否则缓存参数和调用上下文
            if (immediate) {
                func.apply(this, params);
            } else {
                context = this;
                args = params;
            }
            // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
            // 这样做延迟函数会重新计时
        } else {
            clearTimeout(timer);
            timer = later();
        }
    };
};

