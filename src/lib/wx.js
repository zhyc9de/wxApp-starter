// promise way copy from labrador

// 特别指定的wx对象中不进行Promise封装的方法
// 除了以下不封住的函数
const noPromiseMethods = [
    'drawCanvas',
    'canvasToTempFilePath',
    'getBackgroundAudioManager',
    'getRecorderManager',
    'canIUse',
];
// 还有以on* create* stop* pause* close* show* hide* 开头的方法
const noPromiseStartswith = /^(on|create|stop|pause|close|show|hide)/;
// 以Sync结尾的方法
const noPromiseEndswith = /\w+Sync$/;

const promiseWx = {};

Object.keys(wx).forEach((key) => {
    if (noPromiseMethods[key] ||
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
        return new Promise((resolve, reject) => {
            args.success = resolve;
            args.fail = reject;
            wx[key](args);
        });
    };
});

export default promiseWx;
