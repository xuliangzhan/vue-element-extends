<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验最少3个字符）</p>
    <p style="color: red;font-size: 12px;">多级属性：由于 v-model 必须明确指定双向绑定的路径，所以需要配合自定义渲染使用</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent(0)">新增一行</el-button>
      <el-button type="success" size="mini" @click="insertEvent(-1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
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
      :edit-config="{trigger: 'click', mode: 'cell', showIcon: true, showStatus: true}"
      style="width: 100%">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="name" label="名字" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"> </el-editable-column>
      <el-editable-column prop="sex" label="性别" width="100" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="userInfo.sex1" label="方式1" width="160" :edit-render="{type: 'default'}">
        <template slot="edit" slot-scope="scope">
          <el-select v-model="scope.row.userInfo.sex1" placeholder="请选择性别" clearable @change="$refs.editable.updateStatus(scope)">
            <el-option v-for="(item, index) in sexList" :key="index" :value="item.val" :label="item.spell"></el-option>
          </el-select>
        </template>
        <template slot-scope="scope">{{ getSelectLabel(scope.row.userInfo.sex1, 'val', 'spell', sexList) }}</template>
      </el-editable-column>
      <el-editable-column prop="userInfo.sex2" label="方式2" width="160" :edit-render="{name: 'ElSelect', options: sexList, optionProps: {value: 'value', label: 'spell'}, attrs: {clearable: true, placeholder: '请选择性别'}}">
        <template slot="edit" slot-scope="scope">
          <el-select v-model="scope.row.userInfo.sex2" v-bind="scope.editRender.attrs" @change="$refs.editable.updateStatus(scope)">
            <el-option v-for="(item, index) in sexList" :key="index" :value="item.value" :label="item.spell"></el-option>
          </el-select>
        </template>
      </el-editable-column>
      <el-editable-column prop="userInfo.base.age" label="年龄" width="160" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}">
        <template slot="edit" slot-scope="scope">
          <el-input-number v-model="scope.row.userInfo.base.age" v-bind="scope.editRender.attrs" @input="$refs.editable.updateStatus(scope)"></el-input-number>
        </template>
      </el-editable-column>
      <el-editable-column prop="userInfo.region" label="地区" min-width="180" :edit-render="{name: 'ElCascader', attrs: {options: regionList, separator: '-'}}">
        <template slot="edit" slot-scope="scope">
          <el-cascader v-model="scope.row.userInfo.region" v-bind="scope.editRender.attrs" @change="$refs.editable.updateStatus(scope)"></el-cascader>
        </template>
      </el-editable-column>
      <el-editable-column prop="dateObj.date1" label="选择日期" width="220" sortable :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd hh:mm:ss'}}">
        <template slot="edit" slot-scope="scope">
          <el-date-picker v-model="scope.row.dateObj.date1" v-bind="scope.editRender.attrs" @change="$refs.editable.updateStatus(scope)"></el-date-picker>
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
    getSelectLabel (value, valueProp, labelProp, list) {
      let item = list.find(item => item[valueProp] === value)
      return item ? item[labelProp] : null
    },
    insertEvent (index) {
      let row = this.$refs.editable.insertAt({ name: '默认名字2', userInfo: { base: { age: 26 } }, slider: 20 }, index)
      this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
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
        Message({ message: '数据还原成功！', type: 'success' })
      }).catch(e => e)
    },
    selectEvent (selection, row) {
      console.log(selection)
    },
    currentChangeEvent (currentRow, oldCurrentRow) {
      console.log(oldCurrentRow)
    },
    deleteSelectedEvent () {
      let selection = this.$refs.editable.getSelecteds()
      if (selection.length) {
        this.postJSON('url', { selection }).then(data => {
          Message({ message: '删除成功', type: 'success' })
          this.findList()
        })
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
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
    getSelectedEvent () {
      let rest = this.$refs.editable.getSelecteds()
      MessageBox({ message: JSON.stringify(rest), title: `获取已选中数据(${rest.length}条)` }).catch(e => e)
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
              sex1: 'o',
              sex2: '1',
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
              sex1: 'x',
              sex2: '0',
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
              sex1: 'o',
              sex2: '1',
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
