import {
    WxPage,
} from '../../lib';

WxPage('pages/index/index', {
    data: {
        textLen: 0,
    },

    onInput(e) {
        this.setData({
            textLen: e.detail.value.length,
        });
    },

    hadClick() {

    },
});
