<template>
  <div v-loading="loading">
    <el-button type="success" @click="$refs.editable.insert()">新增一行</el-button>
    <el-button type="success" @click="$refs.editable.insertAt(null, -1)">在最后新增一行</el-button>
    <el-button type="danger" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
    <el-button type="info" @click="$refs.editable.revert()">放弃更改</el-button>
    <el-button type="info" @click="$refs.editable.clear()">清空数据</el-button>
    <el-button type="warning" @click="submitEvent">校验&保存</el-button>
    <el-button type="primary" @click="getInsertEvent">获取新增数据</el-button>
    <el-button type="primary" @click="getUpdateEvent">获取已修改数据</el-button>
    <el-button type="primary" @click="getRemoveEvent">获取已删除数据</el-button>
    <el-button type="primary" @click="getAllEvent">获取所有数据</el-button>
    <el-editable ref="editable" stripe border size="medium" height="600" style="width: 100%" :editRules="validRules">
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="attr1" label="校验数字" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="attr2" label="校验数字(必填)" :editRender="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="sex" label="性别" :editRender="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row, scope.$index)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    const checkAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('年龄不能为空'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (parseInt(value) < 18 || parseInt(value) > 28) {
            callback(new Error('年龄必须在18-28之间'))
          } else {
            callback()
          }
        }
      }, 50)
    }
    const checkRate = (rule, value, callback) => {
      if (parseInt(value || 0) < 2) {
        callback(new Error('最小选择2颗星'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      columnConfigs: [],
      sexList: [],
      regionList: [],
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, max: 10, message: '名称长度在 3 到 10 个字符', trigger: 'change' }
        ],
        attr1: [
          { type: 'number', message: '请输入有效的数字', trigger: 'blur' }
        ],
        attr2: [
          { required: true, type: 'number', message: '请输入有效的数字', trigger: 'blur' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        age: [
          { validator: checkAge, trigger: 'blur' }
        ],
        birthdate: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        rate: [
          { validator: checkRate, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.findList()
      this.getSexJSON().then(data => {
        this.sexList = data
      })
      this.getRegionJSON().then(data => {
        this.regionList = data
      })
    },
    findList () {
      this.loading = true
      this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    removeEvent (row, index) {
      this.$refs.editable.removeRow(index)
    },
    submitEvent () {
      this.$refs.editable.validate().then(valid => {
        let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
        this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
          this.findList()
        })
      }).catch(valid => {
        console.log('error submit!!')
      })
    },
    getInsertEvent () {
      let rest = this.$refs.editable.getInsertRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取新增数据(${rest.length}条)` })
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` })
    },
    getRemoveEvent () {
      let rest = this.$refs.editable.getRemoveRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已删除数据(${rest.length}条)` })
    },
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` })
    },
    postJSON (data) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(sexData, true)), 100)
      })
    },
    getDataJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(listData, true)), 350)
      })
    },
    getRegionJSON () {
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(regionData, true)), 200)
      })
    }
  }
}
</script>
