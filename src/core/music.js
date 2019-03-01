import {Howl, Howler} from 'howler'

export default class Music {
    constructor(config) {

        this.id = config.id
        this.ele = config.ele
        this.status = config.status
        this.top = config.top
        this.bottom = config.bottom
        this.type = config.type

        this.config = {
            loop: config.config.music.loop,
            url: config.config.music.url,
            inFade: config.config.music.infade,
            outFade: config.config.music.outfade
        }

        this.howler = null
    }

    /**
     *howler对象初始化并播放
     *
     * @memberof Music
     */
    async play(){

        let self = this
        let config = self.config

        if (!self.howler) {
            self.howler = await new Howl({
                src: config.url, 
                loop: config.loop,
                preload: true,
                autoplay: false
            })
            self.howler.paused = false                  //howler没有附带paused信息，手动添加
            self.howler.volume(1)
            self.howler.play()
            if (config.inFade) {
                self.howler.fade(0, 1, config.inFade)
            }
        } else if (self.howler.paused) {
            self.howler.play()
            self.howler.paused = false
        }


    }

    pause() {
        let self = this

        if (self.howler && !self.howler.paused) {
            self.howler.pause()
            self.howler.paused = true
        }
    }

    stop(){

        let self = this
        if (self.howler) {
            if (self.config.outFade) {
                let fade = self.howler.volume()
                self.howler.fade(fade, 0, self.config.outFade)
            } else {
                self.howler.stop()
            }
        }
        self.howler = null
        
    }


}
