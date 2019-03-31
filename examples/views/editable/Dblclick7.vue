<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">树表格</p>

    <div class="dblclick-table7-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="warning" size="mini" @click="validEvent">校验</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <el-editable
      ref="editable"
      class="dblclick-table7"
      border
      highlight-current-row
      size="mini"
      row-key="id"
      :data.sync="list"
      :row-class-name="tableRowClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'dblclick', mode: 'cell', validTooltip: { placement: 'right', popperClass: 'dblclick-table7-validtip' }}"
      @blur-active="blurActiveEvent"
      @current-change="handleCurrentChange"
      style="width: 100%">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column prop="id" label="ID" width="160"></el-editable-column>
      <el-editable-column prop="name" label="名称" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="size" label="大小" width="100" :formatter="formatColumnSize"></el-editable-column>
      <el-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column prop="updateTime" label="修改时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column label="操作" width="100">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </el-editable-column>
    </el-editable>
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
      XEAjax.doGet('/api/file/list').then(({ data }) => {
        this.list = XEUtils.toArrayTree(data, { key: 'id', parentKey: 'parentId' })
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
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
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd hh:mm:ss')
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
      this.$refs.editable.validateRow(row)
    },
    insertEvent () {
      let data = {
        id: Date.now(),
        name: `New ${Date.now()}`,
        age: 26,
        flag: false
      }
      this.$refs.editable.insertAt(data, this.currentRow).then(row => {
        // 由于 ElementUI 树表格不支持双向数据导致 remove 后界面无法响应，可以通过调用 refresh 刷新表格
        this.$refs.editable.refresh().then(() => {
          this.$refs.editable.setActiveCell(row, 'name')
        })
      })
    },
    removeEvent (row) {
      MessageBox.confirm('确定移除该数据?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.editable.remove(row)
        // 由于 ElementUI 树表格不支持双向数据导致 remove 后界面无法响应，可以通过调用 refresh 刷新表格
        this.$refs.editable.refresh()
      }).catch(e => e)
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
      let removeRecords = this.$refs.editable.getSelecteds()
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
    validEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          Message({
            type: 'success',
            message: '校验通过!'
          })
        } else {
          Message({
            type: 'error',
            message: '校验不通过!'
          })
        }
      })
    },
    submitEvent () {
      this.$refs.editable.validate(valid => {
        if (valid) {
          let removeRecords = this.pendingRemoveList
          let { insertRecords, updateRecords } = this.$refs.editable.getAllRecords()
          if (insertRecords.length || updateRecords.length || removeRecords.length) {
            insertRecords.forEach(item => {
              if (XEUtils.isDate(item.date)) {
                item.date = item.date.getTime()
              }
            })
            updateRecords.forEach(item => {
              if (XEUtils.isDate(item.date)) {
                item.date = item.date.getTime()
              }
            })
            this.loading = true
            XEAjax.doPost('/api/file/save', { insertRecords, updateRecords, removeRecords }).then(({ data }) => {
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
      this.$refs.editable.exportCsv()
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
.dblclick-table7.editable .editable-row.new-insert,
.dblclick-table7.editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
.el-tooltip__popper.editable-valid_tooltip.dblclick-table7-validtip {
  background: red;
}
.el-tooltip__popper.editable-valid_tooltip.dblclick-table7-validtip[x-placement^=right] .popper__arrow,
.el-tooltip__popper.editable-valid_tooltip.dblclick-table7-validtip[x-placement^=right] .popper__arrow::after {
  border-right-color: red;
}
</style>
