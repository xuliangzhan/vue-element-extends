<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验最少3个字符）</p>
    <p style="color: red;font-size: 12px;">第1行不允许勾选</p>
    <p style="color: red;font-size: 12px;">第3行的年龄和出生日期不允许编辑</p>
    <p style="color: red;font-size: 12px;">多级属性：由于多级属性必须明确指定双向绑定的路径，所以只能配合自定义渲染使用</p>

    <p>
      <el-button type="success" size="mini" @click="$refs.editable.insert({name: '默认名字2', age: 1, slider: 10})">新增一行</el-button>
      <el-button type="success" size="mini" @click="$refs.editable.insertAt({name: '默认名字2', age: 3, slider: 20}, -1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="$refs.editable.removeSelecteds()">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearFilter()">清空筛选条件</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearSort()">清空排序条件</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">校验&保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getRemoveEvent">获取已删除数据</el-button>
      <el-button type="primary" size="mini" @click="getSelectedEvent">获取已选中数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      stripe
      border
      height="480"
      size="medium"
      @select="selectEvent"
      @current-change="currentChangeEvent"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell', showIcon: true, showStatus: true, activeMethod}"
      style="width: 100%">
      <el-editable-column type="selection" width="55" :selectable="selectableEvent"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="sex" label="性别" width="100" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="name" label="名字（带校验的自定义渲染)" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"> </el-editable-column>
      <el-editable-column prop="userInfo.base.age" label="年龄" width="140" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}">
        <template slot="edit" slot-scope="scope">
          <el-input-number v-model="scope.row.userInfo.base.age" v-bind="scope.editRender.attrs"></el-input-number>
        </template>
      </el-editable-column>
      <el-editable-column prop="userInfo.region" label="地区" min-width="180" :edit-render="{name: 'ElCascader', attrs: {options: regionList, separator: '-'}}">
        <template slot="edit" slot-scope="scope">
          <el-cascader v-model="scope.row.userInfo.region" v-bind="scope.editRender.attrs"></el-cascader>
        </template>
      </el-editable-column>
      <el-editable-column prop="dateObj.date1" label="选择日期" width="220" sortable :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}">
        <template slot="edit" slot-scope="scope">
          <el-date-picker v-model="scope.row.dateObj.date1" v-bind="scope.editRender.attrs"></el-date-picker>
        </template>
      </el-editable-column>
      <el-editable-column prop="slider" label="滑块" width="200" :edit-render="{name: 'ElSlider', type: 'visible'}"></el-editable-column>
      <el-editable-column label="操作" width="180">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope)">删除</el-button>
          <el-button size="mini" type="warning" @click="revertEvent(scope.row)">默认值</el-button>
        </template>
      </el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox, Message } from 'element-ui'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    return {
      loading: false,
      sexList: [],
      regionList: [],
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, message: '名称长度最小 3 个字符', trigger: 'change' }
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
      return this.loadList().then(data => {
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    loadList () {
      return this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
      })
    },
    activeMethod (row, column, index) {
      if (index === 2 && ['age', 'birthdate'].includes(column.property)) {
        Message({ message: '第3行的年龄和出生日期不允许编辑', type: 'warning' })
        return false
      }
      return true
    },
    removeEvent (scope) {
      MessageBox.confirm('确定删除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(scope.row)
      }).catch(e => e)
    },
    revertEvent (row) {
      MessageBox.confirm('确定还原该行数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.revert(row)
      }).catch(e => e)
    },
    selectEvent (selection, row) {
      console.log(selection)
    },
    currentChangeEvent (currentRow, oldCurrentRow) {
      console.log(oldCurrentRow)
    },
    submitEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          alert('成功')
        } else {
          console.log('error submit!!')
          return false
        }
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
    getSelectedEvent () {
      let rest = this.$refs.editable.getSelecteds()
      MessageBox({ message: JSON.stringify(rest), title: `获取已选中数据(${rest.length}条)` })
    },
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` })
    },
    selectableEvent (row, index) {
      return index >= 1
    },
    postJSON (data) {
      // 提交请求
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('保存成功')
        }, 300)
      })
    },
    getSexJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(sexData, true)), 100)
      })
    },
    getDataJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve([
          {
            name: '数据1',
            sex: '1',
            slider: 10,
            userInfo: {
              region: [1, 1, 3],
              base: {
                age: 24
              }
            },
            dateObj: {
              date1: 1550588308445,
              date2: 1550588308445
            }
          },
          {
            name: '数据2',
            sex: '1',
            slider: 20,
            userInfo: {
              region: [1, 1, 4],
              base: {
                age: 26
              }
            },
            dateObj: {
              date1: 1550588308445,
              date2: 1550588308445
            }
          },
          {
            name: '数据3',
            sex: '1',
            slider: 10,
            userInfo: {
              region: [1, 1, 5],
              base: {
                age: 28
              }
            },
            dateObj: {
              date1: 1550588308445,
              date2: 1550588308445
            }
          }
        ]), 300)
      })
    },
    getRegionJSON () {
      // 模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(XEUtils.clone(regionData, true)), 200)
      })
    }
  }
}
</script>

<style scoped>
.editable-custom_input {
  width: 95%;
}
</style>
