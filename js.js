
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'HUNG_PLAYER'

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd');  
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress') 
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random') 
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')




const app = {
    currentIndex : 0, 
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},


    songs: [
        {
          name: "Lời anh muốn nói",
          singer: "Chu Duyên",
          path: "./music/bai8.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Hạnh phúc đó em không có remix ^^",
          singer: "Lương Minh TRang",
          path: "./music/bai2.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Cheer Up",
          singer: "Hong Jin Young",
          path: "./music/bai3.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Thương Thầm",
          singer: "Hoài Bảo",
          path: "./music/bai4.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Chốn Quê Thanh Bình",
          singer: "Dimz",
          path: "./music/bai5.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Có không giữ mất đừng tìm",
          singer: "Nguyễn Hằng",
          path: "./music/bai6.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Mashup",
          singer: "Yling vs Drum7",
          path: "./music/bai7.mp3",
          image: "./photo/anh1.jpg"
        },
        {
          name: "Váy cưới",
          singer: "Trung T",
          path: "./music/bai9.mp3",
          image: "./photo/anh1.jpg"
        }  

      ],

    setConfig : function(key, value) {  
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? "active" : ""}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        playList.innerHTML = htmls.join('')
    },

    defineProperties : function() {
      Object.defineProperty(this, 'currentSong', {
        get : function() {
          return this.songs[this.currentIndex]
        }
      })
    },

    handleEvents : function() {
      const _this = this
      const cdWidth = cd.offsetWidth

      // xử lý cd quay
      const cdThumbAnimate =  cdThumb.animate([
        {transform : 'rotate(360deg)'}
      ], {
        duration : 10000, // 10 seconds
        iterations : Infinity
      })
      cdThumbAnimate.pause()

        // su ly phóng to thu nhỏ
        document.onscroll = function() {
            const scrolltop =  window.scrollY
            const newCdWidth = cdWidth - scrolltop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth

        }

        // su li khi click play button
        playBtn.onclick = function() {
          if (_this.isPlaying) {
            audio.pause()
          }
          else {
            audio.play()
          }
          
        }


        // khi song được play 

        audio.onplay = function() {
          _this.isPlaying = true
          player.classList.add('playing') 
          cdThumbAnimate.play()

        }

        // khi song được pause

        audio.onpause = function() {
          _this.isPlaying = false
          player.classList.remove('playing') 
          cdThumbAnimate.pause()

        }

        // khi tien do bai hat tahy doi
        audio.ontimeupdate = function() {
          if(audio.duration) {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            progress.value = progressPercent
          }
          
        }

        // xử lý khi tua song
        progress.onchange = function(e) {
          const seekTime = audio.duration / 100 * e.target.value
          audio.currentTime = seekTime
        }

        // khi next bai hat
        nextBtn.onclick = function(e) {
          if(_this.isRandom) {
            _this.playRandomSong()
          } else {
            _this.nextSong()
          }
          audio.play()
          _this.render()
          _this.scrollToActiveSong()

        }

        // khi prev bai hat
        prevBtn.onclick = function(e) {
          if(_this.isRandom) {
            _this.playRandomSong()
          } else {
            _this.prevSong()
          }
          audio.play()
          _this.render()
          _this.scrollToActiveSong()

        }

        // su ly bat tat  random song
        randomBtn.onclick = function(e) {
         _this.isRandom = !_this.isRandom
          _this.setConfig('isRandom', _this.isRandom)
          randomBtn.classList.toggle('active', _this.isRandom)          
        }

        // xử lý phát lại 1 bai hat
        repeatBtn.onclick = function(e) {
          _this.isRepeat = !_this.isRepeat
          _this.setConfig('isRepeat', !_this.isRepeat)
          repeatBtn.classList.toggle('active', _this.isRepeat)
        }


        // sử lý next song khi audio ended
        audio.onended = function() {  
          if(_this.isRepeat) {
            audio.play()
          } else {
            nextBtn.click()
          }
        }


        // lắng nghe hành vi click vào play list
        playList.onclick = function(e) { 

          const songNode = e.target.closest('.song:not(.active')

          if (songNode || e.target.closest('.option')) {
            
            // sử lý khi click vào song
            if (songNode) {
              _this.currentIndex = Number(songNode.dataset.index)
              _this.loadCurrentSong()
              audio.play()
              _this.render()
            }

            // sử lý khi click vào song option
            if (e.target.closest('.option')) {

            }
          }
        }

      },

    loadCurrentSong: function ()  {
     
      heading.textContent = this.currentSong.name
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`  
      audio.src = this.currentSong.path

    },

    scrollToActiveSong : function () {
      setTimeout(() => {
        $('.song.active').scrollIntoView({
          behavior : 'smooth',
          block : 'center'
        })
      }, 300)
    },

    loadConfig : function () {
      this.isRandom = this.config.isRandom
      this.isRepeat = this.config.isRepeat
    },

    nextSong: function () {
      this.currentIndex++
      if (this.currentIndex >= this.songs.length) {
        this.currentIndex = 0
      }
      this.loadCurrentSong()

    },

    prevSong: function () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1
      }
      this.loadCurrentSong()

    },

    playRandomSong: function () {
      let newIndex
      do {
        newIndex = Math.floor(Math.random() * this.songs.length)
      }
      while (newIndex === this.currentIndex)

      this.currentIndex = newIndex
      this.loadCurrentSong()
    },

    start : function () {
      // gán cấu hình từ config vào ứng dụng
      this.loadConfig()

      this.defineProperties()

        //  lắng nghe sử lý sự kiện
        this.handleEvents()


        // load bài hát đầu tiên 
        this.loadCurrentSong()

        // render playlist 
        this.render()

        // Hiển thị trạng thái ban đầu cảu BTN repeat và random 
        // randomBtn.classList.toggle('active', this.isRandom)          
        // repeatBtn.classList.toggle('active', this.isRepeat)
    }      
}

app.start()



