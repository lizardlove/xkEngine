export default class Animate {
    constructor(config) {
        
        this.id = config.id
        this.ele = config.ele
        this.status = config.status
        this.top = config.top
        this.bottom = config.bottom
        this.type = config.type
        this.option = {}
        
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

    _format() {
       
        let self = this

        let start, end
        let style = self.ele.style
        let computedStyle = window.getComputedStyle(self.ele)
        let numReg = new RegExp("[\-\.0-9]+", "gmi")
        let winDpi = Math.round((self.ele.getAttribute('data-width') / self.ele.offsetWidth) * 1000) / 1000
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

        switch (self.option.type) {
            case "animation": {
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
                        core.start = 0
                    })
                }

                transformCore.forEach(core => {
                    let filter = new RegExp("[\-\.0-9]+", "gmi")
                    if (core.start) {
                        let value = core.start.match(filter)
                        value.map(x => {
                            if (core.type == "translate3d") {
                                return Math.round(Math.round((parseInt(x)/ winDpi) * 100) / 100)
                            } else {
                                return parseInt(x)
                            }
                        })
                        core.start = value
                    }
                    if (core.end) {
                        let value = core.end.match(filter)
                        value = value.map(x => {
                            if (core.type == "translate3d") {
                                
                                return Math.round(Math.round((parseInt(x)/ winDpi) * 100) / 100)
                            } else {
                                return parseInt(x)
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

    play(top) {}

    stop() {}

}