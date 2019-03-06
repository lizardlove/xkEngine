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

动效配置以`data-*` 属性添加到页面`DOM`节点，有`data-bgm`和`data-animal`两类。漫画按页划分，以`.page`标识，内部有多个`img`标签相互堆叠，由下至上，分别为背景层，动效层，蒙层。

### data-screen

> 全局唯一，绑定在顶层DOM(#dt-scrollor)，动画触发基准点

##### 范围：[0,1]

### data-bgm

> 只能绑定在`.page`标签上，可跨多页持续播放，id为序列化后自动添加，不用配置

##### 实例

```
data-bgm="{'item':{'loop':false,'newTeam':[0,1],'oldTeam':[0,1],'start':true,'outfade':2000,'startTop':0.1,'url':['songs/01-gqzhp5-hong.mp3'],'id':'xk3618610'}}"
```

##### loop

播放完毕后是否重复播放

+ true / false

##### url

音乐链接的相对地址

+ [url1, url2..]  

##### newTeam

`bgm`播放范围, 0表示本页，endIndex表示从本页开始，连续播放多少页。

+ [0, endIndex]

##### infade

音量淡入时间

+ Number  不限，单位`ms`

##### outfade

音量淡出时间

+ Number 不限，单位`ms`

##### startTop

相对起点页面顶部延迟一定距离播放

+ Number 取值范围[0, 1]

##### endTop

相对结束页面顶部延迟一定距离结束

+ Number 取值范围[0, 1]

##### start

标识是否为起点页

+ true / false

### data-animal

> 绑定在所属动画层次上(`.page`下`img`元素)
>
> 动画配置，严格按照一个动画一条item配置，同一元素不能配置互斥的动画

#### 必要

##### type

控制播放参照物，初始高度

+ 0  所属`.page`的顶部高度
+ 1  所属`img`元素的顶部高度
+ 2  所属`img`元素若有多条动效，跟随上一条配置同时运行，否则同0
+ 3  所属`img`元素若有多条动效，在上一条配置结束后运行，否则同0

##### delay

以可视屏幕高度为基准，延迟一定距离播放

+ 0  不延迟，按初始高度播放

+ 1 延迟0.05个屏幕高度距离

+ 2  延迟0.1个屏幕高度距离

+ 3  延迟0.2个屏幕高度距离

+ 4  延迟0.35个屏幕高度距离

+ 5  延迟0.6个屏幕高度距离

+ default  自定义延迟距离

  ```
  start = start + screenHeight * (config.delay / 100)
  ```

##### speed

以可视屏幕高度为基准，确定播放长度和结束位置

+ 0  播放长度为1个屏幕

+ 1  播放长度为0.8个屏幕

+ 2  播放长度为0.6个屏幕

+ 3  播放长度为0.4个屏幕

+ 4  播放长度为0.2个屏幕

+ default  自定义播放长度

  ```
  end = start + screenHeight * (config.speed/100)
  ```

#### 可选动画类型

##### music

```
{'item':{'type':2,'speed':40,'delay':5,'music':{'url':['songs/02-gqzhp5-flash.mp3'],'outfade':2000, 'loop': false}}}
```

+ url  音乐链接
+ infade  音量淡入时间
+ outfade  音量淡出时间
+ loop  播放结束后是否重新播放

##### transform

`css` 的`transform`的结束状态，`css`格式

```
{'item': {'type': 1, 'speed': 30, 'delay': 0, 'transform': 'translate3d(-768px, 0px, 0px) scale(1, 1) rotate(0deg)'}}
```

##### animation

`css`格式

```
{'item':{'type':1, 'speed': 100, 'delay': 5, 'animation':'trans1XY 0.5s linear infinite'}}
```

##### opacity

`css`格式

```
{'item': {'type': 0, 'speed': 5, 'delay': 4, 'opacity': '0'}}
```

##### gif

待定

##### swing

待定



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
| domBox        | Object   | 存储页面控制组DOM                                  |
| init          | Function | 解析动画配置，资源并分类，计算绝对定位             |
| play          | Function | 接收滑动高度，执行动画                             |
| prePlay       | Function | 对页面各组件进行状态配置                           |



### Scroll

> 滑动控制器，页面滑动的控制，及滑动相关参数计算，事件的兼容

| 属性                        | 类型     | 说明                                                         |
| --------------------------- | -------- | ------------------------------------------------------------ |
| top                         | Number   | 页面滑动高度                                                 |
| lastTop                     | Number   | 上一刷新时的滑动高度                                         |
| callback                    | Function | 外部对象的回调函数                                           |
| direct                      | Number   | 0：上， 1：下，2：左，3：右                                  |
| event                       | Object   | 滑动事件对象                                                 |
| wrapper                     | Object   | 顶层对象，获取滑动参数                                       |
| options                     | Object   | 滑动控制，多端兼容                                           |
| _start(e)                   | Function | 起始事件，兼容click，touch多端移动控制事件                   |
| _move(e)                    | Function | 移动事件，多端兼容                                           |
| _end(e)                     | Function | 移动结束，多端兼容                                           |
| initEvent(remove, callback) | Function | 绑定事件，回调，多端兼容                                     |
| handleEvent(e)              | Function | handleEvent为浏览器触发绑定对象的回调函数时的默认捕获事件对象的函数 |

### Resource

> 存储和控制整个页面的资源，并按需进行资源预加载

| 属性        | 类型     | 说明                                         |
| ----------- | -------- | -------------------------------------------- |
| box         | Array    | 依次存放单页依赖的资源                       |
| load(index) | Function | 根据传入的页索引，对该页依赖的资源进行预加载 |
| _imageLoad  | Function | 图片资源加载，超时的错误控制重新加载         |
| _musicLoad  | Function | 音乐资源加载并静音播放1s                     |

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

| 属性   | 类型     | 说明                     |
| ------ | -------- | ------------------------ |
| id     | Number   | 全局动画标识             |
| ele    | Object   | 所属的DOM对象            |
| status | Number   | 0 静止，1 准备，2播放    |
| top    | Number   | 全局绝对高度，起点       |
| bottom | Number   | 全局绝对高度，终点       |
| config | Object   | 播放相关配置             |
| howler | Object   | howler音乐对象           |
| play   | Function | 播放音乐                 |
| stop   | Function | 停止播放并注销howler对象 |
| pause  | Function | 暂停播放                 |

#### Animate

> CSS 3动画的封装

| 属性      | 类型     | 说明                                        |
| --------- | -------- | ------------------------------------------- |
| id        | Number   | 全局动画标识                                |
| ele       | Object   | 所属的DOM                                   |
| status    | Number   | 0 静止，1 准备，2播放                       |
| top       | Number   | 全局绝对高度，起点                          |
| bottom    | Number   | 全局绝对高度，终点                          |
| type      | String   | 动画类型                                    |
| option    | Object   | 标识CSS3动画，animation, opacity, transform |
| _format   | Function | CSS3动画参数格式化                          |
| play(top) | Function | 根据传入高度，执行动画                      |
| stop      | Function | 取消动画执行                                |

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



## 控制思路

`app`是打包入口文件

`Control`类作为全局的控制器，`Util`和`Scroll` ，`Resource`是必须的引入的组件。通用功能函数和外部属性，如浏览器，客户端的信息均保存在`Util`中。`Scroll`是保证各端对滑动事件的兼容，抽象的一层滑动控制器。`Resource`是全局资源控制，对图片和音乐资源进行预加载控制。

其余`Music`，`Animate`， `Gif`， `Swing`等均为动效组件，按需添加。初始化各动效实例流程在`Control`下`_computeAnimates` 中。

### 数据处理

1. 初始化解析页面`DOM` 结构，根据`.Page`(漫画单页)部分累加计算全局绝对高度，并根据页面DPI对`img`大小进行适配放缩

2. 遍历`.page`收集绑定的动效配置信息和资源。

   动效配置信息按单条保存

   ```
   {'item':{'type':1,'speed':12,'delay':4,'animation':'ShowHi-21 1.25s linear 1 forwards'}}
   ```

   配置信息为`JSON`格式，绑定在`.page`下的各个`img`上，以`data-animal`标识。`data-animal`下可有多个`item`，一个`item`计算为一条动效配置，每条动效必须配置项为`type`，`speed`，`delay` 。可选配置项为`music`，`transform`，`opacity`，`animation`，`gif`，`swing`，每条动效，可选配置项只能取其一。

   资源信息按页保存，每个`.page`为一页，资源加载时按页进行加载。

3. 计算动效的全局绝对起始高度和结束高度。动效是依附于所属的`DOM`节点，因此各动效的起始高度的初始值为所属节点的全局高度，然后根据`type`和`delay`属性调整起始高度，`speed`在起始高度的基础上计算结束高度。以此，将各动效的控制从`DOM`节点上剥离，后续的动效控制仅根据滑动高度和动效的计算高度进行判断。

4. 数据处理基本完成，初始化页面活动对象和动画活动对象，准备进行漫画播放，页面按钮功能配置（音乐按钮，菜单按钮）。活动对象保存处于播放和预播放区域的页面和动画的索引，因为动画和页面的触发判断是分离的，分别根据各自的高度单独判断。所以有两个活动对象组。

5. 动画执行时，根据滑动控制器传入的滑动高度，对活动对象组进行更新，并对活动对象进行渲染

### 动效渲染

动效配置序列化后，有自己的全局起始高度和结束高度，其差为存活长度。动效大致可分为两类，一类跟存活长度相关，需要根据滑动长度（滑动高度 - 起始高度）与存活长度的比例决定每一时刻属性值，如`opacity`，`transform`；一类跟存活长度无关，不需要根据高度计算和控制相关属性，如`animation`，`music`。

跟存活长度无关的，只需根据滑动高度和活动状态判断动效的开始和结束即可。而跟存活长度相关的，则需进行一次高度处理。将各高度（起始高度，结束高度，滑动高度）统一处理为长度（存活长度和滑动长度），然后转换为[0,1]比例值，再根据各动效的单位进行换算再赋值。

### 资源加载

在数据处理时，资源已经按页分类保存，所以资源加载时也按页进行加载，目前资源有两类需求，图片和音乐，分别分装了单独的加载函数。每个资源有自己的加载控制属性`loaded`，每页还有单独的加载控制属性`status` 。当`status == pageResource.length`表示该页资源加载完成。对单个资源加载出错或超时进行控制，出错或超时500ms则重新加载。