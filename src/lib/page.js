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
};

// 重构的page
export function WxPage(params) {
    const newOptions = Object.assign({}, params);
    const nullFoo = () => {};

    newOptions.oldLoad = newOptions.onLoad || nullFoo;
    newOptions.onLoad = function () {
        bo.pages.set(this.route, this);
        this.oldLoad();
    };

    newOptions.oldUnload = newOptions.onUnload || nullFoo;
    newOptions.onUnload = function () {
        bo.pages.delete(this.route, this);
        this.oldUnload();
    };

    return Page(newOptions);
}


export default bo;
