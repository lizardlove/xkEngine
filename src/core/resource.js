import { Howl } from 'howler'
import utils from './utils'

export default class Resource {
    constructor() {
        this.box = []

    }

    load(index) {

        let self = this

        if (Array.isArray(index)) {
            index.forEach( x => {
                self.load(x)
            })
        } else if (!isNaN(index)) {
            
            let pageResource = self.box[index]

            if (pageResource.status < pageResource.list.length) {
                let list = pageResource.list

                list.forEach( resource => {
                    if (!resource.loaded) {
                        switch(resource.type) {
                            case 'image': {
                                self._imageLoad(resource.src, data => {
                                    resource.loaded = true
                                })
                                break
                            }
                            case 'music': {
                                self._musicLoad(resource.src, data => {
                                    resource.loaded = true
                                })
                                break
                            }
                            default: break;
                        }
                        if (resource.loaded) {
                            pageResource.status += 1
                        }
                    }
                } )
            }
        }
    }

    _imageLoad(src, callback) {
        
        let self = this
        let flag = false
        let _img = new Image()
        if (_img.complete) {
            if (callback && typeof callback == 'function') callback(_img);
            _img = null
            return 
        }
        _img.onerror = err => {
            _img = _img.onload = _img.onerror = null
            console.log('图片加载错误！ => ' + src)
            console.log('错误信息: ' + err)
        }
        _img.onload = () => {
            flag = true
            if (callback && typeof callback == 'function') callback(_img);
            _img = _img.onerror = _img.onload = null
        }
        _img.src = src
        setTimeout(() => {
            if (!flag) {
                _img = _img.onerror = _img.onload = null
                self._imageLoad(src)
            }
        }, 500)
    }
    _musicLoad(src, callback) {

        let self = this

        let howl = new Howl({
            src: src,
            loop: false,
            onload: callback
        })

        howl.volume(0)
        howl.play()
        let playTime = utils.getTime()

        function _mobStop() {
            if (utils.getTime() - playTime > 1000) {
                howl.stop()
                howl = null
                return
            }
            utils.requestAnimationFrame(_mobStop)
        }

        _mobStop()
        

    }

}