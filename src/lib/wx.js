// promisify copy from labrador

// 特别指定的wx对象中不进行Promise封装的方法
// 除了以下不封住的函数
const noPromiseMethods = [
    'drawCanvas',
    'canvasToTempFilePath',
    'getBackgroundAudioManager',
    'getRecorderManager',
    'canIUse',
];
// 还有以on* create* stop* pause* close* hide* 开头的方法
const noPromiseStartswith = /^(on|create|stop|pause|close|hide)/;
// 以Sync结尾的方法
const noPromiseEndswith = /\w+Sync$/;

const promiseWx = {
    async waitMin(req, min = 600, max = 10000) {
        // 如果在最小时间内完成就resolve
        // 如果在最大时间内还未完成throw
        const s1 = new Promise(resolve => setTimeout(resolve, min));
        const s2 = new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('request timeout')), max);
        });
        try {
            await Promise.race([Promise.all([req, s1]), s2]);
        } catch (err) {
            console.log(err);
            throw err; // 继续抛给外面
        }
        return req;
    },

    removeByIndex(l, index) {
        return l.slice(0, index).concat(l.slice(index + 1));
    },
};

Object.keys(wx).forEach((key) => {
    if (noPromiseMethods.indexOf(key) >= 0 ||
        noPromiseStartswith.test(key) ||
        noPromiseEndswith.test(key)
    ) {
        // 不进行Promise封装
        promiseWx[key] = wx[key];
        return;
    }

    // 其余方法自动Promise化
    promiseWx[key] = (obj) => {
        const args = obj || {};
        if (key === 'showToast') { // 给showtoast增加默认参数
            args.duration = 1100;
            if (args.icon === 'error') {
                args.image = '/static/icon/error.png';
            } else if (args.icon === 'warning') {
                args.image = '/static/icon/warning.png';
            }
        }
        return new Promise((resolve, reject) => {
            args.success = resolve;
            args.fail = reject;
            wx[key](args);
        });
    };
});

export default promiseWx;
