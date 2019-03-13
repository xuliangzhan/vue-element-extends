import XEUtils from 'xe-utils'
import { template, DELETE, POST, GET } from 'xe-ajax-mock'

var idIndex = 100000

function sortList (list) {
  return XEUtils.sortBy(list, 'updateTime').reverse()
}

// 删除单条
function removeByPathVariable (list, ModelVO, itemKey) {
  return function (request, response, { pathVariable }) {
    let rest = []
    if (pathVariable) {
      rest = XEUtils.remove(list, item => item[itemKey] === pathVariable[itemKey])
    }
    response.body = rest
    return response
  }
}

// 插入单条
function insertByBody (list, ModelVO, itemKey) {
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
}

// 更新单条
function updateByBody (list, ModelVO, itemKey) {
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
}

// 批量保存
function saveListByBody (list, ModelVO, itemKey) {
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
}

// 处理分页
function getPageList (list, propSize, propCurrent) {
  return function (request, response, { pathVariable }) {
    let pageSize = 10
    let currentPage = 1
    let totalResult = list.length
    let rest = []
    if (pathVariable) {
      pageSize = XEUtils.toNumber(pathVariable[propSize])
      currentPage = XEUtils.toNumber(pathVariable[propCurrent])
      rest = sortList(list).slice((currentPage - 1) * pageSize, currentPage * pageSize)
    }
    response.body = {
      page: { pageSize, currentPage, totalResult },
      result: rest
    }
    return response
  }
}

// region api
GET('/api/conf/region/list', require('./conf/region.json'))
GET('/api/conf/sex/list', require('./conf/sex.json'))

// role api
class RoleVO {
  constructor (data) {
    this.id = data.id
    this.name = data.name
    this.describe = data.describe
    this.createTime = data.createTime
    this.updateTime = data.updateTime
  }
}
var roleList = template(require('./role/list.json'))
DELETE('/api/role/delete/{id}', removeByPathVariable(roleList, RoleVO, 'id'))
POST('/api/role/add', insertByBody(roleList, RoleVO, 'id'))
POST('/api/role/update', updateByBody(roleList, RoleVO, 'id'))
POST('/api/role/save', saveListByBody(roleList, RoleVO, 'id'))
GET('/api/role/list', request => sortList(roleList).slice(0, 10))
GET('/api/role/page/list/{pageSize}/{currentPage}', getPageList(roleList, 'pageSize', 'currentPage'))

// user api
class UserVO {
  constructor (data) {
    this.id = data.id
    this.parentId = data.parentId
    this.name = data.name
    this.password = data.password
    this.sex = data.sex
    this.region = data.region
    this.email = data.email
    this.age = data.age
    this.flag = data.flag
    this.describe = data.describe
    this.describe2 = data.describe2
    this.describe3 = data.describe3
    this.createTime = data.createTime
    this.updateTime = data.updateTime
  }
}
var userList = template(require('./user/list.json'))
DELETE('/api/user/delete/{id}', removeByPathVariable(userList, UserVO, 'id'))
POST('/api/user/add', insertByBody(userList, UserVO, 'id'))
POST('/api/user/update', updateByBody(userList, UserVO, 'id'))
POST('/api/user/save', saveListByBody(userList, UserVO, 'id'))
GET('/api/user/list', request => sortList(userList).slice(0, 10))
GET('/api/user/page/list/{pageSize}/{currentPage}', getPageList(userList, 'pageSize', 'currentPage'))

// file api
class FileVO {
  constructor (data) {
    this.id = data.id
    this.parentId = data.parentId
    this.name = data.name
    this.size = data.size
    this.type = data.type
    this.createTime = data.createTime
    this.updateTime = data.updateTime
  }
}
var fileList = template(require('./file/list.json'))
DELETE('/api/file/delete/{id}', removeByPathVariable(fileList, FileVO, 'id'))
POST('/api/file/add', insertByBody(fileList, FileVO, 'id'))
POST('/api/file/update', updateByBody(fileList, FileVO, 'id'))
POST('/api/file/save', saveListByBody(fileList, FileVO, 'id'))
GET('/api/file/list', request => fileList)
