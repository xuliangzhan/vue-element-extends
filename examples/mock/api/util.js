import XEUtils from 'xe-utils'

var idIndex = 100000

const MockUtil = {
  // 按更新时间倒序
  sortList (list) {
    return XEUtils.sortBy(list, 'updateTime').reverse()
  },
  // 删除单条
  removeByPathVariable (list, ModelVO, itemKey) {
    return function (request, response, { pathVariable }) {
      let rest = []
      if (pathVariable) {
        rest = XEUtils.remove(list, item => item[itemKey] === pathVariable[itemKey])
      }
      response.body = rest
      return response
    }
  },
  // 插入单条
  insertByBody (list, ModelVO, itemKey) {
    return function (request, response) {
      let result = []
      if (request.body) {
        let updateTime = Date.now()
        let insertRecords = [request.body]
        insertRecords.forEach(data => {
          let rest = Object.assign(new ModelVO(data), { [itemKey]: idIndex++, updateTime, createTime: updateTime })
          result.push(rest)
          list.push(rest)
        })
      }
      return result
    }
  },
  // 更新单条
  updateByBody (list, ModelVO, itemKey) {
    return function (request, response) {
      let result = []
      if (request.body) {
        let updateTime = Date.now()
        let updateRecords = [request.body]
        updateRecords.forEach(data => {
          let item = list.find(item => item[itemKey] === data[itemKey])
          if (item) {
            XEUtils.destructuring(item, data, { updateTime })
            result.push(item)
          }
        })
      }
      return result
    }
  },
  // 批量保存
  saveListByBody (list, ModelVO, itemKey) {
    return function (request, response) {
      let insertRest = []
      let updateRest = []
      let removeRest = []
      if (request.body) {
        let updateTime = Date.now()
        let updateRecords = request.body.updateRecords || []
        let removeRecords = request.body.removeRecords || []
        let insertRecords = request.body.insertRecords || []
        removeRest = XEUtils.remove(list, item => removeRecords.some(row => row[itemKey] === item[itemKey]))
        updateRecords.forEach(data => {
          let item = list.find(item => item[itemKey] === data[itemKey])
          if (item) {
            XEUtils.destructuring(item, data, { updateTime })
            updateRest.push(item)
          }
        })
        insertRecords.forEach(data => {
          let rest = Object.assign(new ModelVO(data), { [itemKey]: idIndex++, updateTime, createTime: updateTime })
          insertRest.push(rest)
          list.push(rest)
        })
      }
      response.body = { insertRest, updateRest, removeRest }
      return response
    }
  },
  // 处理分页
  getPageList (list, propSize, propCurrent) {
    return function (request, response, { pathVariable }) {
      let pageSize = 10
      let currentPage = 1
      let totalResult = list.length
      let rest = []
      if (pathVariable) {
        pageSize = XEUtils.toNumber(pathVariable[propSize])
        currentPage = XEUtils.toNumber(pathVariable[propCurrent])
        rest = MockUtil.sortList(list).slice((currentPage - 1) * pageSize, currentPage * pageSize)
      }
      response.body = {
        page: { pageSize, currentPage, totalResult },
        result: rest
      }
      return response
    }
  }
}

export default MockUtil
