<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验最少3个字符）</p>
    <p style="color: red;font-size: 12px;">上下左右方向键切换列、Tab 键切换列、选中后可直接输入值覆盖旧值</p>

    <p>
      <el-button type="success" size="mini" @click="insertEvent(0)">新增一行</el-button>
      <el-button type="success" size="mini" @click="insertEvent(-1)">在最后新增一行</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.revert()">放弃更改</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clear()">清空数据</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearFilter()">清空筛选条件</el-button>
      <el-button type="info" size="mini" @click="$refs.editable.clearSort()">清空排序条件</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">校验&保存</el-button>
      <el-button type="primary" size="mini" @click="getInsertEvent">获取新增数据</el-button>
      <el-button type="primary" size="mini" @click="getUpdateEvent">获取已修改数据</el-button>
      <el-button type="primary" size="mini" @click="getPendingRemoveEvent">获取已标记删除数据</el-button>
      <el-button type="primary" size="mini" @click="getSelectedEvent">获取已选中数据</el-button>
      <el-button type="primary" size="mini" @click="getAllEvent">获取所有数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="click-table13"
      border
      height="600"
      size="medium"
      :row-class-name="tableRowClassName"
      @select="selectEvent"
      @current-change="currentChangeEvent"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell', showIcon: true, showStatus: true, isTabKey: true, isArrowKey: true, activeMethod}"
      style="width: 100%">
      <el-editable-column
        type="selection"
        width="55"></el-editable-column>
      <el-editable-column
        type="index"
        width="55"></el-editable-column>
      <el-editable-column
        prop="sex"
        label="性别"
        width="100"
        :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column
        prop="name"
        label="名字"
        min-width="220"
        show-overflow-tooltip
        :edit-render="{name: 'ElInput', attrs: {clearable: true}}"></el-editable-column>
      <el-editable-column
        prop="age"
        label="年龄"
        width="140"
        align="center"
        headerAlign="center"
        :filters="ageFilterList"
        :filter-method="filterHandler"
        :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column
        prop="region"
        label="地区"
        min-width="180"
        :edit-render="{name: 'ElCascader', attrs: {clearable: true, options: regionList, separator: '-'}}"></el-editable-column>
      <el-editable-column
        prop="remark"
        label="备注"
        min-width="180"
        :edit-render="{name: 'ElInput', attrs: {clearable: true}}"></el-editable-column>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox, Message } from 'element-ui'
import listData from '@/common/json/editable/list.json'
import regionData from '@/common/json/editable/region.json'
import sexData from '@/common/json/editable/sex.json'

export default {
  data () {
    return {
      loading: false,
      sexList: [],
      regionList: [],
      pendingRemoveList: [],
      orderDataList: [
        {
          value: '136'
        },
        {
          value: '1362'
        },
        {
          value: '13886'
        }
      ],
      ageFilterList: [
        {
          text: '26',
          value: 26
        },
        {
          text: '24',
          value: 24
        },
        {
          text: '22',
          value: 22
        }
      ],
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
      this.pendingRemoveList = []
      this.getDataJSON().then(data => {
        this.$refs.editable.reload(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    insertEvent (index) {
      let row = this.$refs.editable.insertAt({ name: '隔壁老徐', age: 26 }, index)
      this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'sex'))
    },
    tableRowClassName ({ row, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return 'delete-row'
      }
      return ''
    },
    activeMethod ({ row, column, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return false
      }
      return true
    },
    pendingRemoveEvent () {
      let selection = this.$refs.editable.getSelecteds()
      if (selection.length) {
        let plus = []
        let minus = []
        selection.forEach(data => {
          if (this.pendingRemoveList.some(item => data === item)) {
            minus.push(data)
          } else {
            plus.push(data)
          }
        })
        if (minus.length) {
          this.pendingRemoveList = this.pendingRemoveList.filter(item => minus.some(data => data !== item)).concat(plus)
        } else if (plus) {
          this.pendingRemoveList = this.pendingRemoveList.concat(plus)
        }
        this.$refs.editable.clearSelection()
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
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
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.postJSON('url', { row }).then(data => {
            Message({ message: '保存成功', type: 'success' })
          })
        } else {
          console.log('error row submit!!')
        }
      })
    },
    cancelRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          this.$refs.editable.clearActive()
        } else {
          // 关闭取消编辑状态
          this.$refs.editable.clearActive()
        }
      })
    },
    selectEvent (selection, row) {
      console.log(selection)
    },
    currentChangeEvent (currentRow, oldCurrentRow) {
      console.log(currentRow)
    },
    formatterOrder (row, column, cellValue, index) {
      return `订单号：${cellValue}`
    },
    submitEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          let removeRecords = this.pendingRemoveList
          let { insertRecords, updateRecords } = this.$refs.editable.getAllRecords()
          this.postJSON('url', { insertRecords, removeRecords, updateRecords }).then(data => {
            this.findList()
          })
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
    getPendingRemoveEvent () {
      let rest = this.pendingRemoveList
      MessageBox({ message: JSON.stringify(rest), title: `获取已标记删除数据(${rest.length}条)` }).catch(e => e)
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
    birthdateSortHandler (a, b) {
      return a.birthdate > b.birthdate ? 1 : -1
    },
    filterHandler (value, row, column) {
      return row[column.property] === value
    },
    querySearchAsync (queryString, cb) {
      var orderDataList = this.orderDataList
      var results = queryString ? orderDataList.filter(this.createStateFilter(queryString)) : orderDataList
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        cb(results)
      }, 3000 * Math.random())
    },
    createStateFilter (queryString) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
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
        setTimeout(() => resolve(XEUtils.clone(listData, true)), 350)
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

<style>
.click-table13 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
.click-table13 .editable-col_active .cell {
  padding: 0 5px;
}
.click-table13 .el-input .el-input__inner {
  padding: 0 15px 0 4px;
}
.click-table13 .el-input-number .el-input__inner {
  padding: 0 43px;
}
.click-table13 .el-cascader .el-cascader__label {
  padding: 0 25px 0 5px;
}
.click-table13 .el-date-editor .el-input__inner {
  padding: 0 30px;
}
.click-table13 .el-table__body .el-table__row>td.editable-col_checked {
  box-shadow: inset 0 0 6px #67C23A;
}
</style>
