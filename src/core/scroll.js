export default class Scroll {

    /**
     * 
     * @param {Object} utils 包括window对象在内的工具库 
     */
    constructor(utils) {
        
        this.top = 0           //当前的滑动高度
        this.lastTop = 0       //上一次的滑动高度
        this.direct = 1        //滑动方向 0：上，1：下，2：左，3：右
        this.event = null      //事件对象，兼容鼠标移动，移动端touch等事件

        this.options = {       //滑动控制的相关参数

            disableScroll: false,                                //是否允许滑动
            disablePointer: !utils.hasPointer,                   //PC端指针移动
            disableTouch: utils.hasPointer || !utils.hasTouch,   //移动端touch移动
            disableMouse: utils.hasPointer || utils.hasTouch,    //鼠标滑动
 
            startX: 0,                                           //本次移动的起始x
            startY: 0,                                           //本次移动的起始y
            scrollX: 0,                                          //本次移动的x方向移动距离
            scrollY: 0,                                          //本次移动的y方向移动距离

            bindToWrapper: typeof utils.window.onmousedown === "undefined"  
        }
                                                                 //绑定元素，默认window
        this.wrapper = typeof utils == 'string' ? utils.document.querySelector(utils) : utils.window;

        this._utils = utils                                      //挂载工具库

        this.callback = null                                     //外部绑定的回调函数
        
    }

    /**
     * 
     * @param {Boolean} remove 判断是绑定事件还是撤销事件
     * @param {Function} callback 外部绑定的回调函数
     */
    initEvent(remove, callback) {
        
        let self = this

        self.callback = callback

        if (callback && typeof callback !== 'function') {
            throw new Error('参数错误！传入的不是function')
            alert('参数错误！传入的不是function')
            return 
        }

        let utils = self._utils
        let events = remove ? utils.removeEvent : utils.addEvent               //针对不同浏览器绑定事件的兼容
           ,target = self.options.bindToWrapper ? self.wrapper : utils.window  
        
           events(self.wrapper, 'scroll', this)

           if (!self.options.disableMouse) {
               events(self.wrapper, 'mousedown', this)
               events(target, 'mousemove', this)
               //events(target, 'mousecancel', this)
               events(target, 'mouseup', this)
           }

           if (utils.hasPointer && !self.options.disablePointer) {
            events(self.wrapper, utils.prefixPointerEvent('pointerdown'), this);
            events(target, utils.prefixPointerEvent('pointermove'), this);
            events(target, utils.prefixPointerEvent('pointercancel'), this);
            events(target, utils.prefixPointerEvent('pointerup'), this);
           }

           if (utils.hasTouch && !self.options.disableTouch) {
            events(self.wrapper, 'touchstart', this);
            events(target, 'touchmove', this);
            events(target, 'touchcancel', this);
            events(target, 'touchend', this);
           }

    }

    /**
     * 
     * @param {Object} e 事件对象
     * handleEvent为浏览器触发绑定对象的回调函数时的默认捕获事件对象的函数
     */
    handleEvent(e) {

        let self = this

        self.event = e
        switch (e.type) {
            case 'touchstart':
            case 'pointerdown':
            case 'MSPointerDown':
            case 'mousedown':
                self._start(e);
                break;
            case 'touchmove':
            case 'pointermove':
            case 'MSPointerMove':
            case 'mousemove':
                self._move(e);
                break;
            case 'touchend':
            case 'pointerup':
            case 'MSPointerUp':
            case 'mouseup':
            case 'touchcancel':
            case 'pointercancel':
            case 'MSPointerCancel':
            case 'mousecancel':
                self._end(e);
                break;
            case 'scroll':
                self._end(e);
                break;
        }

    }

    /**
     * 
     * @param {Object} e 事件对象
     */
    _start(e) {
        
        let self = this

        self.lastTop = self.top
        self.top = self._utils.scrollTop()
        self.callback(self.top)            //暴露top给外层，触发回调
    }

    /**
     * 
     * @param {Object} e 事件对象
     */
    _move(e) {
        
        let self = this

        self.lastTop = self.top
        self.top = self._utils.scrollTop()
        self.callback(self.top)
    }

    /**
     * 
     * @param {Obejct} e 事件对象
     */
    _end(e) {
        
        let self = this

        self.lastTop = self.top
        self.top = self._utils.scrollTop()
        self.callback(self.top)
    }

}