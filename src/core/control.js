import Music from './music'
import Scroll from './scroll'
import Resource from './resource'
import utils from './utils'

export default class Control {
    constructor(config) {

        this.basePoint = 0
        this.basePointTop = 0

        this.dom = document.querySelector(config.dom)
        
        this.pageArray = []

        this.status = 0

        this.activeIndex = 0
        
        this.animateActive = []
        this.animates = {}

        this.resource = new Resource()

        this.scroll = new Scroll()

        this.utils = utils

        this._currentTop = 0

        this.init(config.dom)
    }
    init(ele) {
       let self = this

       let getStyle = window.getComputedStyle;

       let animateBox = ele.firstElementChild || ele.children[0]
       let loadBox = animateBox.firstElementChild || animateBox.children[0]
       let animateContent = loadBox.nextElementSibling || animateBox.children[1]
       let otherBox = animateContent.nextElementSibling || animateBox.children[2]

       //let otherBoxList = otherBox.querySelectorAll('.ot-page-img')

       let musicBtnBox = animateBox.nextElementSibling || ele.children[1]

       //self.otherItemBox.list = otherBoxList

       //let loadBoxRect = self.utils.getRect(loadBox)
       //let loadHeight = loadBoxRect.height

       self.basePoint = animateBox.getAttribute('data-screen')
       self.basePointTop = self.scroll.top + self.basePoint * self.utils.height
       animateBox.removeAttribute('data-screen')

       //self.options.animalBox = animalBox;                         // 全局存储大盒子
       //self.options.animalDtBoxWidth = animalBox.offsetWidth;
       //self.options.initBackgourund = animalBox.style.background;

       //musicBtnBox.style.opacity = 0;						// 音乐按钮先隐藏
       //loadBox.style.zIndex = 0;							// 把loading效果降级

        self.pageArray = animateContent.children || self.utils._getChildList(animateContent)

        self._computePanel(animateContent)

        self._collectConfig(pages) 

    }
    
    _computePanel(box) {

        let self = this

        let winDpi, width, height
        let pageList, pageLen, pageTop, page, pageChild, pageChildLen, pageChildItem

        pageList = box.children || self.utils._getChildList(box)
        pageLen = pageList.length

        winDpi = Math.round((box.getAttribute('data-width') / box.offsetWidth) * 1000) / 1000

        width = box.getAttribute('data-width')
        height = box.getAttribute('data-height')
        box.removeAttribute('data-width')
        box.removeAttribute('data-height')
        box.removeAttribute('data-top')
        if (width) {
            width = Math.round(Math.round((width / winDpi) * 1000) / 1000)
        } else {
            width = 0
        }
        if (height) {
            height = Math.round(Math.round((height / winDpi) * 1000) / 1000)
        } else {
            height = 0
        }

        pageTop = 0

        for (let i = 0; i < pageLen; i++) {
            page = pageList[i]
            width = Math.round(Math.round((page.getAttribute('data-width') / winDpi) * 1000) / 1000);
            height = Math.round(Math.round((page.getAttribute('data-height') / winDpi) * 1000) / 1000);
            page.removeAttribute('data-top');
            page.removeAttribute('data-width');
            page.removeAttribute('data-height');

            that._setStyle(page, {'top': pageTop + 'px', 'width': width + 'px', 'height': height + 'px'});
            pageTop += height;

            pageChild = page.querySelectorAll('*');
            pageChildLen = pageChild.length;
            while (pageChildLen--) {
                pageChildItem = pageChild[pageChildLen];
                width = Math.round(Math.round((pageChildItem.getAttribute('data-width') / winDpi) * 1000) / 1000);
                height = Math.round(Math.round((pageChildItem.getAttribute('data-height') / winDpi) * 1000) / 1000);
                pageChildItem.removeAttribute('data-width');
                pageChildItem.removeAttribute('data-height');
                that._setStyle(pageChildItem, {'width': width + 'px', 'height': height + 'px'});
            }
        }

        box.setAttribute('data-boxHeight', pageTop)
        page = null, pageChild = null, pageChildItem = null

    }

    _collectConfig(box) {

        let self = this

        let configGroup = [], resourceGroup = []
        let list, listLen
        let page, pageResource
        let pageChild, pageChildLen, childList

        list = box || self.pageArray
        listLen = list.length

        for (let i  = 0; i < listLen; i++) {
            
            page = list[i]
            pageChild = page.children || self.utils._getChildList(page)
            pageChildLen = pageChild.length
            pageResource = {
                id: i,
                status: 0,
                list: []
            }

            getConfig(page, 'data-bgm', i)
            getConfig(page, 'data-animal', i)
            getImage(page, pageResource)

            for (let j = 0; j < pageChildLen; j++) {

                getConfig(pageChid[j], 'data-animal', i)
                getImage(pageChild[j], pageResource)

                childList = pageChid[j].children || self.utils._getChildList(pageChid[j])

                if (childList) {

                    for (let m = 0; m < childList.length; m++) {

                        getConfig(childList[m], 'data-animal', i)
                        getImage(childList[m], pageResource)

                    }

                }

            }

            resourceGroup.push(pageResource)

        }

        for (let i = 0; i < configGroup.length; i++) {
            let animateConfig, index, srcCore

            animateConfig = configGroup[i]
            index = animateConfig.id

            srcCore = {
                type: "",
                src: ""
            }
            
            switch (animateConfig.type) {
                case 'music': {

                    animateConfig.config.url.forEach(src => {
                        srcCore.type = "music"
                        srcCore.src = src
                        resourceGroup[index].list.push(srcCore)
                    })

                    break
                }
                case 'gif': {

                    animateConfig.config.url.forEach(src => {
                        srcCore.type = "image"
                        srcCore.src = src
                        resourceGroup[index].list.push(srcCore)
                    })

                    break
                }
                case 'swing': {

                    srcCore.type = "image"
                    srcCore.src = animateConfig.config.imgSrc
                    resourceGroup[index].list.push(srcCore)
                    break
                }
                default: break
            }

        }

        self.animates = configGroup
        self.resource.box = resourceGroup

        function getImage(dom, pageResource) {
            let src
            src = dom.getAttribute('data-src')
            if (src) {
                pageResource.list.push({
                    type: "image",
                    src: src
                })
            }
        }
        function getConfig(dom, str, i) {

            let config = dom.getAttribute(str)
            let type
            let format = {
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
                format.config = config
                configGroup.push(format)
            } else {
                for (let item in config) {
                    if (item.transform || item.animation || item.opacity){
                        format.type = "animate"
                    } else if (item.gif) {
                        format.type = "gif"
                    } else if (item.swing) {
                        format.type = "swing"
                    } else if (item.full) {
                        format.type = "full"
                    } else if (item.music) {
                        format.type = "music"
                    }
                    format.config = item
                    configGroup.push(format)
                }
            }
            
            dom.removeAttribute(src)
        }

    }

}