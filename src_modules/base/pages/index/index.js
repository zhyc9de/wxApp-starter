import { wxp, WxPage } from '../../lib';

WxPage({
    data: {
        textLen: 0,
    },

    onInput(e) {
        console.log(wxp);
        this.setData({
            textLen: e.detail.value.length,
        });
    },

    hadClick() {

    },
});
