import {
    WxPage,
} from '../../lib';

WxPage({
    data: {
        textLen: 0,
    },

    onLoad() {

    },

    onInput(e) {
        this.setData({
            textLen: e.detail.value.length,
        });
    },

    hadClick() {

    },
});
