export default class Resource {
    constructor() {
        this.box = []

    }

    load(index) {

        let self = this

        if (Array.isArray(index)) {
            index.forEach( x => {
                if (!self.box[x].status) {
                    let list = self.box[x].list

                    list.forEach( resource => {
                        switch(resource.type) {
                            case 'image': {
                                let flag = self._imageLoad(resource.src)
                                break
                            }
                            case 'music': {
                                let flag = self._musicLoad(resource.src)
                                break
                            }
                            default: break;
                        }
                    } )
                }
            })
        } else {

        }
    }

    _imageLoad(src) {}
    _musicload(src) {}
    error() {}
}