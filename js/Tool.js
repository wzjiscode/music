class Tool {
    constructor(nums) {
    }

    static new(nums) {
        return new this(nums)
    }

    log(...args) {
        return console.log(...args)
    }

    // 从music_database.js加载数据，nums下标
    data(nums) {
        if (nums < 1) {
            this.nums = src.length
        } else if (nums > src.length) {
            this.nums = 1
        }
        let nums_val = this.nums
        let srcnums = src[nums_val - 1]
        let srcs = Object.keys(srcnums)
        let result = []
        for (let i = 0; i < srcs.length; i++) {
            result.push(srcnums[i])
        }
        return result
    }

    template() {
        let t = '<div class="bars_bar"></div>'
        return t
    }

    appendHTML(element, place, html) {
        return element.insertAdjacentHTML(place, html)
    }

    e(element) {
        let ele = document.querySelector(element)
        if (ele === null) {
            let s = `该页面未找到${element}元素！`
            alert(s)
            return null
        } else {
            return ele
        }
    }

    es(element) {
        let ele = document.querySelectorAll(element)
        if (ele.length === 0) {
            let s = `该页面未找到${element}元素！`
            alert(s)
            return []
        } else {
            return ele
        }
    }

    // 添加监听事件
    boxShow(element, eventName, callback) {
        element.addEventListener(eventName, callback, false)
    }

    boxAll(element ,eventName, funname) {
        for (let i = 0; i < element.length; i++) {
            element[i].addEventListener(eventName, funname)
            element[i].index = i
        }
    }
}