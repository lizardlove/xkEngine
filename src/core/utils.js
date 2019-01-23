export default {
    height: window.innerHeight,
    width: window.innerWidth,
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
    setStyle(el, tf) {
        // css 追加,插入等
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
    getRect(el) {
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
    }
}