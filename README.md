## xkEngine

```markdown
|-- xkEngin
    |-- config.json               本地服务器配置
    |-- package.json              项目依赖及相关配置
    |-- server.dev.js             本地服务器
    |-- webpack.config.js         开发用webpack脚本，热加载
    |-- webpack.build.config.js   打包脚本
    |-- src                       基础文件目录
        |-- core                  引擎核心文件
        |   |-- animate.js        CSS3动画类文件
        |   |-- app.js            引擎入口
        |   |-- control.js        引擎核心控制器，控制整个流程
        |   |-- full.js           单屏动画类文件
        |   |-- gif.js            Gif动画类文件
        |   |-- music.js          音乐类文件
        |   |-- resource.js       资源控制器，整个页面资源的控制与加载
        |   |-- scroll.js         滑动控制器
        |   |-- swing.js          重力感应类动画
        |   |-- utils.js          工具文件
        |-- public                
            |-- index.html        实例HTML，用于解析测试，可替换
    |--doc                        接口文档

```

本项目，仅涉及引擎核心的编写及相关环境，不包括开发过程环境，输出为单个`js`文件，即为引擎核心。

#### Usage

使用

在漫画页面底部引入

```
<script src="main.js"></script>
<script>
    let xkAnimate = new Control({
        ele: "#dt-scrollor"
    })
</script>
```

开发依赖

```cmd
yarn install
```

热开发模式运行

```javascript
npm run dev
```

打包文件

```
npm run build
```



#### 功能

| 模块         | 完成情况 |
| ------------ | -------- |
| 核心控制器   | 完成     |
| 资源加载     | 完成     |
| 滑动控制     | 完成     |
| 工具文件     | 完成     |
| 音乐类       | 完成     |
| CSS3动画类   | 完成     |
| 帧动画类     | 0%       |
| 单屏动画     | 0%       |
| 重力感应动画 | 0%       |



### [接口文档](./doc/index.md)

