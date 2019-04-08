<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">默认编辑树表格</p>

    <div class="manual-table6-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="editable"
      class="manual-table6"
      border
      size="mini"
      row-key="id"
      highlight-current-row
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'manual', mode: 'row', useDefaultValidTip: true, clearActiveMethod}"
      @current-change="handleCurrentChange"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="140" :formatter="formatterId"></elx-editable-column>
      <elx-editable-column prop="name" label="名称" min-width="220" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="size" label="大小" width="100" :formatter="formatColumnSize"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="修改时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column label="操作" width="150" fixed="right">
        <template v-slot="scope">
          <template v-if="$refs.editable.hasActiveRow(scope.row)">
            <el-button size="mini" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </elx-editable-column>
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
      currentRow: null,
      sexList: [],
      regionList: [],
      list: [],
      isClearActiveFlag: true,
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
      XEAjax.doGet('/api/file/list').then(({ data }) => {
        this.list = XEUtils.toArrayTree(data)
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    formatterId (row, column, cellValue, index) {
      return this.$refs.editable.hasRowInsert(row) ? '' : cellValue
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
    clearActiveMethod ({ type, row }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkOutSave(row) : this.isClearActiveFlag
    },
    handleCurrentChange (val) {
      this.currentRow = val
    },
    insertEvent () {
      let activeInfo = this.$refs.editable.getActiveRow()
      let { insertRecords } = this.$refs.editable.getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        let data = {
          id: '-',
          name: `New ${Date.now()}`
        }
        if (this.currentRow && this.currentRow.parentId) {
          data.parentId = this.currentRow.parentId
        }
        this.$refs.editable.insertAt(data, this.currentRow).then(({ row }) => {
          // 由于 ElementUI 树表格不支持双向数据导致 remove 后界面无法响应，可以通过调用 refresh 刷新表格
          this.$refs.editable.refresh()
            .then(() => this.$refs.editable.setActiveCell(row, 'name'))
        })
      }
    },
    // 点击表格外面处理
    checkOutSave (row) {
      if (!this.$refs.editable.checkValid().error) {
        if (row.id === '-') {
          this.isClearActiveFlag = false
          MessageBox.confirm('该数据未保存，请确认操作?', '温馨提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '保存数据',
            cancelButtonText: '移除数据',
            type: 'warning'
          }).then(action => {
            this.$refs.editable.clearActive()
            this.saveRowEvent(row)
          }).catch(action => {
            if (action === 'cancel') {
              this.$refs.editable.remove(row)
              // 由于 ElementUI 树表格不支持双向数据导致 remove 后界面无法响应，可以通过调用 refresh 刷新表格
              this.$refs.editable.refresh()
            }
          }).then(() => {
            this.isClearActiveFlag = true
          })
        } else if (this.$refs.editable.hasRowChange(row)) {
          this.isClearActiveFlag = false
          MessageBox.confirm('检测到未保存的内容，请确认操作?', '温馨提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '保存数据',
            cancelButtonText: '取消修改',
            type: 'warning'
          }).then(() => {
            this.$refs.editable.clearActive()
            this.saveRowEvent(row)
          }).catch(action => {
            if (action === 'cancel') {
              this.$refs.editable.revert(row)
              this.$refs.editable.clearActive()
            }
          }).then(() => {
            this.isClearActiveFlag = true
          })
          return false
        }
      }
      return this.isClearActiveFlag
    },
    // 编辑处理
    openActiveRowEvent (row) {
      this.$nextTick(() => {
        let activeInfo = this.$refs.editable.getActiveRow()
        if (activeInfo && activeInfo.isUpdate) {
          this.isClearActiveFlag = false
          MessageBox.confirm('检测到未保存的内容，请确认操作?', '温馨提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '保存数据',
            cancelButtonText: '取消修改',
            type: 'warning'
          }).then(() => {
            this.$refs.editable.setActiveRow(row)
            this.saveRowEvent(activeInfo.row)
          }).catch(action => {
            if (action === 'cancel') {
              this.$refs.editable.revert(activeInfo.row)
              this.$refs.editable.setActiveRow(row)
            }
          }).then(() => {
            this.isClearActiveFlag = true
          })
        } else {
          this.$refs.editable.setActiveRow(row)
        }
      })
    },
    // 取消处理
    cancelRowEvent (row) {
      if (row.id === '-') {
        this.isClearActiveFlag = false
        MessageBox.confirm('该数据未保存，是否移除?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '移除数据',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs.editable.remove(row)
            // 由于 ElementUI 树表格不支持双向数据导致 remove 后界面无法响应，可以通过调用 refresh 刷新表格
            this.$refs.editable.refresh()
          }
        }).catch(e => e).then(() => {
          this.isClearActiveFlag = true
        })
      } else if (this.$refs.editable.hasRowChange(row)) {
        this.isClearActiveFlag = false
        MessageBox.confirm('检测到未保存的内容，是否取消修改?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '取消修改',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          this.$refs.editable.clearActive()
          this.$refs.editable.revert(row)
        }).catch(action => {
          if (action === 'cancel') {
            this.$refs.editable.setActiveRow(row)
          }
        }).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs.editable.clearActive()
      }
    },
    removeEvent (row) {
      if (row.id === '-') {
        this.$refs.editable.remove(row)
      } else {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          XEAjax.doDelete(`/api/file/delete/${row.id}`).then(({ data }) => {
            this.findList()
          })
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      }
    },
    deleteSelectedEvent () {
      let removeRecords = this.$refs.editable.getSelecteds()
      if (removeRecords.length) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定删除所选数据?', '温馨提示', {
          distinguishCancelAndClose: true,
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
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
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
          let url = '/api/file/update'
          if (row.id === '-') {
            url = '/api/file/add'
          }
          if (XEUtils.isDate(row.date)) {
            row.date = row.date.getTime()
          }
          this.loading = true
          this.$refs.editable.clearActive()
          // 局部保存
          XEAjax.doPost(url, row).then(({ data }) => {
            // 更新数据
            XEUtils.destructuring(row, data[0])
            // 改变状态
            this.$refs.editable.reloadRow(row)
              .then(() => this.$refs.editable.refresh())
            Message({ message: '保存成功', type: 'success' })
            this.loading = false
          }).catch(e => {
            this.loading = false
          })
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
.manual-table6-oper {
  margin-bottom: 18px;
}
.manual-table6-pagination {
  margin-top: 18px;
  text-align: right;
}
.manual-table6.elx-editable .editable-row.new-insert,
.manual-table6.elx-editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
