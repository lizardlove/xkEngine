export default class Scroll {

    constructor(utils) {
        
        this.top = 0
        this.lastTop = 0
        this.direct = 1
        this.event = null

        this.options = {

            disableScroll: false,
            disablePointer: !utils.hasPointer,
            disableTouch: utils.hasPointer || !utils.hasTouch,
            disableMouse: utils.hasPointer || utils.hasTouch,

            startX: 0,
            startY: 0,
            scrollX: 0,
            scrollY: 0,

            bindToWrapper: typeof utils.window.onmousedown === "undefined"
        }

        this.wrapper = typeof utils == 'string' ? utils.document.querySelector(utils) : utils.window;

        this._utils = utils
        
    }

    initEvent(remove, callback) {
        
        let self = this

        self.callback = callback

        if (callback && typeof callback !== 'function') {
            throw new Error('参数错误！传入的不是function')
            alert('参数错误！传入的不是function')
            return 
        }

        let utils = self._utils
        let events = remove ? utils.removeEvent : utils.addEvent
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

    handleEvent(e) {

        let self = this

        console.log(e)
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

    _start(e) {
        
        let self = this

        self.lastTop = self.top
        self.top = self._utils.scrollTop()
        self.callback(self.top)
    }

    _move(e) {
        
        let self = this

        self.lastTop = self.top
        self.top = self._utils.scrollTop()
        self.callback(self.top)
    }

    _end(e) {
        
        let self = this

        self.lastTop = self.top
        self.top = self._utils.scrollTop()
        self.callback(self.top)
    }

}