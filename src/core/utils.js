let utils = {}
let doc = document || window.document

let requestAnimationFrame, cancelAnimationFrame, isBadAndroid

let _eleStyle = doc.createElement('div').style
let u = navigator.userAgent
let _hasAttr = (function () {
    let hasAttr = ['t','webkitT','MozT','msT','OT'],
        _attr,
        i = 0,
        len = hasAttr.length
    for(; i<len; i++){
        _attr = hasAttr[i] + 'ransform'
        if(_attr in _eleStyle) return hasAttr[i].substr(0,hasAttr[i].length-1)
    }
    return false
})()

function _prefixStyle(style) {
    if(_hasAttr === false) return false;
    if(_hasAttr === '') return style;
    return _hasAttr + style.charAt(0).toUpperCase() + style.toLowerCase().substr(1);
};

//自执行函数运行一些兼容浏览器的方法
(function () {
    let lastTime = 0,
        i = 0,
        vendors = ['webkit', 'moz', 'ms'],
        len = vendors.length

    let appVersion

    for(; i < len && !window.requestAnimationFrame; i += 1) {
        requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame']
        cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'] || window[vendors[i] + 'CancelRequestAnimationFrame']
    }
    if(!requestAnimationFrame || !cancelAnimationFrame) {
        requestAnimationFrame = function(callback, element) {
            let currTime = +new Date,
                timeToCall = Math.max(0, 16.7 - currTime + lastTime),
                id = window.setTimeout(function() {
                    callback(currTime + timeToCall)
                }, timeToCall)
            lastTime = currTime + timeToCall
            return id
        };
        cancelAnimationFrame = function(id) {
            clearTimeout(id)
        }
    }

    if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
        let safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
        if(safariVersion && typeof safariVersion === "object" && safariVersion.length >= 2) {
            isBadAndroid = parseFloat(safariVersion[1]) < 535.19;
        } else {
            isBadAndroid = true;
        }
    } else {
        isBadAndroid = false;
    }

})()

