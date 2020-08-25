class Player extends Tool{
    constructor(nums) {
        super(nums)
        this.kid = null
        this.nums = nums
        this.updateSrcData()
        this.dragTheProgressBar()
        this.switchSong()
        this.fastForward()
    }

    SingerPhotos(name) {
        let details_album = this.e('.details_album')
        if (name !== undefined) {
            details_album.style.backgroundImage = `url(${name})`
        }
    }

    audioInitialize(src_nums) {
        //加载src路径数据
        this.src = this.data(src_nums)
        this.SingerPhotos(this.src[3])
        //初始化音乐
        this.audio = new Audio(this.src[2])
        if (this.new_css !== undefined) {
            this.audio.volume = this.new_css
        } else {
            this.audio.volume = this.mouseOver()
        }
        this.musicTimes()
        this.gecis = this.SongPath(src_nums)
        this.audioAuto(this.gecis, 0)
        this.loopSong()
    }

    //刷新歌曲数据并播放
    updateSrcData() {
        let src_nums = this.nums
        if(this.audio !== undefined) {
            this.audio.pause()
            this.audio = null
            this.audioInitialize(src_nums)
            if (this.new_rate !== undefined) {
                this.audio.playbackRate = this.new_rate
            }
        } else {
            this.audioInitialize(src_nums)
        }
    }

    // 点击左图标更新data中nums切换歌曲
    leftButton() {
        this.nums -= 1
        this.play()
    }

    // 点击右键切换歌曲
    rightButton() {
        this.nums += 1
        this.play()
    }

    play() {
        this.updateSrcData()
        this.e('.fa-play-circle').style.display = 'none'
        this.e('.icon-bofang').style.display = 'block'
        // this.audio.load()
        let playPromise = this.audio.play()
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.audio.play()
            }).catch(()=> {

            })
        }
    }

    // 处理歌词
    SongPath(nums) {
        //加载src路径数据
        this.geci = this.data(nums)
        //初始化音乐
        return (this.geci)[1]
    }

    // 点击播放音乐
    playButton() {
        this.musicProgrees()
        let play_circle = this.e('.fa-play-circle').style,
            icon_bofang = this.e('.icon-bofang').style
        if (play_circle.display === 'block') {
            play_circle.display = 'none'
            icon_bofang.display = 'block'
            this.audio.play()
            this.animationElement()
        } else {
            play_circle.display = 'block'
            icon_bofang.display = 'none'
            this.audio.pause()
            clearInterval(this.kid)
            this.kid = null
            $('.bars').empty()
        }
    }

    //ajax读取本地文件
    load(name) {
        let xhr = new XMLHttpRequest(),
            //protocol 属性是一个可读可写的字符串，可设置或返回当前 URL 的协议
            okStatus = document.location.protocol === "file:" ? 0 : 200
        xhr.open('GET', name, false)
        xhr.overrideMimeType("text/html;charset=utf-8")
        xhr.send(null)
        return xhr.status === okStatus ? xhr.responseText : null
    }

    // 读取歌词
    readTheLyrics(texts) {
        let text = this.load(texts),
            medises= text.split('\n'),
            medisArray = []
        $.each(medises, (i, item) => {
            let t = item.substring(item.indexOf('[') + 1, item.indexOf(']'))
            medisArray.push({
                t: (t.split(':')[0] * 60 + parseFloat(t.split(':')[1])).toFixed(3),
                c: item.substring(item.indexOf(']') + 1, item.length)
            })
        })
        medisArray.splice(0,5)
        let ul = $('#text')
        ul.empty()
        $.each(medisArray, function (i, item) {
            let li = $(`<li style="list-style: none;">`)
            li.html(item.c)
            ul.append(li)
        })
        return medisArray
    }

    // 歌曲高亮
    lyricHighlight(lineno) {
        let fraction = 2,
            topNum = 0,
            ul = $('#text'),
            $ul = this.e('#text')
        if (lineno > 0) {
            $(ul.find('li').get(topNum + lineno  - 2)).removeClass('lineheight')
        }
        let nowline = ul.find('li').get(topNum + lineno)
        $(nowline).addClass('lineheight')
        let _scrollTop
        $ul.scrollTop = 0
        if ($ul.clientHeight * fraction > nowline.offsetTop) {
            _scrollTop = 0
        } else if (nowline.offsetTop > ($ul.scrollHeight - $ul.clientHeight * (1 - fraction))) {
            _scrollTop = $ul.scrollHeight - $ul.clientHeight
        } else if (this.audio.ended) {
            _scrollTop = 0
        } else {
            _scrollTop = nowline.offsetTop - $ul.clientHeight * fraction
        }

        //以下声明歌词高亮行固定的基准线位置成为 “A”
        if ((nowline.offsetTop - $ul.scrollTop) >= $ul.clientHeight * fraction) {
            //如果高亮显示的歌词在A下面，那就将滚动条向下滚动，滚动距离为 当前高亮行距离顶部的距离-滚动条已经卷起的高度-A到可视窗口的距离
            $ul.scrollTop += (Math.ceil(nowline.offsetTop - $ul.scrollTop - $ul.clientHeight * fraction)) - 20
        } else if ((nowline.offsetTop - $ul.scrollTop) < $ul.clientHeight * fraction && _scrollTop !== 0) {
            //如果高亮显示的歌词在A上面，那就将滚动条向上滚动，滚动距离为 A到可视窗口的距离-当前高亮行距离顶部的距离-滚动条已经卷起的高度
            $ul.scrollTop -= Math.ceil($ul.clientHeight * fraction - (nowline.offsetTop - $ul.scrollTop))
        } else if (_scrollTop === 0) {
            $ul.scrollTop = 0
        } else {
            $ul.scrollTop += $(ul.find('li').get(0)).height()
        }
    }

    // 歌曲轮播
    audioAuto(text, lineNo) {
        let medisArray = this.readTheLyrics(text),
            audio = this.audio,
            self = this,
            $ul = self.e('#text')
        audio.ontimeupdate = function () {
            let linehight = self.lyricHighlight(lineNo)
            if (lineNo === medisArray.length) {
                lineNo = medisArray.length - 1
            } else if (lineNo === medisArray.length - 1 && audio.currentTime.toFixed(3) >= parseFloat(medisArray[lineNo].t)) {
                linehight
            } else if (parseFloat(medisArray[lineNo].t) <= audio.currentTime.toFixed(3) &&
                audio.currentTime.toFixed(3) <= parseFloat(medisArray[lineNo + 1].t)) {
                linehight
                lineNo++
            }
            if (self.audio.ended) {
                $ul.scrollTop = 0
                lineNo = 0
                linehight
            }
        }
    }

    // 播放后添加元素
    animationElement() {
        let bars = this.e('.bars')
        $('.bars').empty()
        let html = this.template()
        for (let i = 0; i <10 ; i++) {
            this.appendHTML(bars, 'beforeend', html)
        }
    }

    // 查看歌曲列表
    songList() {
        let div = this.e('.t_left_gequ')
        $('.t_left_gequ').empty()
        if (div.style.display === 'block') {
            div.style.display = 'none'
        } else {
            div.style.display = 'block'
        }
        let ul = document.createElement('ul')
        for (let i = 0; i < src.length; i++) {
            let li = document.createElement('li')
            li.classList.add('liit')
            li.innerText = src[i][0]
            li.title = `${src[i][0]}`
            ul.appendChild(li)
        }
        div.appendChild(ul)
        this.clickButtonNextSong()
    }

    // 点击歌曲列表切歌
    clickButtonNextSong() {
        let self = this
        $('.liit').each(function() {
            $(this).click(function() {
                let val = $(this).html()
                for (let i = 0; i < src.length; i++) {
                    let listener = src[i]
                    if (listener[0] === val) {
                        self.nums = i + 1
                        break
                    }
                }
                self.updateSrcData()
                self.e('.fa-play-circle').style.display = 'block'
                self.playButton()
            })
        })
    }

    // 处理音乐时长
    musicTimes() {
        let self = this,
            musicDom = self.audio
        musicDom.load()
        musicDom.oncanplay = () => {
            self.e('.playbar_right_span').innerHTML = self.formatData(musicDom.duration)
        }
    }

    formatData(musicDom) {
        let time = musicDom,
            minutes = parseInt(time / 60)
        if (minutes < 10) {
            minutes = '0' + minutes
        }
        let second = time % 60,
            seconds = Math.round(second)
        if (seconds < 10) {
            seconds = '0' + seconds
        }
        return minutes + ':' + seconds
    }

    // 处理进度条
    musicProgrees() {
        let timer = 1000,
            self = this
        if (this.kid !== null) {
            clearInterval(this.kid)
            this.kid = null
        }
        this.kid = setInterval(function() {
            self.bindEventCurrentTime()
        }, timer)
    }

    bindEventCurrentTime() {
        let plays = this.e('.playbar_right_spans'),
            outer = this.e('.playbar_inner'),
            cut = this.audio.currentTime,
            parent = cut / this.audio.duration
        plays.innerHTML = this.formatData(cut)
        outer.style.width = (parent * 100).toFixed(2) + '%'
        if (this.audio.ended) {
            clearInterval(this.kid)
            this.kid = null
            this.playButton()
        }
    }

    clearactive() {
        let volume_pip = this.es('.volume_pip')
        if (volume_pip !== null) {
            for (let i = 0; i < volume_pip.length; i++) {
                volume_pip[i].style.opacity = 0.2
            }
        }
    }

    mouseOver() {
        let self = this
        self.audio.volume = 0.3
        let volume_pip = this.es('.volume_pip')
        for (let i = 0; i < volume_pip.length; i++) {
            volume_pip[i].index = [i]
            let volumes = volume_pip[i]
            this.boxShow(volumes, 'click', function (event) {
                self.clearactive()
                let b = volume_pip.length,
                    a = event.target.index[0]
                self.audio.volume = 1 + (- a / 13)
                self.new_css = self.audio.volume
                while (a < b) {
                    volume_pip[a].style.opacity = 1
                    a += 1
                }
            })
        }
        return self.audio.volume
    }

    dragTheProgressBar() {
        let self = this,
            inner = self.e('.playbar_inn'),
            outer = self.e('.playbar_inner'),
            dot = self.e('.dot'),
            result = self.e('.playbar_right_spans'),
            max = inner.offsetWidth,
            moving = false,
            offset = 0
        this.boxShow(dot, 'mousedown', (event) => {
            event.stopPropagation()
            offset = event.clientX - dot.offsetLeft
            moving = true
        })

        this.boxShow(document, 'mouseup', () => {
            moving = false
        })

        this.boxShow(document, 'mousemove', (event) => {
            if (moving) {
                let x = event.clientX - offset
                if (x > max) {
                    x = max
                } else if (x < 0) {
                    x = 0
                }
                let width = (x / max) * 100
                outer.style.width = String(width) + '%'
                self.currentTime = width * self.audio.duration / 100
                result.innerHTML = self.formatData(self.currentTime)
                self.audio.currentTime = self.currentTime
            }
        })
    }

    choice() {
        let a = Math.random() * (src.length + 1 - 1),
            m = Math.ceil(a) - 1
        return m
    }

    switchSong() {
        let options = this.es('.icon-none')
        this.boxAll(options, 'click', (event) => {
            let self = event.target,
                index = self.index + 1
            self.classList.remove('active')
            if (index >= 3) {
                index = 0
            }
            options[index].classList.add('active')
        })
    }

    judgeLoop() {
        let options = this.es('.icon-none')
        for (let i = 0; i < options.length; i++) {
            let ipts = options[i]
            if (ipts.classList.contains('active')) {
                return i
            }
        }
    }

    loopSong() {
        this.boxShow(this.audio, 'ended', () => {
            let index = this.judgeLoop(),
            /*0:随机播放
            1: 单曲循环
            2: 列表循环*/
                dict = {
                0: this.choice(),
                1: this.nums,
                2: this.nums + 1,
            }
            if (dict[index] !== undefined) {
                this.nums = dict[index]
                this.play()
            }
        })
    }

    fastForward() {
        let self = this,
            fastforwards = this.e('.fa-fast-forward')
        this.boxShow(fastforwards, 'click' ,() => {
            self.audio.playbackRate += 0.5
            if (self.audio.playbackRate > 2) {
                self.audio.playbackRate = 1
            }
            fastforwards.title = `当前倍速为:${self.audio.playbackRate}`
            self.new_rate = self.audio.playbackRate
        })
    }

    touch() {
        let left = this.e('.controls_left'),
            middle = this.e('.controls_middle'),
            right = this.e('.controls_right'),
            copy = this.e('.icon-caidan-copy')
        this.boxShow(left, 'click', this.leftButton.bind(this))
        this.boxShow(middle, 'click', this.playButton.bind(this))
        this.boxShow(right, 'click', this.rightButton.bind(this))
        this.boxShow(copy, 'click', this.songList.bind(this))
    }
}