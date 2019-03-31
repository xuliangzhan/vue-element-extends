<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">如果是手动模式会自动关闭触发激活</p>

    <div class="manual-table1-oper">
      <el-button type="success" size="small" @click="insertEvent">新增</el-button>
      <el-button type="success" size="small" @click="exportCsvEvent">导出</el-button>
    </div>

    <el-editable
      ref="editable"
      class="manual-table1"
      border
      size="small"
      :data.sync="list"
      :edit-config="{trigger: 'manual', mode: 'row', clearActiveMethod}"
      style="width: 100%">
      <el-editable-column prop="id" label="ID" width="80"></el-editable-column>
      <el-editable-column prop="name" label="角色" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="describe" label="描述" :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></el-editable-column>
      <el-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column label="操作" width="160">
        <template v-slot="scope">
          <template v-if="$refs.editable.hasActiveRow(scope.row)">
            <el-button size="small" type="success" @click="saveRowEvent(scope.row)">保存</el-button>
            <el-button size="small" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
          </template>
          <template v-else>
            <el-button size="small" type="primary" @click="openActiveRowEvent(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </el-editable-column>
      <template v-slot:append>
        <div>-- slot append --</div>
      </template>
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
      isClearActiveFlag: true
    }
  },
  created () {
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      XEAjax.doGet('/api/role/list').then(({ data }) => {
        this.list = data
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd hh:mm:ss')
    },
    clearActiveMethod ({ type, row }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkOutSave(row) : this.isClearActiveFlag
    },
    insertEvent () {
      let activeInfo = this.$refs.editable.getActiveRow()
      let { insertRecords } = this.$refs.editable.getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        this.$refs.editable.insert({
          name: `New ${Date.now()}`,
          age: 26,
          flag: false
        }).then(row => {
          this.$refs.editable.setActiveRow(row)
        })
      }
    },
    // 点击表格外面处理
    checkOutSave (row) {
      if (!row.id) {
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
      if (!row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('该数据未保存，是否移除?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '移除数据',
          cancelButtonText: '返回继续',
          type: 'warning'
        }).then(action => {
          if (action === 'confirm') {
            this.$refs.editable.remove(row)
          }
        }).catch(action => action).then(() => {
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
      if (row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          XEAjax.doDelete(`/api/role/delete/${row.id}`).then(({ data }) => {
            this.findList()
          }).catch(e => {
            this.loading = false
          })
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs.editable.remove(row)
      }
    },
    saveRowEvent (row) {
      this.$refs.editable.validateRow(row, valid => {
        if (valid) {
          let url = '/api/role/add'
          if (row.id) {
            url = '/api/role/update'
          }
          this.loading = true
          this.$refs.editable.clearActive()
          XEAjax.doPost(url, row).then(({ data }) => {
            this.findList()
            Message({ message: '保存成功', type: 'success' })
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
.manual-table1-oper {
  margin-bottom: 18px;
}
.manual-table1.editable .editable-row.new-insert,
.manual-table1.editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
