<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">如果存在校验不通过的列则不允许新增</p>
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验3-10个字符）attr1字段（校验数字）attr2字段（校验必填，校验数字）sex字段（校验必填）age字段（自定义校验，18-28之间）rate字段（校验最少选中3颗星）</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent(0)">新增一行</el-button>
      <el-button type="success" size="mini" @click="insertEvent(-1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="warning" size="mini" @click="validEvent">校验</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">校验&保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getRemoveEvent">获取已删除数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="click-table9"
      stripe
      border
      size="medium"
      height="480"
      :edit-rules="validRules"
      :edit-config="{useDefaultValidTip: true}"
      style="width: 100%">
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="attr1" label="属性1" :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="attr2" label="属性2(必填)" :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="birthdate" label="日期" width="220" :edit-render="{name: 'ElDatePicker', attrs: {type: 'date', format: 'yyyy-MM-dd'}}"></el-editable-column>
      <el-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="rate" label="评分" :edit-render="{name: 'ElRate', type: 'visible'}"></el-editable-column>
      <el-editable-column label="操作">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEAjax from 'xe-ajax'
import { MessageBox } from 'element-ui'

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
      if (parseInt(value || 0) < 3) {
        callback(new Error('亲，不能低于最3颗星'))
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
        sex: [
          { required: true, message: '请选择性别', trigger: 'blur' }
        ],
        age: [
          { validator: checkAge, trigger: 'blur' }
        ],
        rate: [
          { validator: checkRate, trigger: 'blur' }
        ],
        attr1: [
          { type: 'number', message: '请输入有效的数字', trigger: 'blur' }
        ],
        attr2: [
          { required: true, type: 'number', message: '请输入有效的数字', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.findSexList()
      this.findRegionList()
    },
    findSexList () {
      XEAjax.doGet('/api/conf/sex/list').then(({ data }) => {
        this.sexList = data
      })
    },
    findRegionList () {
      XEAjax.doGet('/api/conf/region/list').then(({ data }) => {
        this.regionList = data
      })
    },
    insertEvent (index) {
      if (!this.$refs.editable.checkValid().error) {
        let row = this.$refs.editable.insertAt(null, index)
        this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
      }
    },
    removeEvent (row) {
      this.$refs.editable.remove(row)
    },
    validEvent () {
      this.$refs.editable.validate().then(valid => {
        alert('通过')
      }).catch(valid => {
        console.log('error submit!!')
      })
    },
    submitEvent () {
      this.$refs.editable.validate().then(valid => {
        let { insertRecords, removeRecords, updateRecords } = this.$refs.editable.getAllRecords()
        this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {

        })
      }).catch(valid => {
        console.log('error submit!!')
      })
    },
    getInsertEvent () {
      let rest = this.$refs.editable.getInsertRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取新增数据(${rest.length}条)` }).catch(e => e)
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` }).catch(e => e)
    },
    getRemoveEvent () {
      let rest = this.$refs.editable.getRemoveRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已删除数据(${rest.length}条)` }).catch(e => e)
    },
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    postJSON (data) {
      // 提交请求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    }
  }
}
</script>
