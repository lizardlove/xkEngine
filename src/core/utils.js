export default {

    height: window.innerHeight,
    width: window.innerWidth,

    getStyle: window.getComputedStyle,

    /**
     * 
     * @param {Object} parentEle 父级元素
     * 获取父级元素的子节点元素
     */
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

    /**
     * 
     * @param {Object} el 接受样式的Dom节点
     * @param {Object} tf 需要修改的样式及参数
     * 样式的增加  
     */
    setStyle(el, tf) {
        
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

    /**
     * 
     * @param {Object} el DOM节点
     * 获取el节点的宽高, top, left
     */
    getStyleRect(el) {
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