import { Howl } from 'howler'
import utils from './utils'

export default class Resource {
    constructor() {
        this.box = []

    }

    /**
     *接收页索引，加载该页相关资源
     *
     * @param {Number} index 页索引
     * @memberof Resource
     */
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
                                    resource.loaded = true       //当前资源加载完成
                                    pageResource.status += 1     //本页资源加载成功+1
                                })
                                break
                            }
                            case 'music': {
                                self._musicLoad(resource.src, data => {
                                    resource.loaded = true
                                    pageResource.status += 1
                                })
                                break
                            }
                            default: break;
                        }
                    }
                } )
            }
        }
        

    }

    /**
     *图片资源的加载和错误处理
     *
     * @param {String} src 图片资源链接
     * @param {Function} callback 加载完成后的回调函数
     * @memberof Resource
     */
    _imageLoad(src, callback) {
        
        let self = this
        let flag = false
        let _img = new Image()
        if (_img.complete) {    //当前资源是否已经加载过
            if (callback && typeof callback == 'function') callback(_img);
            _img = null
            return 
        }
        _img.onerror = err => { //错误处理
            _img = _img.onload = _img.onerror = null
            console.log('图片加载错误！ => ' + src)
            console.log('错误信息: ' + err)
        }
        _img.onload = () => {   //加载成功
            flag = true
            if (callback && typeof callback == 'function') callback(_img);
            _img = _img.onerror = _img.onload = null
        }
        _img.src = src
        setTimeout(() => {
            if (!flag) {
                _img = _img.onerror = _img.onload = null
                self._imageLoad(src, callback)
            }
        }, 500)    //500ms如果还没加载成功则重新加载
    }

    /**
     *音乐资源加载
     *
     * @param {String} src 音乐资源链接
     * @param {Function} callback 加载成功回调
     * @memberof Resource
     */
    _musicLoad(src, callback) {

        let self = this

        let howl = new Howl({
            src: src,
            loop: false,
            preload: true,
            onload: callback
        })

        howl.volume(0)
        howl.play()
        let playTime = utils.getTime()

        function _mobStop() {
            if (utils.getTime() - playTime > 1000) {  //静音播放1000ms则预加载完成
                howl.stop()
                howl = null
                return
            }
            utils.requestAnimationFrame(_mobStop)
        }

        _mobStop()
        

    }

}