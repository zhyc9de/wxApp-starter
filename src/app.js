// 注册程序
import store from './lib/store';

App({
    globalData: 'I am global data',
    async onLaunch(options) {
        await store.set('onLaunch', true);
    },
});
