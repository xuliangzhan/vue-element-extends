import UtilHandle from './util'

/**
   * 滚动渲染，以优化的方式渲染表格
   * 只渲染可视部分，其余收起
   * top
   *   --> 占位
   *   --> offsetSize
   * table
   *   --> renderSize
   *     --> visibleStart
   *     --> visibleIndex
   * bottom
   *   --> offsetSize
   *   --> 占位
   */
const ScrollHandle = {
  reload () {
    return function () {
      this.visibleIndex = 0
      this.visibleStart = 0
      this.datas = this._fullData.slice(this.visibleStart, this.visibleStart + this.renderSize)
      return this.$nextTick().then(() => {
        this._computeScroll()
        this.bodyWrapperElem.scrollTop = 0
        this.bodyWrapperElem.scrollLeft = 0
      })
    }
  },
  bind () {
    return function () {
      return this.$nextTick().then(() => {
        this.headerWrapperElem = this.$refs.refElTable.$el.querySelector('.el-table__header-wrapper')
        this.bodyWrapperElem = this.$refs.refElTable.$el.querySelector('.el-table__body-wrapper')
        this.tableElem = this.bodyWrapperElem.querySelector('.el-table__body')
        this.scrollTopSpaceElem = document.createElement('div')
        this.scrollTopSpaceElem.className = 'elx-scroll_top-pace'
        this.scrollBottomSpaceElem = document.createElement('div')
        this.scrollBottomSpaceElem.className = 'elx-scroll_bottom-pace'
        this.bodyWrapperElem.insertBefore(this.scrollTopSpaceElem, this.tableElem)
        this.bodyWrapperElem.insertBefore(this.scrollBottomSpaceElem, this.tableElem.nextSibling)
        this.bodyWrapperElem.addEventListener('scroll', this._scrollEvent, false)
        this._computeScroll()
      })
    }
  },
  unbind () {
    return function () {
      this.bodyWrapperElem.removeChild(this.scrollTopSpaceElem)
      this.bodyWrapperElem.removeChild(this.scrollBottomSpaceElem)
      this.bodyWrapperElem.removeEventListener('scroll', this._scrollEvent)
    }
  },
  scroll () {
    return function (evnt) {
      let isRender
      let fullData = this._fullData
      let renderSize = this.renderSize
      let scrollTop = this.bodyWrapperElem.scrollTop
      let isTop = scrollTop < this.scrollTop
      let visibleStart = this.visibleStart
      let offsetSize = this.offsetSize
      let rowHeight = this.rowHeight
      let toVisibleIndex = Math.ceil(scrollTop / rowHeight)
      if (isTop) {
        if (visibleStart > 0 && (toVisibleIndex - offsetSize < visibleStart)) {
          isRender = true
        }
      } else {
        if (visibleStart < fullData.length - renderSize && (toVisibleIndex + offsetSize >= visibleStart + renderSize)) {
          isRender = true
        }
      }
      if (isRender) {
        let toVisibleStart = toVisibleIndex - (renderSize / 2)
        if (toVisibleStart < 0) {
          toVisibleStart = 0
        } else if (toVisibleStart + renderSize >= fullData.length) {
          toVisibleStart = fullData.length - renderSize
        }
        if (toVisibleStart !== visibleStart) {
          this.visibleStart = toVisibleStart
          this.datas = fullData.slice(toVisibleStart, toVisibleStart + renderSize)
          this.scrollTopSpaceElem.style.height = `${toVisibleStart * rowHeight}px`
          this.scrollBottomSpaceElem.style.height = `${(fullData.length - renderSize - toVisibleStart) * rowHeight}px`
          this.$nextTick().then(() => {
            this.bodyWrapperElem.scrollTop = scrollTop
          })
        }
      }
      this.scrollTop = scrollTop
      this.visibleIndex = toVisibleIndex
    }
  },
  compute (size) {
    let defSize = UtilHandle.browse.msie ? size / 2 : size
    return function () {
      if (this.scrollLoad) {
        let firstTrElem = this.tableElem.querySelector('tbody>tr')
        if (!firstTrElem) {
          firstTrElem = this.headerWrapperElem.querySelector('thead>tr')
        }
        if (firstTrElem) {
          this.rowHeight = firstTrElem.clientHeight
        }
        let visibleSize = Math.ceil(this.bodyWrapperElem.clientHeight / this.rowHeight)
        if (this.configs.size) {
          this.renderSize = this.configs.size
        } else {
          this.renderSize = visibleSize * defSize
        }
        this.offsetSize = visibleSize * 2
        this.scrollTopSpaceElem.style.height = '0px'
        this.scrollBottomSpaceElem.style.height = `${(this._fullData.length - this.renderSize) * this.rowHeight}px`
      }
    }
  }
}

export default ScrollHandle
