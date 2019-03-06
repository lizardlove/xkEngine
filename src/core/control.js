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
        this.pageActive = []                             //处于屏幕可视区域的page列表
        
        this.animateActive = []                          //处于以当前屏幕为中心，往上两个可视屏幕，往下两个可视屏幕，此范围内的活动动画索引列表
        this.animates = []                               //动画列表，列表元素为实例化动画对象，其中包括音乐对象

        this.resource = new Resource()                   //资源控制器，主要用于资源的控制和预加载

        this.utils = utils                               //浏览器相关属性及与动画无关的工具函数

        this.scroll = new Scroll(utils)                  //滑动控制器，主要用于滑动的控制，滑动相关参数的计算

        this.musicPlay = true                            //是否允许播放音乐
        
        this.domBox = {}                                 //存储上层DOM节点

        this._loadAnimation(utils.document.querySelector('#dt-loadBox'))
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

       //self._loadAnimation(loadBox)                                                  //执行加载动画
       let animateContent = loadBox.nextElementChild || animateBox.children[1]       //漫画内容盒子
   
       let otherBox = animateContent.nextElementSibling || animateBox.children[2]  //其他内容盒子，页面菜单             

       let musicBtnBox = animateBox.nextElementSibling || ele.children[1]          //音乐按钮

       self.basePoint = animateBox.getAttribute('data-screen')                      //页面基准触发点
       self.basePointTop = self.scroll.top + self.basePoint * self.utils.height
       animateBox.removeAttribute('data-screen')

       self.domBox = {
           animate: animateBox,
           load: loadBox,
           content: animateContent,
           other: otherBox,
           music: musicBtnBox
       }

       //获取漫画内容 页面列表
        self.pageArray = animateContent.children || self.utils.getChildList(animateContent)

        self._computePanel(animateContent)       //初始化漫画页面绝对高度计算

        self._collectConfig(self.pageArray)      //解析dom结构，收集动画，音乐配置，分类资源

        self._computeAnimates(self.animates)     //计算动画的触发高度和结束高度，并实例化各类动画

        self.prePlay()                           //页面状态调整，初始资源加载
        

    }
    /**
     *对页面各组件进行状态配置
     *
     * @memberof Control
     */
    prePlay() {

        let self = this

        let flag

        //音乐按钮设置
        self._musicBtnControl(self.domBox.music)

        //菜单按钮设置
        self._menuControl()

        //初始化活动对象
        self.domBox.content.style.height = self.domBox.content.getAttribute('data-boxHeight') + 'px'

        self.pageActive = self._modify(self.pageArray, self.pageActive, self.utils.scrollTop())

        self.animateActive = self._modify(self.animates, self.animateActive, self.utils.scrollTop())

        flag = self.resource.load(self.pageActive)

       
        //self.utils.requestAnimationFrame(judge)

        //绑定滑动事件
        self.scroll.initEvent(false, function (top) {
            
            let screenHeight = self.utils.height
            self.status = 1
            
            self.basePointTop = top + self.basePoint * screenHeight                   //触发点更新
            
            self.oldPageActive = self.pageActive                                      //活动组更新
            self.pageActive = self._modify(self.pageArray, self.pageActive, top)
            self.animateActive = self._modify(self.animates, self.animateActive, top)
            
            self.resource.load(self.pageActive)                                       //预加载资源

            self.play(top)                                                            //执行动画
            
        })

        function judge() {
            if (flag) {
                self.play(self.utils.scrollTop())
                self.domBox.load.style.display = "none"
                console.log('ok')
            } else {
                self.utils.requestAnimationFrame(judge)
            }
            
        }
        setTimeout(function () {
            self.utils.requestAnimationFrame(judge)
        }, 500)
    }

    /**
     *接收滑动高度，执行动画
     *
     * @param {Number} top 滑动高度
     * @memberof Control
     */
    async play(top) {
        
        let self = this

        self.pageActive.forEach(index => {

            let page = self.pageArray[index]

            if (!page.style.display) {
                flash(page)
            }

            page.style.display = "block"

        })

        await self.animateActive.forEach(index => {
            let animate = self.animates[index]
            switch (animate.type) {

                case 'music': {
                    if (animate.status == 2 && animate.top <= self.basePointTop && self.domBox.music.bool) {
                        animate.play()
                    } else {
                        animate.stop()
                    }
                    break
                }
                case 'animate': {
                    if (animate.status == 2 && animate.top <= self.basePointTop) {
                        animate.play(self.basePointTop)
                    } else {
                        animate.stop()
                    }
                    break
                }
                // case 'swing': {
                //     if (animate.status == 2 && animate.top < self.basePointTop) {
                //         animate.play()
                //     } else {
                //         animate.stop()
                //     }
                //     break
                // }
                // case 'full': {
                //     if (animate.status == 2 && animate.top < self.basePointTop) {
                //         animate.play()
                //     } else {
                //         animate.stop()
                //     }
                //     break
                // }
                // case 'gif': {
                //     if (animate.status == 2 && animate.top < self.basePointTop) {
                //         animate.play()
                //     } else {
                //         animate.stop()
                //     }
                //     break
                // }
                default: break


            }
            
        })

        /**
         *控制page显示
         *
         * @param {Object} page 页对象
         */
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
                let grandChild = child[i].children || self.utils.getChildList(child[i])
                if (grandChild) {
                    for (let j = 0; j < grandChild.length; j++) {
                        src = grandChild[j].getAttribute('data-src')
                        if (src) {
                            grandChild[j].setAttribute('src',src)
                        }
                    }
                }
            }
        }
    }
    
    /**
     *加载屏动画设置
     *
     * @param {Object} load DOM元素，用于加载动画的显示
     * @memberof Control
     */
    _loadAnimation(load) {

        let self = this

        let loadEl = '<img class="xk-load-anim" src="//ac.gtimg.com/h5_hd/MotionComic/public/loading.gif"><p class="xk-load-txt">漫画绘制中...</p>'
        load.innerHTML = load.innerText = loadEl
        let txtInfo = document.querySelector('.xk-load-txt')
        let infoList = ['动效生成中...','音效生成中... ']
        let index = 0

        setTimeout(function () {
            txtInfo.innerHTML = infoList[index]
            index = (index++) % 2
            setTimeout(function () {
                txtInfo.innerHTML = infoList[index]
                index = (index++) % 2
            }, Math.random()*2000)
        }, Math.random()*2000)


    }

    /**
     *页面右上角音乐按钮的控制
     *
     * @param {Object} music 音乐按钮DOM
     * @memberof Control
     */
    _musicBtnControl(music) {
        let self = this

        let utils, btn, onBtn, offBtn, startX = 0, startY = 0

        utils = self.utils
        btn = self.domBox.music
        onBtn = music.querySelector('#music_box_on')
        offBtn = music.querySelector('#music_box_off')

        if (btn) {
            utils.addClass(onBtn, 'music_display')
            utils.addClass(offBtn, 'music_display')

            if (!utils.browser.versions.mobile) {
                self.domBox.music.bool = false
            } else {
                self.domBox.music.bool = true
            }
            display(self.domBox.music.bool)
            musicEvents(true)
        }



        function display(bool) {
        
            if (bool) {
                utils.removeClass(onBtn, 'music_hidden')
                utils.addClass(offBtn, 'music_hidden')
            } else {
                utils.addClass(onBtn, 'music_hidden')
                utils.removeClass(offBtn, 'music_hidden')
            }

        }

        function musicEvents(remove, callback) {
            let events = remove ? utils.addEvent : utils.removeEvent

            if (utils.hasTouch) {
                events(btn, 'touchstart', start, true)
                events(btn, 'touchmove', move, true)
                events(btn, 'touchend', end, true)
            } else if (utils.hasPointer) {
                events(btn, utils.prefixPointerEvent('pointerdown'), start, true)
                events(btn, utils.prefixPointerEvent('pointermove'), move, true)
                events(btn, utils.prefixPointerEvent('pointerup'), end, true)
            } else {
                events(btn, 'mousedown', start, true)
                events(btn, 'mousemove', move, true)
                events(btn, 'mouseup', end, true)
            }

            function start(e) {
                let touch = e.touches ? e.touches[0] : e
                e.stopPropagation()
                startX = touch.pageX
                startY = touch.pageY
            }

            function move(e) {
                let touch = e.touches ? e.touches[0] : e

                e.stopPropagation()
                startX = touch.pageX
                startY = touch.pageY
            }

            function end(e) {
                let touch, endX, endY

                touch = e.changedTouches ? e.changedTouches[0] : e
                endX = touch.pageX
                endY = touch.pageY

                e.stopPropagation()
                if ( Math.abs(startX - endX) < 8 || Math.abs(startY - endY) < 8 ) {
                    if (self.domBox.music.bool) {
                        self.domBox.music.bool = false
                        display(false)
                        changePlayState(false)
                    } else {
                        self.domBox.music.bool = true
                        display(true)
                        changePlayState(true)
                    }
                }
            }
        }

        function changePlayState(bool) {

            self.animateActive.forEach(index => {

                let animate = self.animates[index]

                if (animate.type == 'music' && animate.status == 2 && animate.top <= self.basePointTop) {
                    if (!bool) {
                        animate.pause()
                    } else {
                        animate.play()
                    }
                    
                }
            })
        }
    }

    /**
     *页面控制菜单
     *
     * @memberof Control
     */
    _menuControl() {
        
        let self = this

        let utils, container, events, topTool, bottomTool, cancelInfo, startX, startY, startTime, endTime, isMove, scrollTop, menu

        utils = self.utils
        container = self.ele
        events = utils.addEvent
        menu = utils.document.createElement('div')
        topTool = utils.document.createElement('div')
        bottomTool = utils.document.createElement('div')
        cancelInfo = utils.document.createElement('div')

        topTool.innerHTML = '<a id="dtw-tool-back" class="xk-float-btn-style xk-float-btn-back"><i>返回</i></a><a id="xk-love" class="xk-love"></a>'
		bottomTool.innerHTML = '<a id="dtw-tool-pre" class="xk-bttom-btn-style xkw-bttom-pre"><i>上一话</i></a><a id="dtw-tool-home" class="xk-bttom-btn-style xk-bttom-list">目录</a><a id="dtw-tool-next" class="xk-bttom-btn-style xk-bttom-next"> <i>下一话</i></a>'
        cancelInfo.innerHTML ='<img class="xk-info-bg" src="//ac.gtimg.com/h5_hd/MotionComic/public/xk-alert-bg.png"><img class="xk-info-anim" src="//ac.gtimg.com/h5_hd/MotionComic/public/xk-alert-anim.png"><img class="xk-info-subscribe xk-info-select" src="//ac.gtimg.com/h5_hd/MotionComic/public/xk-alert-subscribe.png"><img class="xk-info-unsubscribe xk-info-select" src="//ac.gtimg.com/h5_hd/MotionComic/public/xk-alert-unsubscribe.png">'
        
        menu.appendChild(topTool)
		menu.appendChild(bottomTool)
		utils.addClass(cancelInfo,'xk-infoPanel')
		utils.addClass(topTool,'xk-float-bar xk-top xk-hidden')
		utils.addClass(bottomTool,'xkw-bottom-menu xk-bottom-hidden')
		utils.document.querySelector('body').appendChild(menu)
        utils.document.querySelector('body').appendChild(cancelInfo)
        
        if(topTool || bottomTool){
            if(utils.hasTouch){
                events(container, 'touchstart', start)
                events(container, 'touchmove', move)
                events(container, 'touchend', end)
            }else if(utils.hasPointer){
                events(container, utils.prefixPointerEvent('pointerdown'), start)
                events(container, utils.prefixPointerEvent('pointermove'), move)
                events(container, utils.prefixPointerEvent('pointerup'), end)
            }else {
                events(container, 'mousedown', start)
                events(container, 'mousemove', move)
                events(container, 'mouseup', end)
			}
        }

        postInfo()
        
		function start(e) {
            let touch = e.touches ? e.touches[0] : e

            e.stopPropagation()
            startX = touch.pageX
            startY = touch.pageY
            startTime = utils.getTime()
            scrollTop = utils.scrollTop()
            isMove = false
        }

		function move(e) {
            let newScrollTop = utils.scrollTop()

            e.stopPropagation()
            if( newScrollTop == scrollTop ){
            	isMove = false
            	return
            }
            if(!utils.hasClass(topTool,'xk-hidden')){
                utils.addClass(topTool,'xk-hidden')
            }
            isMove = true
            scrollTop = newScrollTop
        }

        function end(e) {
            let touch = e.changedTouches ? e.changedTouches[0] : e
            let endObj = {
                _x: Math.abs(touch.pageX -startX),
                _y: Math.abs(touch.pageY -startY),
                _time: utils.getTime() - startTime,
            }

            e.stopPropagation()
            if( endObj._time <= 300 && endObj._x <= 30 && endObj._y <= 30 && !isMove ){
                if(utils.hasClass(topTool,'xk-hidden')){
                    utils.removeClass(topTool,'xk-hidden')
                    endTime = utils.getTime()
                    display()
				}else{
                    utils.addClass(topTool,'xk-hidden')
				}

                if(utils.hasClass(bottomTool,'xk-bottom-hidden')){
                    utils.removeClass(bottomTool,'xk-bottom-hidden')
                    endTime = utils.getTime()
                    display()
                }else{
                    utils.addClass(bottomTool,'xk-bottom-hidden')
                }

			}
        }

        //菜单栏的显隐控制
        function display() {
            let newTimer = utils.getTime()

            if (endTime == null && (topTool || bottomTool)) return 
            if (newTimer - endTime > 2500) {
                newTimer = null
                endTime = null
                utils.addClass(topTool, 'xk-hidden')
                utils.addClass(bottomTool, 'xk-bottom-hidden')
                return
            }

            utils.requestAnimationFrame(display)

        }


        function postInfo() {
            let xhr, t, chapter, comic

            xhr = new XMLHttpRequest
            t = window.location.href.split("/")
            chapter = +t[t.length - 1].split(".")[0]
            comic = t[t.length - 2]

            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    let data, pre, next, back, home

                    data = JSON.parse(xhr.responseText).data
                    pre = utils.document.querySelector('#dtw-tool-pre')
                    next = utils.document.querySelector('#dtw-tool-next')
                    back = utils.document.querySelector('#dtw-tool-back')
                    home = utils.document.querySelector('#dtw-tool-home')

                    back.href = `/event/MotionComic/detail.shtml?comic=${comic}`
                    home.href = `/event/MotionComic/detail.shtml?comic=${comic}`
                    
                    if (chapter - 1 < 1) {
                        pre.style = "visibility: hidden"
                    } else {
                        pre.href = `/event/MotionComic/${comic}/${chapter - 1}.html`
                    }

                    if (chapter + 1 > data.length) {
                        next.style = "visibility: hidden"
                    } else {
                        next.href = `/event/MotionComic/${comic}/${chapter + 1}.html`
                    }
                }
            }

            xhr.open('GET', `../action.php?action=chapter&comic=${comic}`, true)
            xhr.send()

        }

    }


    /**
     * 通过滑动高度更新活动集合，处于活动范围内的对象标记位活动对象
     * @param {Array} objects 同类对象集合
     * @param {Array} active  活动对象集合
     * @param {Number} top    当前滑动高度
     */
    _modify(objects, active, top) {
        let self = this
        let ac = []
        let startIn, startPre, endIn, endPre, screenHeight
        let rect, index, bottom

        screenHeight = self.utils.height

        startIn = top
        startPre = top - screenHeight  * 4
        startPre = startPre < 0 ? 0 : startPre

        endIn = top + screenHeight
        endPre = top + screenHeight * 4

        active.forEach(index => {
            rect = self.utils.isDom(objects[index]) ? self.utils.getStyleRect(objects[index]) : objects[index]
            bottom = rect.bottom ? rect.bottom : rect.top + rect.height
            if ( (bottom > startPre && bottom < startIn) || (rect.top > endIn && rect.top < endPre) ) {
                objects[index].status = 1
                ac.push(index)
            } else if (bottom > startIn && rect.top < endIn) {
                
                objects[index].status = 2
                ac.push(index)
            } else {
                objects[index].status = 0
            }
        })

        index = ac[ac.length -1] + 1
        index = index ? index : 0
        for (let i = index; i < objects.length; i++) {
            rect = self.utils.isDom(objects[i]) ? self.utils.getStyleRect(objects[i]) : objects[i]
            bottom = rect.bottom ? rect.bottom : rect.top + rect.height

            if ( (bottom > startPre && bottom < startIn) || (rect.top > endIn && rect.top < endPre) ) {
                objects[i].status = 1
                ac.push(i)
            } else if (bottom > startIn && rect.top < endIn) {
                objects[i].status = 2
                ac.push(i)
            } else {
                objects[i].status = 0
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
            page.removeAttribute('data-height');

            self.utils.setStyle(page, {'top': pageTop + 'px', 'width': width + 'px', 'height': height + 'px'});
            pageTop += height;

            pageChild = page.querySelectorAll('*');
            pageChildLen = pageChild.length;
            while (pageChildLen--) {                         //第三层内容
                pageChildItem = pageChild[pageChildLen];
                width = Math.round(Math.round((pageChildItem.getAttribute('data-width') / winDpi) * 1000) / 1000);
                height = Math.round(Math.round((pageChildItem.getAttribute('data-height') / winDpi) * 1000) / 1000);
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
                loaded: 0,
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
                    loaded: 0,
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
                    let format = {     //格式化的单项动画配置
                        id: i,
                        ele: dom,
                        status: 0, 
                        top: 0, 
                        bottom: 0,
                        type: "",
                        config: {}
                    }
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

            switch (animate.type) {  //实例化各类动画
                case 'music': {
                    list[i] = new Music(animate)
                    break
                }
                case 'animate': {
                    list[i] = new Animate(animate)
                    break
                }
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
                // default: {
                //     list[i] = null
                //     break
                // }
            }



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