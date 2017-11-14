import playing from '../..//bo/playing';

Page({
    data: {
        playing,
        textLen: 0,
    },

    onInput(e) {
        this.setData({
            textLen: e.detail.value.length,
        });
    },

    hadClick() {
        console.log(playing);
        this.setData({
            playing,
        });
    },
});
