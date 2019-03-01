export default class Animate {
    constructor(config) {
        
        this.id = config.id
        this.ele = config.ele
        this.status = config.status
        this.top = config.top
        this.bottom = config.bottom
        this.type = config.type
        this.option = {}
        
        //采集不同的CSS3动画并归类
        if (config.config.animation) {
            this.option = {
                type: "animation",
                value: config.config.animation
            }
        } else if (config.config.opacity) {
            this.option = {
                type: "opacity",
                value: config.config.opacity
            }
        } else if (config.config.transform) {
            this.option = {
                type: "transform",
                value: config.config.transform
            }
        }

        this._format()

    }

    /**
     *针对CSS3动画播放相关参数进行页面适配及参数初始化
     *
     * @memberof Animate
     */
    _format() {
       
        let self = this

        let start, end
        let style = self.ele.style
        let computedStyle = window.getComputedStyle(self.ele)
        let numReg = new RegExp("[\-\.0-9]+", "gmi")
        let winDpi = Math.round((self.ele.getAttribute('data-width') / self.ele.offsetWidth) * 1000) / 1000

        //动画相关的位移原始量 页面适配
        if (style.top && style.top.indexOf('px') != -1) {
            style.top = Math.round(Math.round((style.top.match(numReg) / winDpi) * 100) / 100) + 'px'
        }
        if (style.left && style.left.indexOf('px') != -1) {
            style.left = Math.round(Math.round((style.left.match(numReg) / winDpi) * 100) / 100) + 'px'
        }
        if (style.bottom && style.bottom.indexOf('px') != -1) {
            style.bottom = Math.round(Math.round((style.bottom.match(numReg) / winDpi) * 100) / 100) + 'px'
        }
        if (style.right && style.right.indexOf('px') != -1) {
            style.right = Math.round(Math.round((style.right.match(numReg) / winDpi) * 100) / 100) + 'px'
        }

        //采集动画初始和结束参数
        switch (self.option.type) {
            case "animation": {
                self.bottom = self.top + parseFloat(self.ele.style.height)
                break;
            }
            case "opacity": {
                end = parseInt(self.option.value)
                start = style.opacity ? parseInt(style.opacity) : parseInt(computedStyle['opacity'])
                self.option.value = [start, end]
                break;
            }
            case "transform": {
                let transformCore = [], startValue, endValue, getTransform
                getTransform =  new RegExp("[A-Za-z0-9\(]*[\-a-zA-Z0-9,\.\( ]*[ \)]*", "gmi")

                endValue = self.option.value.match(getTransform)
                endValue = getTfItem(endValue)
                endValue.forEach((core, i) => {
                    transformCore.push({
                        type: core[0],
                        start: "",
                        end: core[1]
                    })
                })
                if (!!style['transform']) {
                    startValue = style['transform'].match(getTransform)
                    startValue = getTfItem(startValue)
                    startValue.forEach((core, i) => {
                        for (let i = 0; i < transformCore.length; i++) {
                            if (transformCore[i].type == core[0]) {
                                transformCore[i].start = core[1]
                            }
                        }
                    })
                } else {
                    transformCore.forEach(core => {

                        if (core.type == 'scale') {
                            core.start = "1, 1"
                        } else {
                            core.start = 0
                        }

                    })
                }

                transformCore.forEach(core => {
                    let filter = new RegExp("[\-\.0-9]+", "gmi")
                    if (core.start) {
                        let value = core.start.match(filter)
                        value.map(x => {
                            if (core.type == "translate3d") {
                                return Math.round(Math.round((parseFloat(x)/ winDpi) * 100) / 100)
                            } else {
                                return parseFloat(x)
                            }
                        })
                        core.start = value
                    }
                    if (core.end) {
                        let value = core.end.match(filter)
                        value = value.map(x => {
                            if (core.type == "translate3d") {
                                
                                return Math.round(Math.round((parseFloat(x)/ winDpi) * 100) / 100)
                            } else {
                                return parseFloat(x)
                            }
                        })

                        core.end = value
                    }

                })

                self.option.value = transformCore
                break
            }
            default: break
        }


        function getTfItem(cssArr) {
            let separate = new RegExp("([A-Za-z0-9\-\.])[^\(\)]*", "gmi");

            let cssList = [], cssTf, cssLen = cssArr.length, cssTfNum = -1;
            while (++cssTfNum < cssLen) {
                cssTf = cssArr[cssTfNum].match(separate);
                if (!cssTf) continue;
                if (!cssTf[1]) continue;
                cssTf[0] = cssTf[0].toLowerCase();
                cssTf[1] = cssTf[1].toLowerCase();
                cssList.push(cssTf);
            }

            return cssList;
        };

    }

    /**
     *根据传入Top, 计算当前动画的状态，并赋值CSS
     *
     * @param {Number} top 实时的滑动高度
     * @memberof Animate
     */
    play(top) {
        
        let self = this

        let heightRange, ele, core

        heightRange = self.bottom - self.top
        ele = self.ele
        core = self.option

        switch (core.type) {
            case "animation": {
                self._setStyle(ele, `${core.type}:${core.value};`)
                break
            }
            case "opacity": {

                let index, value, styleRange

                index = top - self.top
                value = index / heightRange
                styleRange = core.value[1] - core.value[0]
                value = Math.abs(value * styleRange)

                if (styleRange < 0) {
                    value = core.value[0] - value
                } else {
                    value = core.value[0] + value
                }
                value = value > 1 ? 1 : value
                value = value < -1 ? -1 : value
                self._setStyle(ele, `${core.type}:${value};`)
                break

            }
            case "transform": {

                let index, styleRange, str=`${core.type}:`
                
                index = top - self.top
                index = index / heightRange
                index = index > 1 ? 1 : index
                index = index < -1 ? -1 : index
                core.value.forEach(value => {
                    str += `${value.type}(`
                    if (value.start == 0) {
                        styleRange = value.end
                    } else {
                        styleRange = []
                        value.end.forEach((x,i) => {
                            styleRange.push(x - value.start[i])
                        })
                    }

                    styleRange.forEach(x => {
                        switch (value.type) {
                            case 'translate3d': {
                                str += `${index*x}px,`
                                break
                            }
                            case 'scale': {
                                str += `${index*x + 1},`
                                break;
                            }
                            case 'rotate': {
                                str += `${(index*x) % 360}deg,`
                                break;
                            }
                        }
                    })
                    str = str.slice(0, str.length - 1)
                    str += `) `

                })
                str += `;`
                self._setStyle(ele, str)
                break
            }
        }

    }

    /**
     *添加/更新CSS信息
     *
     * @param {Object} el 需要更新CSS的DOM
     * @param {String} tf CSS文本
     * @memberof Animate
     */
    _setStyle(el, tf) {

        let sty = '';

        if (typeof tf === 'string') {
            sty = tf;
        } else if (typeof tf === 'object') {

            for (var s in tf) {
                sty += s + ':' + tf[s] + ';';
            }

        }

        el.style.cssText += ';' + sty;

    }

    /**
     *结束动画状态，还原状态
     *
     * @memberof Animate
     */
    stop() {

        let self = this

        let ele
        ele = self.ele

        switch (self.option.type) {
            case "animation": {
                self._setStyle(ele, `${self.option.type}:none;`)
                break
            }
            case "opacity": {
                break
            }
            case "transform": {
                break
            }
        }
    }

}