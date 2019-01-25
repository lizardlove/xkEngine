## 页面结构

```
<div id="dt-scrollor">                               //顶层盒子
    <div id="dt-animalBox">                          //漫画大盒子
        <div id="dt-loadbox"></div>                  //加载动画
        <div id="dt-animalContent">                  //漫画内容
            <div class="page">                       //单页内容
                <img class="page-bg" src="" alt="">
            </div>
            <div class="page">                       //单页内容
                <img class="page-bg" src="" alt="">
            </div>
            <div class="page">                       //单页内容
                <img class="page-bg" src="" alt="">
            </div>
            ...
        </div>
        <div id="dt-other-box"></div>
    </div>
    <div id="musicBox"></div>                        //音乐控制
</div>
```

## 动画配置参数

### data-screen

> 全局唯一，绑定在顶层DOM(#dt-scrollor)，动画触发基准点

##### 范围：[0,1]

### data-bgm

> 页面bgm配置，可跨多个页面播放同一bgm

| 键       | 类型                       | 说明                               |
| -------- | -------------------------- | ---------------------------------- |
| loop     | Boolean                    | 在规定范围内是否                   |
| url      | Array [String]             | 存储音乐地址                       |
| newTeam  | Array [startPage, endPage] | 只要两个值的数组                   |
| infade   | Number                     | 淡入时间，毫秒级                   |
| outfade  | Number                     | 淡出时间，毫秒级                   |
| startTop | Number [0, 1]              | 播放开始点，对应起点page高度百分比 |
| endTop   | Number [0, 1]              | 停止结束点，对应结束page高度百分比 |

### data-animal

> 动画配置，严格按照一个动画一条item配置，同一元素不能配置互斥的动画

#### 必要

| 键    | 类型   | 说明                                                         |
| ----- | ------ | ------------------------------------------------------------ |
| type  | Number | 定义动画起始高度，0：绑定page的top; 1：绑定元素的top；2：同一元素的上一个动画的top；3：同一元素的上一个动画的bottom |
| delay | Number | 0 1 2 3 4 5, 六种固定延迟模式，可选[0, 1]，自定义延迟百分比，基准为可视屏幕高度 |
| speed | Number | 0 1 2 3 4，五种固定模式，可选[0,100]，自定义百分比，基准为可视屏幕高度 |

#### 可选动画类型

| 键        | 类型   | 说明                                                         |
| --------- | ------ | ------------------------------------------------------------ |
| music     | JSON   | 包含loop, url, infade, outfade四个参数                       |
| transform | String | 平移，选择，翻转类动画                                       |
| animation | String | CSS3动画                                                     |
| opacity   | String | 通过调节透明度，爆炸类动画                                   |
| gif       | JSON   | 帧动画，包含time(时间频率), url(图片地址数组), type(chart类坐标值), stop(播放次数)四个参数 |
| swing     | JSON   | 重力感觉类动画，兼容滑动，包含imageWidth, imageHeight, imgSrc三个参数 |

## 模块接口

### Control

> 整个框架的全局控制器，管理整个流程和状态

| 属性          | 类型     | 说明                                               |
| ------------- | -------- | -------------------------------------------------- |
| basePoint     | Number   | 动画触发基准线，即`data-screen`                    |
| basePointTop  | Number   | 实时将动画触发基准线换算为触发高度                 |
| ele           | Object   | 保存配置的顶层对象，即`#dt-scrollor`               |
| pageArray     | Array    | 单页内容盒子`.page`列表                            |
| pageActive    | Array    | 处于屏幕可视区域的页面的索引                       |
| status        | Number   | 0：加载动画阶段，1：浏览模式阶段，2：结束阶段      |
| animates      | Array    | 动画池，页面全部动画的列表，包括音乐               |
| animateActive | Array    | 处于活动状态或预备状态的动画索引列表               |
| resource      | Object   | 资源控制器，主要用于资源的控制和预加载             |
| scroll        | Object   | 滑动控制器，主要用于滑动的控制，滑动相关参数的计算 |
| utils         | Object   | 工具函数库                                         |
| init(ele)     | Function | 解析DOM，动画配置，资源并分类，计算绝对定位        |



### Scroll

> 滑动控制器，页面滑动的控制，及滑动相关参数计算，事件的兼容

| 属性             | 类型     | 说明                                                         |
| ---------------- | -------- | ------------------------------------------------------------ |
| top              | Number   | 页面滑动高度                                                 |
| lastTop          | Number   | 上一刷新时的滑动高度                                         |
| callback         | Function | 外部对象的回调函数                                           |
| direct           | Number   | 0：上， 1：下，2：左，3：右                                  |
| event            | Object   | 滑动事件对象                                                 |
| wrapper          | Object   | 顶层对象，获取滑动参数                                       |
| options          | Object   | 滑动控制，多端兼容                                           |
| start, move, end | Function | 滑动的起始，移动，结束事件，兼容click，touch多端移动控制事件 |

### Resource

> 存储和控制整个页面的资源，并按需进行资源预加载

| 属性                   | 类型     | 说明                                         |
| ---------------------- | -------- | -------------------------------------------- |
| box                    | Array    | 依次存放单页依赖的资源                       |
| load(index)            | Function | 根据传入的页索引，对该页依赖的资源进行预加载 |
| error(){return status} | Function | 资源加载，超时的错误控制，返回一个状态码     |

### Utils

> 工具库，浏览器相关属性及其他工程函数的集合

| 属性                               | 类型     | 说明                                |
| ---------------------------------- | -------- | ----------------------------------- |
| window                             | Object   | 全局对象                            |
| document                           | Object   | 文档对象                            |
| width                              | Number   | 浏览器可视区域宽度                  |
| height                             | Number   | 浏览器可视区域高度                  |
| isBadAndroid                       | Boolean  | 判断移动端平台                      |
| style                              | Object   | 浏览器是否支持相关css3属性          |
| scrollTop()                        | Function | 获取当前滑动高度                    |
| requestAnimationFrame              | Fucntion | 多平台兼容                          |
| cancelAnimationFrame               | Function | 多平台兼容                          |
| getTime                            | Function | 获取当前时间                        |
| getChildList(ele)                  | Function | 获取父级元素ele的所有子元素节点     |
| setStyle(ele, tf)                  | Function | 将样式tf添加到ele                   |
| getStyleRect(ele)                  | Function | 获取节点ele的宽高，绝对高度，左偏移 |
| offset(el)                         | Function | 获取节点的顶部偏移和左偏移          |
| hasClass(ele, c)                   | Function | 判断节点是否具有类名c               |
| addClass(ele, c)                   | Function | 给节点添加类名                      |
| removeClass(ele, c)                | Function | 移出类名                            |
| addEvent(el, type, fn, capture)    | Function | 添加事件                            |
| removeEvent(el, type, fn, capture) | Function | 绑定事件                            |
| prefixPointerEvent(pointerEvent)   | Function | 指针事件对象的兼容                  |
| click                              | Function | click兼容事件                       |
| trim                               | Function | 删除固定字符                        |



### 动画对象

#### 公共属性

> 动画类对象的公共属性，所有类型动画都必须拥有的属性

| 属性   | 类型   | 说明                                                 |
| ------ | ------ | ---------------------------------------------------- |
| id     | Number | 动画所属的页面索引                                   |
| ele    | Object | 动画绑定的元素                                       |
| status | Number | 动画状态，0：停止，1：准备，2：运行                  |
| top    | Number | 动画初始触发高度                                     |
| bottom | Number | 动画结束高度                                         |
| type   | String | 标识动画类型，可选`music`，`animate`，`gif`, `swing` |
| config | Object | 动画的配置参数，各动画不相同                         |

#### Music

> 音乐对象的封装

| 属性 | 类型 | 说明 |
| ---- | ---- | ---- |
|      |      |      |

#### Animate

> CSS 3动画的封装

| 属性 | 类型 | 说明 |
| ---- | ---- | ---- |
|      |      |      |

#### Gif

> Gif动画的封装

| 属性 | 类型 | 说明 |
| ---- | ---- | ---- |
|      |      |      |

#### Swing

> 重力感应动画的封装，兼容滑动动画

| 属性 | 类型 | 说明 |
| ---- | ---- | ---- |
|      |      |      |





