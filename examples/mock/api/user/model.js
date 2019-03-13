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

export default UserVO
