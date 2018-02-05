# wx app starter

## features

### webpack

support npm, less and webpack plugin

- `npm run dev`, auto rebuild
- `npm run build`, build js with compress and uglify

### Page && Component

- page加上默认的分享函数，`disableShare`可以关闭
- 监听所有`onEvent`开头的函数，调用`event.emit`可以通知事件
- TODO: 考虑是否要保证加载顺序

### 对wx的修改

- 将异步函数封装成promise，支持使用async/await
- 给showToast加上更多设置
- add func `waitMin` 至少等待min后，才能完成promise，同时保证不超时
- add func `removeByIndex`
- add func `go` 重新封装了wx自带的路由函数
- add func `setShare` 设置临时分享内容
- add func `getShare` 获取分享内容，优先使用临时分享内容，临时分享内容获取一次后失效

### event

- 触发事件通知
- TODO: 等待事件完成

### store

## Tips

- [源自Animate.css的动效库](https://github.com/jeasonstudio/Ripples.wxss)
- [wux样式库](https://github.com/skyvow/wux)
- [小程序json配置](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/config.html)
