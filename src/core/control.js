import Scroll from './scroll'
import Resource from './resource'
import utils from './utils'

import Music from './music'
import Animate from './animate'
import Swing from './swing'
import Gif from './gif'
import Full from './full'

export default class Control {
    /**
     * 
     * @param {Object} config 基础配置参数，包括顶层DOM，背景等 
     */
    constructor(config) {

        this.basePoint = 0                               //动画触发基准线
        this.basePointTop = 0                            //动画触发基准线换算为实际绝对高度
 
        this.ele = utils.document.querySelector(config.ele)    //DOM结构的顶层盒子 #dt-scrollor
        
        this.pageArray = []                              //漫画页面.page 盒子列表

        this.status = 0                                  //页面状态，3种取值0、1、2，0表示处于加载动画，1表示浏览模式，2表示触及底部，即结束

        this.oldPageActive = []
        this.pageActive = [0, 1, 2]                             //处于屏幕可视区域的page列表
        
        this.animateActive = []                          //处于以当前屏幕为中心，往上两个可视屏幕，往下两个可视屏幕，此范围内的活动动画索引列表
        this.animates = []                               //动画列表，列表元素为实例化动画对象，其中包括音乐对象

        this.resource = new Resource()                   //资源控制器，主要用于资源的控制和预加载

        this.utils = utils                               //浏览器相关属性及与动画无关的工具函数

        this.scroll = new Scroll(utils)      //滑动控制器，主要用于滑动的控制，滑动相关参数的计算

        this.init(this.ele)
    }

    /**
     * 
     * @param {Object} ele 顶层DOM对象，根据此对象解析出其子孙节点，再分别进行数据的分类和计算 
     */
    init(ele) {

       let self = this

       let animateBox = ele.firstElementChild || ele.children[0]                     //漫画大盒子
       let loadBox = animateBox.firstElementChild || animateBox.children[0]          //加载动画盒子
       let animateContent =  animateBox.children[1]                                  //漫画内容盒子
   
       //let otherBox = animateContent.nextElementSibling || animateBox.children[2]  //其他内容盒子，页面菜单

       //let otherBoxList = otherBox.querySelectorAll('.ot-page-img')                

       //let musicBtnBox = animateBox.nextElementSibling || ele.children[1]          //音乐按钮

       //self.otherItemBox.list = otherBoxList

       //let loadBoxRect = self.utils.getStyleRect(loadBox)
       //let loadHeight = loadBoxRect.height

       self.basePoint = animateBox.getAttribute('data-screen')                      //页面基准触发点
       self.basePointTop = self.scroll.top + self.basePoint * self.utils.height
       animateBox.removeAttribute('data-screen')

       //self.options.animalBox = animalBox;                         // 全局存储大盒子
       //self.options.animalDtBoxWidth = animalBox.offsetWidth;
       //self.options.initBackgourund = animalBox.style.background;

       //musicBtnBox.style.opacity = 0;						// 音乐按钮先隐藏
       //loadBox.style.zIndex = 0;							// 把loading效果降级

       //获取漫画内容 页面列表
        self.pageArray = animateContent.children || self.utils.getChildList(animateContent)  

        self._computePanel(animateContent)       //初始化漫画页面绝对高度计算

        self._collectConfig(self.pageArray)      //解析dom结构，收集动画，音乐配置，分类资源

        self._computeAnimates(self.animates)     //计算动画的触发高度和结束高度，并实例化各类动画

        
        //以下部分应在页面加载完成后，置于此处，便于当前调试
        animateContent.style.height = animateContent.getAttribute('data-boxHeight') + 'px'
        self.resource.load(self.pageActive)
        self.status = 1
        self.play()


        self.scroll.initEvent(false, function (top) {

            let displayStart, displayEnd, screenHeight

            screenHeight = self.utils.height

            self.basePointTop = top + self.basePoint * screenHeight

            displayStart = top - screenHeight * 3
            displayStart = displayStart < 0 ? 0 : displayStart

            displayEnd = top + screenHeight * 3

            self.oldPageActive = self.pageActive
            self.pageActive = self._modify(self.pageArray, self.pageActive, displayStart, displayEnd)
            self.animateActive = self._modify(self.animates, self.animateActive, displayStart, displayEnd)
            
            self.resource.load(self.pageActive)

            self.play()

        })

    }

