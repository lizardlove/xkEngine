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
            infade: config.config.music.infade,
            outfade: config.config.music.outfade
        }

        this.howler = null
    }

    play(){

        let self = this
        let config = self.config

        if (!self.howler) {
            self.howler = new Howl({src: config.url, loop: config.loop, autoplay: true})
        }


    }

    stop(){

        let self = this
        if (self.howler) {
            self.howler.stop()
        }
        self.howler = null
        
    }


}
