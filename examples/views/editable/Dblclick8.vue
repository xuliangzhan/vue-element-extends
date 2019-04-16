<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">懒加载树表格：只支持小部分功能</p>

    <div class="dblclick-table7-oper">
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="dblclick-table7"
      border
      highlight-current-row
      row-key="id"
      lazy
      :load="loadMethod"
      :data.sync="list"
      :row-class-name="tableRowClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'dblclick', mode: 'cell'}"
      @blur-active="blurActiveEvent"
      @current-change="handleCurrentChange"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="160" :formatter="formatterId"></elx-editable-column>
      <elx-editable-column prop="name" label="名称" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="size" label="大小" width="100" :formatter="formatColumnSize"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="修改时间" width="160" :formatter="formatterDate"></elx-editable-column>
    </elx-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import { MessageBox, Message } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      list: [],
      currentRow: null,
      pendingRemoveList: [],
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, max: 50, message: '名称长度 4-20 个字符', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      this.pendingRemoveList = []
      return XEAjax.doGet('/api/file/node/list').then(({ data }) => {
        this.list = XEUtils.toArrayTree(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    formatterId (row, column, cellValue, index) {
      return this.$refs.elxEditable.hasRowInsert(row) ? '' : cellValue
    },
    formatColumnSize (row, column, cellValue, index) {
      if (XEUtils.isNumber(cellValue)) {
        let units = ['B', 'KB', 'MB', 'GB', 'TB']
        let unit = ''
        let size = XEUtils.toNumber(cellValue)
        for (let index = 0; index < units.length; index++) {
          unit = units[index]
          if (size >= 1024) {
            size = XEUtils.toFixedNumber(size / 1024, 2)
          } else {
            break
          }
        }
        return `${size} ${unit}`
      }
      return ''
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    tableRowClassName ({ row, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return 'delete-row'
      }
      return ''
    },
    handleCurrentChange (val) {
      this.currentRow = val
    },
    // 失焦后检查其他列，实现单元格连续编辑效果
    blurActiveEvent (row, column) {
      this.$refs.elxEditable.validateRow(row)
    },
    // 懒加载子节点
    loadMethod (tree, treeNode, resolve) {
      this.loading = true
      XEAjax.doGet('/api/file/node/list', { id: tree.id }).then(({ data }) => {
        this.loading = false
        resolve(data)
      }).catch(e => {
        this.loading = false
      })
    },
    pendingRemoveEvent () {
      let selection = this.$refs.elxEditable.getSelecteds()
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
        this.$refs.elxEditable.clearSelection()
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
    },
    deleteSelectedEvent () {
      let removeRecords = this.$refs.elxEditable.getSelecteds()
      if (removeRecords.length) {
        MessageBox.confirm('确定删除所选数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          XEAjax.doPost('/api/file/save', { removeRecords }).then(({ data }) => {
            Message({
              type: 'success',
              message: '删除成功!'
            })
            this.findList()
          }).catch(e => {
            this.loading = false
          })
        }).catch(e => e)
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
    },
    submitEvent () {
      this.$refs.elxEditable.validate(valid => {
        if (valid) {
          let removeRecords = this.pendingRemoveList
          let { updateRecords } = this.$refs.elxEditable.getAllRecords()
          if (updateRecords.length || removeRecords.length) {
            updateRecords.forEach(item => {
              if (XEUtils.isDate(item.date)) {
                item.date = item.date.getTime()
              }
            })
            this.loading = true
            XEAjax.doPost('/api/file/save', { updateRecords, removeRecords }).then(({ data }) => {
              Message({
                type: 'success',
                message: '保存成功!'
              })
              this.findList()
            }).catch(e => {
              this.loading = false
            })
          } else {
            Message({
              type: 'info',
              message: '数据未改动！'
            })
          }
        }
      })
    },
    exportCsvEvent () {
      this.$refs.elxEditable.exportCsv()
    }
  }
}
</script>

<style>
.dblclick-table7-oper {
  margin-bottom: 18px;
}
.dblclick-table7 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
</style>