    play() {
        
        let self = this

        self.pageActive.forEach(index => {

            let page = self.pageArray[index]

            if (!page.style.display) {
                flash(page)
            }

            page.style.display = "block"

        })

        function flash(page) {
            let child, src
            child = page.children || self.utils.getChildList(page)
            src = page.getAttribute('data-src')
            if (src) {
                page.setAttribute('src', src)
            }

            for (let i = 0; i < child.length; i++) {
                src = child[i].getAttribute('data-src')
                if (src) {
                    child[i].setAttribute('src', src)
                }
            }
        }
    }
    _modify(objects, active, start, end) {
        let self = this
        let ac = []
        let rect, index, bottom
        active.forEach(index => {
            rect = self.utils.isDom(objects[index]) ? self.utils.getStyleRect(objects[index]) : objects[index]
            bottom = rect.bottom ? rect.bottom : rect.top + rect.height
            if (bottom > start) {
                ac.push(index)
            }
        })

        index = ac[ac.length -1] + 1
        index = index ? index : 0
        for (let i = index; i < objects.length; i++) {
            rect = self.utils.isDom(objects[i]) ? self.utils.getStyleRect(objects[i]) : objects[i]
            if (rect.top < end) {
                ac.push(i)
            } else {
                break
            }
        }

        return ac
    }
    /**
     * 
     * @param {Object} box  漫画内容盒子
     */
    _computePanel(box) {

        let self = this

        let winDpi   //浏览器分辨率比例，用于各级盒子和图片的自适应
          , width
          , height
        //页面相关变量，在漫画内容盒子中，最多三层嵌套  div#dt-animalContent  div.page div，第三层主要用于处理互斥类动画的兼容
        let pageList, pageLen, pageTop, page, pageChild, pageChildLen, pageChildItem 

        pageList = box.children || self.utils.getChildList(box)
        pageLen = pageList.length

        winDpi = Math.round((box.getAttribute('data-width') / box.offsetWidth) * 1000) / 1000

        width = box.getAttribute('data-width')
        height = box.getAttribute('data-height')
        box.removeAttribute('data-width')
        box.removeAttribute('data-height')
        box.removeAttribute('data-top')

        width = Math.round(Math.round((width / winDpi) * 1000) / 1000)
        height = Math.round(Math.round((height / winDpi) * 1000) / 1000)

        width ? width : width = 0
        height ? height : height = 0

        pageTop = 0     //漫画页面高度累加

        for (let i = 0; i < pageLen; i++) {                  //第二层内容
            page = pageList[i]
            width = Math.round(Math.round((page.getAttribute('data-width') / winDpi) * 1000) / 1000);
            height = Math.round(Math.round((page.getAttribute('data-height') / winDpi) * 1000) / 1000);
            page.removeAttribute('data-top');
            page.removeAttribute('data-width');
            page.removeAttribute('data-height');

            self.utils.setStyle(page, {'top': pageTop + 'px', 'width': width + 'px', 'height': height + 'px'});
            pageTop += height;

            pageChild = page.querySelectorAll('*');
            pageChildLen = pageChild.length;
            while (pageChildLen--) {                         //第三层内容
                pageChildItem = pageChild[pageChildLen];
                width = Math.round(Math.round((pageChildItem.getAttribute('data-width') / winDpi) * 1000) / 1000);
                height = Math.round(Math.round((pageChildItem.getAttribute('data-height') / winDpi) * 1000) / 1000);
                pageChildItem.removeAttribute('data-width');
                pageChildItem.removeAttribute('data-height');
                self.utils.setStyle(pageChildItem, {'width': width + 'px', 'height': height + 'px'});
            }

        }

        box.setAttribute('data-boxHeight', pageTop)          //保存页面总高度
        page = null, pageChild = null, pageChildItem = null

    }

