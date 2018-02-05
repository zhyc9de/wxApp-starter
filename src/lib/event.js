export default {
    // 待通知队列
    notices: new Map(),

    // 加入监听 TODO: 检查是否重复加入
    putNotice(name, page, func) {
        console.log(`监听 ${page}:${name}`);
        if (!this.notices.has(name)) {
            this.notices.set(name, []);
        }
        this.notices.get(name).push({
            page,
            func,
        });
    },

    // 仅监听一次
    putNoticeOnce(name, page, func) {
        console.log(`监听一次 ${page}:${name}`);
        if (!this.notices.has(name)) {
            this.notices.set(name, []);
        }
        this.notices.get(name).push({
            page,
            func,
            once: true,
        });
    },

    // 页面注销了就要把当前页面所有的事件取消注册
    removeNotice(name, page) {
        console.log(`取消监听 ${page}:${name}`);
        this.notices.set(
            name,
            this.notices.get(name).filter(item => item.page !== page),
        );
    },

    // 触发通知
    emitNotice(name, page = undefined, ...args) {
        try { // 执行
            this.notices.get(name)
                .filter(item => (page ? true : item.page === page))
                .map(func => func(...args)); // 可能要用call？
        } catch (err) {
            console.log(err);
        }
    },
};
