import XEUtils from 'xe-utils'
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
            updateScroll(this.elemStore)
          }
        })
      })
    }
  },
  bind () {
    return function () {
      // 绑定事件，生成对应元素
      return this.$nextTick().then(() => {
        let elTableElem = this.$refs.refElTable.$el
        let bodyWrapper = elTableElem.querySelector('.el-table__body-wrapper')
        let fixedLeftWrapper = elTableElem.querySelector('.el-table__fixed .el-table__fixed-body-wrapper')
        let fixedRightWrapper = elTableElem.querySelector('.el-table__fixed-right .el-table__fixed-body-wrapper')
        let elemStore = createScrollElem(elTableElem, bodyWrapper, '.el-table__header-wrapper', '.el-table__body')
        if (fixedLeftWrapper) {
          elemStore.fixedLeft = createScrollElem(elTableElem, fixedLeftWrapper, 0, 'table')
        }
        if (fixedRightWrapper) {
          elemStore.fixedRight = createScrollElem(elTableElem, fixedRightWrapper, 0, 'table')
        }
        bodyWrapper.addEventListener('scroll', this._scrollEvent, false)
        this.elemStore = elemStore
      })
    }
  },
  unbind () {
    return function () {
      // 事件解绑
      unbindSpace(this.elemStore)
      this.elemStore.bodyWrapper.removeEventListener('scroll', this._scrollEvent)
    }
  },
  scroll () {
    return function (evnt) {
      let isRender
      let { bodyWrapper } = this.elemStore
      let fullData = this._fullData
      let len = fullData.length
      let renderSize = this.renderSize
      let scrollTop = bodyWrapper.scrollTop
      let isTop = scrollTop < this.scrollTop
      let visibleStart = this.visibleStart
      let visibleSize = this.visibleSize
      let offsetSize = this.offsetSize
      let rowHeight = this.rowHeight
      let toVisibleIndex = Math.ceil(scrollTop / rowHeight)
      if (isTop) {
        // 如果向上滚动
        if (visibleStart > 0 && (toVisibleIndex - offsetSize <= visibleStart)) {
          isRender = true
        }
      } else {
        // 如果向下滚动
        if (visibleStart < len - renderSize && (toVisibleIndex + visibleSize + offsetSize >= visibleStart + renderSize)) {
          isRender = true
        }
      }
      if (isRender) {
        // 超过阈值重新渲染
        let toVisibleStart = isTop ? toVisibleIndex - 1 : toVisibleIndex - Math.floor(visibleSize / 2)
        if (toVisibleStart < 0) {
          toVisibleStart = 0
        } else if (toVisibleStart + renderSize >= len) {
          toVisibleStart = len - renderSize
        }
        if (toVisibleStart !== visibleStart) {
          console.log(`isTop=${isTop} toVisibleStart=${toVisibleStart}`)
          this.visibleStart = toVisibleStart
          // 渲染指定位置的数据
          this.datas = fullData.slice(toVisibleStart, toVisibleStart + renderSize)
          // 重新计算顶部空间和底部空间，支撑滚动条
          this._setScrollSpace(toVisibleStart * rowHeight, (len - renderSize - toVisibleStart) * rowHeight)
          // 渲染完成复原最后位置，保持滚动位置不变
          this.$nextTick().then(() => {
            bodyWrapper.scrollTop = scrollTop
          })
        }
      }
      this.scrollTop = scrollTop
      this.visibleIndex = toVisibleIndex
    }
  },
  space () {
    return function (topHeight, bottomHeight) {
      let { topSpace, bottomSpace, fixedLeft, fixedRight } = this.elemStore
      topSpace.style.height = `${topHeight}px`
      bottomSpace.style.height = `${bottomHeight}px`
      if (fixedLeft) {
        fixedLeft.topSpace.style.height = `${topHeight}px`
        fixedLeft.bottomSpace.style.height = `${bottomHeight}px`
      }
      if (fixedRight) {
        fixedRight.topSpace.style.height = `${topHeight}px`
        fixedRight.bottomSpace.style.height = `${bottomHeight}px`
      }
    }
  },
  compute (size) {
    let defSize = UtilHandle.browse.msie ? size / 2 : size
    return function (isReload) {
      if (this.scrollLoad) {
        let { headerWrapper, bodyWrapper, table } = this.elemStore
        let fullData = this._fullData
        let firstTrElem = table.querySelector('tbody>tr')
        if (!firstTrElem) {
          firstTrElem = headerWrapper.querySelector('thead>tr')
        }
        if (firstTrElem) {
          this.rowHeight = firstTrElem.clientHeight
        }
        let visibleSize = Math.ceil(bodyWrapper.clientHeight / this.rowHeight)
        let renderSize = getRenderSize(this.configs, this.elemStore, visibleSize, defSize)
        this.offsetSize = getOffsetSize(this.configs, renderSize, visibleSize)
        this.visibleSize = visibleSize
        this.renderSize = renderSize
        if (!isReload) {
          this._setScrollSpace(0, fullData.length > renderSize ? (fullData.length - renderSize) * this.rowHeight : 0)
        }
      }
    }
  }
}

function updateScroll ({ bodyWrapper, fixedLeft, fixedRight }, scrollTop, scrollLeft) {
  bodyWrapper.scrollTop = scrollTop
  bodyWrapper.scrollLeft = scrollLeft
  if (fixedLeft) {
    updateScroll(fixedLeft, scrollTop, scrollLeft)
  }
  if (fixedRight) {
    updateScroll(fixedRight, scrollTop, scrollLeft)
  }
}

function unbindSpace ({ bodyWrapper, topSpace, bottomSpace, fixedLeft, fixedRight }) {
  bodyWrapper.removeChild(topSpace)
  bodyWrapper.removeChild(bottomSpace)
  if (fixedLeft) {
    unbindSpace(fixedLeft)
  }
  if (fixedRight) {
    unbindSpace(fixedRight)
  }
}

function createScrollElem (elTableElem, bodyWrapper, queryHeaderWrapper, queryTable) {
  let table = bodyWrapper.querySelector(queryTable)
  let topSpace = document.createElement('div')
  let bottomSpace = document.createElement('div')
  topSpace.className = 'elx-scroll_top-space'
  bottomSpace.className = 'elx-scroll_bottom-space'
  bodyWrapper.insertBefore(topSpace, table)
  bodyWrapper.insertBefore(bottomSpace, table.nextSibling)
  return {
    headerWrapper: queryHeaderWrapper && elTableElem.querySelector(queryHeaderWrapper),
    bodyWrapper,
    table,
    topSpace,
    bottomSpace
  }
}

function getRenderSize (configs, elemStore, visibleSize, defSize) {
  if (configs.renderSize) {
    return configs.renderSize
  }
  if (elemStore.fixedLeft || elemStore.fixedRight) {
    return visibleSize * Math.max(Math.ceil(defSize / 2), 2)
  }
  return visibleSize * defSize
}

function getOffsetSize (configs, renderSize, visibleSize) {
  if (configs.offsetSize) {
    return configs.offsetSize
  }
  if (renderSize > visibleSize * 4) {
    return visibleSize * 2
  }
  if (renderSize > visibleSize * 3) {
    return visibleSize
  }
  return Math.floor(visibleSize / 2)
}

export default ScrollHandle