    /**
     * 
     * @param {Array} box 漫画页面列表
     */
    _collectConfig(box) {

        let self = this

        let configGroup = [], resourceGroup = []  //配置数组，资源数组
        let list, listLen
        let page, pageResource
        let pageChild, pageChildLen, childList

        list = box || self.pageArray
        listLen = list.length

        for (let i  = 0; i < listLen; i++) {     //遍历.page，逐页按顺序收集动画配置和页面图片资源，此处不包含动画需要的资源
            
            page = list[i]
            pageChild = page.children || self.utils.getChildList(page)
            pageChildLen = pageChild.length
            pageResource = {                    //单个资源的参数
                id: i,
                status: 0,
                list: []
            }

            getConfig(page, 'data-bgm', i)     //收集绑定在.page的bgm
            getConfig(page, 'data-animal', i)  //收集绑定在.page的动画
            getImage(page, pageResource)       //收集绑定在.page的资源

            for (let j = 0; j < pageChildLen; j++) {        //遍历.page子元素，多为img，少数div 

                getConfig(pageChild[j], 'data-animal', i)   //收集绑定在子元素的动画
                getImage(pageChild[j], pageResource)        //收集绑定在资源的资源

                childList = pageChild[j].children || self.utils.getChildList(pageChid[j])

                if (childList) {                            //若有第三层div存在，则遍历收集其中的动画和资源

                    for (let m = 0; m < childList.length; m++) {

                        getConfig(childList[m], 'data-animal', i)
                        getImage(childList[m], pageResource)

                    }

                }

            }

            resourceGroup.push(pageResource)               //以页为单位收集资源并保存

        }

        for (let i = 0; i < configGroup.length; i++) {    //提取动画配置中需要的资源
            let animateConfig, index, srcCore

            animateConfig = configGroup[i]
            index = animateConfig.id

            srcCore = {
                type: "",
                loaded: false,
                src: ""
            }
            
            switch (animateConfig.type) {
                case 'music': {
  
                    animateConfig.config.music.url.forEach(src => {
                        srcCore.type = "music"
                        srcCore.src = src
                        resourceGroup[index].list.push(srcCore)
                    })

                    break
                }
                case 'gif': {

                    animateConfig.config.gif.url.forEach(src => {
                        srcCore.type = "image"
                        srcCore.src = src
                        resourceGroup[index].list.push(srcCore)
                    })

                    break
                }
                case 'swing': {

                    srcCore.type = "image"
                    srcCore.src = animateConfig.config.swing.imgSrc
                    resourceGroup[index].list.push(srcCore)
                    break
                }
                default: break
            }

        }

        self.animates = configGroup
        self.resource.box = resourceGroup

        /**
         * 
         * @param {Object} dom 绑定有图片资源的节点
         * @param {Obejct} pageResource 所属页面的资源列表
         * 获取格式化后绑定在节点元素上的图片资源
         */
        function getImage(dom, pageResource) {
            let src
            src = dom.getAttribute('data-src')
            if (src) {
                pageResource.list.push({
                    type: "image",
                    loaded: false,
                    src: src
                })

                // dom.setAttribute('src', src)     //此语句在后续加入滑动控制后应删除，此处是便于当前调试
                // dom.removeAttribute('data-src')  //同上
            }
        }

        /**
         * 
         * @param {Object} dom 绑定有动画配置的节点
         * @param {String} str 配置标志，bgm配置或动画配置
         * @param {Number} i 该项配置所属页面索引
         */
        function getConfig(dom, str, i) {

            let config = dom.getAttribute(str)
            let format = {     //格式化的单项动画配置
                id: i,
                ele: dom,
                status: 0, 
                top: 0, 
                bottom: 0,
                type: "",
                config: {}
            }

            if (config) {
                config = config.replace(/\'/gim, '"');
                config = JSON.parse(config)
            } else {
                return     
            }

            if (str == 'data-bgm') {
                format.type = "music"
                for(let item in config) {
                    format.config = {
                        type: 0,
                        delay: 0,
                        speed: 0,
                        music: config[item]
                    }
                    configGroup.push(format)
                }
            } else {
                for (let item in config) {
                    if (config[item].transform || config[item].animation || config[item].opacity){
                        format.type = "animate"
                    } else if (config[item].gif) {
                        format.type = "gif"
                    } else if (config[item].swing) {
                        format.type = "swing"
                    } else if (config[item].full) {
                        format.type = "full"
                    } else if (config[item].music) {
                        format.type = "music"
                    }
                    format.config = config[item]
                    configGroup.push(format)
                }
            }
            
            dom.removeAttribute(str)
        }

    }

    /**
     * 
     * @param {Array} list 动画池列表
     * 计算动画的初始高度和结束高度
     */
    _computeAnimates(list) {
        
        let self = this

        let screenHeight = self.utils.height
        let page, pageIndex, pageArray = self.pageArray
        let start, end, config, last

        list.forEach( (animate, i) => {  //遍历动画池，对单个动画进行计算，引入i是因为动画类实例化后需要对列表元素进行覆盖

            start = end = 0

            pageIndex = animate.id
            page = pageArray[pageIndex]

            config = animate.config

            //起始高度与结束高度计算
            if (animate.type == "music" && animate.config.music.newTeam) {       //bgm的计算方式与其他动画计算方式不同

                let startPage, endPage, startDelay, endDelay, startRect, endRect

                startPage = animate.config.music.newTeam[0]
                endPage = animate.config.music.newTeam[1]
                
                startPage = !startPage ? pageIndex : pageIndex + startPage
                endPage = startPage + endPage

                startRect = self.utils.getStyleRect(pageArray[startPage])
                endRect = self.utils.getStyleRect(pageArray[endPage])

                startDelay = animate.config.music.startTop
                endDelay = animate.config.music.endTop
                if (!startDelay) startDelay = 0
                if (!endDelay) endDelay = 0

                start = startRect.top + startDelay * startRect.height
                end = endRect.top + endDelay * endRect.height


            } else {

                switch (config.type) {    //type定义起始高度
                    case 0: {             //所属page的起点top

                        start = self.utils.getStyleRect(page).top
                        break
                    }
                    case 1: {            //所属元素的起点top

                        start = self.utils.getStyleRect(page).top
                        break
                    }
                    case 2: {            //同个元素的上一个动画的初始top，跟上一个动画同时播放
                        if (last.ele != animate.ele) {
                            start = self.utils.getStyleRect(page).top
                        } else {
                            start = last.top
                        }
                        break
                    }
                    case 3: {          //同个元素的上一个动画的结束bottom，上一个动画结束后接着播放
                        if (last.ele == animate.ele) {
                            start = last.bottom
                        } else {
                            start = self.utils.getStyleRect(page).top
                        }
                         break
                    }
                    default: {
                        start = -1
                        break
                    }
                }
                
                switch (config.delay) {   //delay定义初始top，延迟距离根据可视屏幕高度换算
                    case 0: break         //不延迟
                    case 1: {             //固定延迟
                        start = start + screenHeight * 0.05
                        break
                    }
                    case 2: {
                        start = start + screenHeight * 0.1
                        break
                    }
                    case 3: {
                        start = start + screenHeight * 0.2
                        break
                    }
                    case 4: {
                        start = start + screenHeight * 0.35
                        break
                    }
                    case 5: {
                        start = start + screenHeight * 0.6
                        break
                    }
                    default: {            //delay为[0,1]，自定义延迟高度
                        start = start + screenHeight * (config.delay / 100)
                        break
                    }
                }
    
                switch (config.speed) {  //speed定义结束bottom，根据可视屏幕换算
                    case 0: {            //固定距离
                        end = start + screenHeight
                        break
                    }
                    case 1: {
                        end = start + screenHeight * 0.8
                        break
                    }
                    case 2: {
                        end = start + screenHeight * 0.6
                        break
                    }
                    case 3: {
                        end = start + screenHeight * 0.4
                        break
                    }
                    case 4: {
                        end = start + screenHeight * 0.2
                    }
                    default: {         //speed为[0,100]，自定义距离
                        end = start + screenHeight * (config.speed/100)
                        break
                    }
                }

            }

            animate.top = Math.round(start)
            animate.bottom = Math.round(end)

            // switch (animate.type) {  //实例化各类动画
            //     case 'music': {
            //         list[i] = new Music(animate)
            //         break
            //     }
            //     case 'animate': {
            //         list[i] = new Animate(animate)
            //         break
            //     }
            //     case 'gif': {
            //         list[i] = new Gif(animate)
            //         break
            //     }
            //     case 'swing': {
            //         list[i] = new Swing(animate)
            //         break
            //     }
            //     case 'full': {
            //         list[i] = new Full(animate)
            //         break
            //     }
            //     default: {
            //         list[i] = null
            //         break
            //     }
            // }



            last = animate

        } )

        list.sort((a, b) => {   //按初始触发高度递增排序，初始高度相同，则按结束高度递增排序
            if (a.top == b.top) {
                return a.bottom - b.bottom
            } else {
                return a.top - b.top
            }
        })
    }

}