utils =  {

    window: window,                                                          //保存浏览器顶层全局对象
    document: document,                                                      //保存浏览器文档对象

    height: window.innerHeight,                                              //浏览器可视区域高度
    width: window.innerWidth,                                                //浏览器可视区域宽度

    requestAnimationFrame: requestAnimationFrame,
    cancelAnimationFrame: cancelAnimationFrame,

    getTime: Date.now || function getTime() {return new Date().getTime()},  

    hasTransform: _prefixStyle('transform') !== false,
    hasPerspective: _prefixStyle('perspective') in _eleStyle,
    hasTouch: 'ontouchstart' in window,
    hasPointer: !!(window.PointerEvent || window.MSPointerEvent),
    hasTransition: _prefixStyle('transition') in _eleStyle,

    isBadAndroid: isBadAndroid,                                             //判断移动端平台

    browser: {
        versions: {
            mobile: !!u.match(/.*Mobile.*/), //是否为移动终端
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/)||!!u.match(/AppleWebKit/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
            iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        }
    },

    style: {                                                                //浏览器是否支持某些css属性

        transform: _prefixStyle('transform'),
        transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
        transitionDuration: _prefixStyle('transitionDuration'),
        transitionDelay: _prefixStyle('transitionDelay'),
        transformOrigin: _prefixStyle('transformOrigin'),
        touchAction: _prefixStyle('touchAction'),

        animation: _prefixStyle('animation'),
        animationName: _prefixStyle('animationName'),
        animationDuration: _prefixStyle('animationDuration'),
        animationTimingFunction: _prefixStyle('animationTimingFunction'),
        animationDelay: _prefixStyle('animationDelay'),
        animationIterationCount: _prefixStyle('animationIterationCount'),
        animationDirection: _prefixStyle('animationDirection'),
        animationPlayState: _prefixStyle('animationPlayState'),
        animationFillMode: _prefixStyle('animationFillMode')

    },

    scrollTop() {                                                          //获取当前滑动高度
        return Math.round(document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop)
    },

    isDom(obj) {
        return ( typeof HTMLElement === 'object' ) ?
               obj instanceof HTMLElement:
               obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string'
    },

    /**
     * 
     * @param {Object} el 节点元素
     * 获取节点的顶部偏移和左偏移
     */
    offset(el) { 
        let left = -el.offsetLeft,
            top = -el.offsetTop

        while(el = el.offsetParent) {
            left -=el.offsetLeft
            top -= el.offsetTop
        }

        return {
            left: left,
            top: top
        }
    },

    /**
     *判断一个节点是否具有某个类名
     * @param {Object} ele DOM节点
     * @param {String} c 类名
     * @returns Boolean
     */
    hasClass(ele, c) {

        let re = new RegExp("(^|\\s)" + c + "(\\s|$)")

        return re.test(ele.className)
    },

    /**
     * 给元素添加类名
     * @param {Object} ele DOM节点
     * @param {String} c 类名
     */
    addClass(ele, c) {
        
        let self = this
        let newclass = ele.className.split(' ')

        if ( self.hasClass(ele, c) ) {
            return 
        }

        newclass.push(c)

        ele.className = newclass.join(' ')
    },

    /**
     * 移出元素类名
     * @param {Object} ele DOM节点
     * @param {String} c 类名 
     */
    removeClass(ele, c) {

        let self = this

        if ( !self.hasClass(ele, c) ) {
            return
        }

        let reg = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g')
        ele.className = ele.className.replace(reg, ' ')
    },

    /**
     * 
     * @param {Object} el 目标DOM节点
     * @param {String} type 绑定事件名称
     * @param {Function/Object} fn 回调函数，也可用对象，可以动态修改回调函数 
     * @param {Boolean} capture 是否捕获
     */
    addEvent(el, type, fn, capture) {
        el.addEventListener(type, fn, !!capture)
    },

    /**
     * 
     * @param {Object} el 目标DOM节点
     * @param {String} type 绑定事件名称
     * @param {Function/Object} fn 回调函数，也可用对象，可以动态修改回调函数 
     * @param {Boolean} capture 是否捕获
     */
    removeEvent(el, type, fn, capture) {
        el.removeEventListener(type, fn, !!capture)
    },

    /**
     * 
     * @param {Object} pointerEvent 指针事件对象 
     */
    prefixPointerEvent(pointerEvent) {
        return window.MSPointerEvent ?
        'MSPointer' + pointerEvent.charAt(7).toUpperCase() + pointerEvent.substr(8):
        pointerEvent;
    },

    /**
     * click兼容事件
     * @param {Object} e 事件对象 
     */
    click(e) {
        let target = e.target, ev

        if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
            // initMouseEvent is deprecated.
            ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
            ev.initEvent('click', true, true);
            ev.view = e.view || window;
            ev.detail = 1;
            ev.screenX = target.screenX || 0;
            ev.screenY = target.screenY || 0;
            ev.clientX = target.clientX || 0;
            ev.clientY = target.clientY || 0;
            ev.ctrlKey = !!e.ctrlKey;
            ev.altKey = !!e.altKey;
            ev.shiftKey = !!e.shiftKey;
            ev.metaKey = !!e.metaKey;
            ev.button = 0;
            ev.relatedTarget = null;
            ev._constructed = true;
            target.dispatchEvent(ev);
        }
    },

    /**
     * 
     * @param {Object} parentEle 父级元素
     * 获取父级元素的子节点元素
     */
    getChildList(parentEle) {
        var list = [];
        var child = parentEle.childNodes;
        for (var i in child) {
            if (child[i].nodeType == 1) {
                list[list.length] = child[i];
            }
        }
        return list;
    },

    /**
     * 
     * @param {Object} el 接受样式的Dom节点
     * @param {Object} tf 需要修改的样式及参数
     * 样式的增加  
     */
    setStyle(el, tf) {
        
        var sty = '';
        if (typeof tf === 'string') {
            sty = tf;
        } else if (typeof tf === 'object') {
            for (var s in tf) {
                sty += s + ':' + tf[s] + ';';
            }
        }
        el.style.cssText += ';' + sty;
    },

    /**
     * 
     * @param {Object} el DOM节点
     * 获取el节点的宽高, top, left
     */
    getStyleRect(el) {
        if (el instanceof SVGElement) {
            var rect = el.getBoundingClientRect();
            return {
                top : rect.top,
                left : rect.left,
                width : rect.width,
                height : rect.height
            };
        } else {
            return {
                top : el.offsetTop,
                left : el.offsetLeft,
                width : el.offsetWidth,
                height : el.offsetHeight
            };
        }
    },

    /**
     * 
     * @param {String} str 错误处理内容 
     */
    error(str) {
        throw Error(str)
    },

    /**
     * 消除字符串中的空格
     * @param {String} str 待处理字符串 
     */
    trim(str) {
        let whitespace = ' \n\r\t\x0b\xa0\u2000\u2001\u2002\u2003\n\
			\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u2030';
        for(let i = 0 ; i < str.length; i++){
            if(whitespace.indexOf(str.charAt(i) ) === -1){
                str = str.substring(i);
                break;
            }
        }
        for(i = str.length - 1; i>=0; i--){
            if(whitespace.indexOf(str.charAt(i) ) === -1){
                str = str.substring(0,i+1);
                break;
            }
        }
        return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
    }

}

export default utils
