const bo = {
    pages: new Map(),

    // 获取当前页面
    getCurrentPage() {
        const pages = getCurrentPages();
        if (pages.length > 0) {
            return pages[pages.length - 1];
        }
        return undefined;
    },

    // 给定绝对路径（不需要包含开头的斜杠）, 尝试从页面栈中拿到这个页面的对象
    getPageInStack(absPath) {
        const pages = getCurrentPages();
        for (let i = 0; i < pages.length; i += 1) {
            if (pages[i].route === absPath) {
                return pages[i];
            }
        }
        return null;
    },

};

// 重构的page
export function WxPage(router, params) {
    const newOptions = Object.assign({}, params);
    const nullFoo = () => {};

    // TODO: 是否要保证加载顺序

    Page(newOptions);
    // 只是存个原型
    bo.pages.set(router, params);
}


export default bo;
