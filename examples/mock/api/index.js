import { template, DELETE, POST, GET } from 'xe-ajax-mock'
import MockUtil from './util'

GET('/api/conf/region/list', require('./conf/region.json'))
GET('/api/conf/sex/list', require('./conf/sex.json'))
GET('/api/conf/columns/list', require('./conf/columns.json'))

class RoleVO {
  constructor (data) {
    this.id = data.id
    this.name = data.name
    this.describe = data.describe
    this.createTime = data.createTime
    this.updateTime = data.updateTime
  }
}
const roleList = template(require('./role/list.json'))
DELETE('/api/role/delete/{id}', MockUtil.deleteByPathVariable(roleList, RoleVO, 'id'))
POST('/api/role/add', MockUtil.insertByBody(roleList, RoleVO, 'id'))
POST('/api/role/update', MockUtil.updateByBody(roleList, RoleVO, 'id'))
POST('/api/role/save', MockUtil.saveListByBody(roleList, RoleVO, 'id'))
GET('/api/role/list', MockUtil.findDescSortList(roleList, RoleVO, ['updateTime'], 10))
GET('/api/role/page/list/{pageSize}/{currentPage}', MockUtil.findDescSortPageList(roleList, RoleVO, ['updateTime']))

class UserVO {
  constructor (data) {
    this.id = data.id
    this.name = data.name
    this.password = data.password
    this.sex = data.sex
    this.role = data.role
    this.region = data.region
    this.email = data.email
    this.age = data.age
    this.rate = data.rate
    this.flag = data.flag
    this.phone = data.phone
    this.describe = data.describe
    this.describe2 = data.describe2
    this.describe3 = data.describe3
    this.createTime = data.createTime
    this.updateTime = data.updateTime
    this.attr1 = data.attr1
    this.attr2 = data.attr2
    this.attr3 = data.attr3
    this.attr4 = data.attr4
    this.attr5 = data.attr5
    this.attr6 = data.attr6
  }
}
const userList = template(require('./user/list.json'))
DELETE('/api/user/delete/{id}', MockUtil.deleteByPathVariable(userList, UserVO, 'id'))
POST('/api/user/add', MockUtil.insertByBody(userList, UserVO, 'id'))
POST('/api/user/update', MockUtil.updateByBody(userList, UserVO, 'id'))
POST('/api/user/save', MockUtil.saveListByBody(userList, UserVO, 'id'))
GET('/api/user/list', MockUtil.findDescSortList(userList, UserVO, ['updateTime'], 10))
GET('/api/user/page/list/{pageSize}/{currentPage}', MockUtil.findDescSortPageList(userList, UserVO, ['updateTime']))

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
const fileList = template(require('./file/list.json'))
DELETE('/api/file/delete/{id}', MockUtil.deleteByPathVariable(fileList, FileVO, 'id'))
POST('/api/file/add', MockUtil.insertByBody(fileList, FileVO, 'id'))
POST('/api/file/update', MockUtil.updateByBody(fileList, FileVO, 'id'))
POST('/api/file/save', MockUtil.saveListByBody(fileList, FileVO, 'id'))
GET('/api/file/list', MockUtil.findDescSortList(fileList, FileVO, ['updateTime']))
GET('/api/file/page/list/{pageSize}/{currentPage}', MockUtil.findDescSortPageList(fileList, FileVO, ['updateTime']))
