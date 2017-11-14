import store from '../../lib/store';
import playing from '../..//bo/playing';

Component({
    properties: {
        len: {
            type: Number,
            observer(newVal, oldVal) {
                this.setData({
                    showLen: newVal * 2,
                });
            },
        },
    },
    data: {
        showLen: 0,
    },
    methods: {
        async labeltap() {
            const info = await store.get('onLaunch');
            console.log(info);
            playing.title = this.data.showLen / 2;
            // 发射一个事件
            this.triggerEvent('hadClick', {});
        },
    },
});
