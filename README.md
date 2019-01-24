## xkEngine

```markdown
|-- xkEngin
    |-- config.json               本地服务器配置
    |-- package.json              项目依赖及相关配置
    |-- server.dev.js             本地服务器
    |-- webpack.config.js         开发用webpack脚本，热加载
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

```



#### Usage

安装项目依赖

```cmd
yarn install
```

开发模式运行，已开启Webpack热加载和开发模式

```javascript
npm run dev
```



### [开发文档](./doc/index.md)



## 进度

`1.22` 项目启动 by `蜥蜴`

`1.24` 初始解析模块完成 by `蜥蜴`



## 要求

1. 模块功能完整，注释完整
2. 按格式填写接口文档