export default {
    // 待通知队列
    notices: new Map(),

    // 加入监听 TODO: 检查是否重复加入
    put(name, that, func) {
        console.log(`监听 ${that.route}:${name}`);
        if (!this.notices.has(name)) {
            this.notices.set(name, []);
        }
        this.notices.get(name).push({
            that,
            func,
        });
    },

    // 仅监听一次 TODO: 执行完后取消
    putOnce(name, that, func) {
        console.log(`监听一次 ${that.route}:${name}`);
        if (!this.notices.has(name)) {
            this.notices.set(name, []);
        }
        this.notices.get(name).push({
            that,
            func,
            once: true,
        });
    },

    // 页面注销了就要把当前页面所有的事件取消注册
    remove(name, that) {
        console.log(`取消监听 ${that.route}:${name}`);
        this.notices.set(
            name,
            this.notices.get(name).filter(item => item.that.route !== that.route),
        );
    },

    // 触发通知
    emit(name, page = undefined, ...args) {
        try { // 执行
            console.log(`执行page ${page} event ${name}`);
            this.notices.get(`onEvent${name}`)
                .filter(item => (page ? item.that.route === page : true))
                .map(item => item.func.call(item.that, ...args)); // 可能要用call？
        } catch (err) {
            console.log(err);
        }
    },
};
