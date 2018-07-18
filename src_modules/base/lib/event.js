import wxp from './wxp';

export default {
    // 待通知队列
    notices: new Map(),

    // 加入监听
    put(name, that, func) {
        console.log(`${name} 监听事件 ${that.route}:${name}`);
        if (!this.notices.has(name)) {
            this.notices.set(name, []);
        }
        this.notices.get(name)
            .push({
                that,
                func,
            });
    },

    // 页面注销了就要把当前页面所有的事件取消注册
    remove(name, that) {
        console.log(`取消监听 ${that.route}:${name}`);
        this.notices.set(
            name,
            this.notices.get(name)
                .filter(item => item.that.route !== that.route),
        );
    },

    // 触发通知
    emit(name, route, ...args) {
        try { // 执行
            console.log(`${route || '全部页面'} emit ${name}`);
            const events = this.notices.get(`onEvent${name}`) || [];
            events.filter(item => (route ? item.that.route === route : true))
                .map(item => item.func.call(item.that, ...args));
        } catch (err) {
            console.log(err);
        }
    },

    // 仅触发当前页面通知
    emitCurrent(name, ...args) {
        try { // 执行
            const currentPage = wxp.getCurrentRoute();
            this.emit(name, currentPage, ...args);
        } catch (err) {
            console.log(err);
        }
    },
};
