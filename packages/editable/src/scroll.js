import UtilHandle from './tool'

/**
   * 滚动渲染，以优化的方式渲染表格
   * 计算规则：
   * top --> Space
   *   --> visibleStart
   *     --> renderSize
   *       --> offsetSize
   * table --> visibleIndex
   *       --> offsetSize
   * bottom --> Space
   */
const ScrollHandle = {
  reload () {
    return function (isReload) {
      return this.$nextTick().then(() => {
        // 如果重新加载表格，索引重新初始化
        if (!isReload) {
          this.visibleIndex = 0
          this.visibleStart = 0
          this._computeScroll(isReload)
        }
        this.datas = this._fullData.slice(this.visibleStart, this.visibleStart + this.renderSize)
        return this.$nextTick().then(() => {
          this._computeScroll(isReload)
          // 如果重新加载表格，滚动位置重新初始化
          if (!isReload) {
            this.bodyWrapperElem.scrollTop = 0
            this.bodyWrapperElem.scrollLeft = 0
          }
        })
      })
    }
  },
  bind () {
    return function () {
      return this.$nextTick().then(() => {
        // 绑定事件，生成对应元素
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
      })
    }
  },
  unbind () {
    return function () {
      // 事件解绑
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
        // 如果向上滚动
        if (visibleStart > 0 && (toVisibleIndex - offsetSize < visibleStart)) {
          isRender = true
        }
      } else {
        // 如果向下滚动
        if (visibleStart < fullData.length - renderSize && (toVisibleIndex + offsetSize >= visibleStart + renderSize)) {
          isRender = true
        }
      }
      if (isRender) {
        // 超过阈值重新渲染
        let toVisibleStart = isTop ? toVisibleIndex - 1 : toVisibleIndex - offsetSize
        if (toVisibleStart < 0) {
          toVisibleStart = 0
        } else if (toVisibleStart + renderSize >= fullData.length) {
          toVisibleStart = fullData.length - renderSize
        }
        if (toVisibleStart !== visibleStart) {
          this.visibleStart = toVisibleStart
          // 渲染指定位置的数据
          this.datas = fullData.slice(toVisibleStart, toVisibleStart + renderSize)
          // 重新计算顶部空间和底部空间，支撑滚动条
          this.scrollTopSpaceElem.style.height = `${toVisibleStart * rowHeight}px`
          this.scrollBottomSpaceElem.style.height = `${(fullData.length - renderSize - toVisibleStart) * rowHeight}px`
          this.$nextTick().then(() => {
            // 渲染完成复原最后位置，保持滚动位置不变
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
    return function (isReload) {
      if (this.scrollLoad) {
        let firstTrElem = this.tableElem.querySelector('tbody>tr')
        if (!firstTrElem) {
          firstTrElem = this.headerWrapperElem.querySelector('thead>tr')
        }
        if (firstTrElem) {
          this.rowHeight = firstTrElem.clientHeight
        }
        let visibleSize = Math.ceil(this.bodyWrapperElem.clientHeight / this.rowHeight)
        let renderSize = this.configs.renderSize || visibleSize * defSize
        this.offsetSize = this.configs.offsetSize || (renderSize > visibleSize * 4 ? visibleSize * 2 : (renderSize > visibleSize * 2 ? visibleSize : Math.floor(visibleSize / 2)))
        this.renderSize = renderSize
        if (!isReload) {
          this.scrollTopSpaceElem.style.height = '0px'
          this.scrollBottomSpaceElem.style.height = this._fullData.length > this.renderSize ? `${(this._fullData.length - this.renderSize) * this.rowHeight}px` : '0px'
        }
      }
    }
  }
}

export default ScrollHandle
