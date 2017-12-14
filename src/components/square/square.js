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
            this.triggerEvent('hadClick', {});
        },
    },
});
