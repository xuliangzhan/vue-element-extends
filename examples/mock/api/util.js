import XEUtils from 'xe-utils'

var idIndex = 100000

const MockUtil = {
  // 获取最新数据、升序
  findAscSortList (list, ModelVO, sortProps, max) {
    return function (request, response) {
      let rest = XEUtils.sortBy(list, sortProps)
      return max ? rest.slice(0, max) : rest
    }
  },
  // 获取最新数据、倒序
  findDescSortList (list, ModelVO, sortProps, max) {
    return function (request, response) {
      let rest = XEUtils.sortBy(list, sortProps).reverse()
      return max ? rest.slice(0, max) : rest
    }
  },
  // 删除单条
  deleteByPathVariable (list, ModelVO, itemKey) {
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
  // 分页、升序
  findAscSortPageList (list, ModelVO, sortProps, propSize, propCurrent) {
    return function (request, response, { pathVariable }) {
      let pageSize = 10
      let currentPage = 1
      let totalResult = list.length
      let rest = []
      if (pathVariable) {
        pageSize = XEUtils.toNumber(pathVariable[propSize])
        currentPage = XEUtils.toNumber(pathVariable[propCurrent])
        rest = XEUtils.sortBy(list, sortProps).slice((currentPage - 1) * pageSize, currentPage * pageSize)
      }
      response.body = {
        page: { pageSize, currentPage, totalResult },
        result: rest
      }
      return response
    }
  },
  // 分页、倒序
  findDescSortPageList (list, ModelVO, sortProps, propSize, propCurrent) {
    return function (request, response, { pathVariable }) {
      let pageSize = 10
      let currentPage = 1
      let totalResult = list.length
      let rest = []
      if (pathVariable) {
        pageSize = XEUtils.toNumber(pathVariable[propSize])
        currentPage = XEUtils.toNumber(pathVariable[propCurrent])
        rest = XEUtils.sortBy(list, sortProps).reverse().slice((currentPage - 1) * pageSize, currentPage * pageSize)
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
