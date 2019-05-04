<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">动态列、个性化列渲染</p>

    <el-form ref="tableform" class="click-table6-form" size="mini" :inline="true" :model="formData">
      <el-form-item label="名字" prop="name">
        <el-input v-model="formData.name" placeholder="名字"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-input v-model="formData.role" placeholder="请输入角色"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="formData.sex" placeholder="性别">
          <el-option v-for="(item, index) in sexList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchEvent">查询</el-button>
        <el-button @click="$refs.tableform.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="click-table6-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="click-table6"
      border
      height="686"
      size="medium"
      :data.sync="list"
      :custom-columns.sync="customColumns"
      :row-class-name="tableRowClassName"
      :edit-config="{trigger: 'click', mode: 'row'}"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column type="index" width="55">
        <template v-slot:header>
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </elx-editable-column>
      <elx-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column prop="age" label="年龄" :edit-render="{name: 'ElInputNumber', props: {min: 1, max: 200}}"></elx-editable-column>
      <elx-editable-column prop="region" label="地区" :edit-render="{name: 'ElCascader', props: {options: regionList}}"></elx-editable-column>
      <elx-editable-column prop="date" label="日期" :edit-render="{name: 'ElDatePicker', props: {type: 'datetime', format: 'yyyy-MM-dd'}}"></elx-editable-column>
      <elx-editable-column prop="rate" label="评分" :edit-render="{name: 'ElRate', type: 'visible'}"></elx-editable-column>
      <elx-editable-column prop="attr1" label="属性1" :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="attr2" label="属性2" :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="attr3" label="属性3" :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="attr4" label="属性4" :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="attr5" label="属性5" :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column label="操作" width="100">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </elx-editable-column>
    </elx-editable>

    <el-pagination
      class="click-table6-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageVO.currentPage"
      :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
      :page-size="pageVO.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageVO.totalResult">
    </el-pagination>

    <el-dialog title="自定义列" :visible.sync="dialogVisible" width="540px" append-to-body @open="openCustomEvent">
      <el-transfer
        v-model="selectColumns"
        :data="allCustomColumnList"
        :titles="['隐藏列', '显示列']"
        :props="{key: 'prop', label: 'label'}"></el-transfer>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetCustomEvent">重 置</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCustomEvent">保 存</el-button>
        </span>
    </el-dialog>
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
      sexList: [],
      regionList: [],
      list: [],
      formData: {
        name: null,
        sex: null,
        role: null
      },
      pageVO: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      pendingRemoveList: [],
      dialogVisible: false,
      customColumns: [],
      selectColumns: []
    }
  },
  computed: {
    allCustomColumnList () {
      return this.customColumns.filter(item => item.prop)
    }
  },
  created () {
    this.loading = true
    Promise.all([
      this.findConfColumnsList(),
      this.findList()
    ]).catch(e => e).then(() => {
      this.loading = false
    })
    this.findSexList()
    this.findRegionList()
  },
  methods: {
    findList () {
      this.loading = true
      this.pendingRemoveList = []
      return XEAjax.doGet(`/api/user/page/list/${this.pageVO.pageSize}/${this.pageVO.currentPage}`, this.formData).then(response => {
        let { page, result } = response.data
        this.list = result
        this.pageVO.totalResult = page.totalResult
        this.loading = false
        return result
      }).catch(e => {
        this.loading = false
      })
    },
    findSexList () {
      return XEAjax.doGet('/api/conf/sex/list').then(({ data }) => {
        this.sexList = data
        return data
      })
    },
    findRegionList () {
      return XEAjax.doGet('/api/conf/region/list').then(({ data }) => {
        this.regionList = data
        return data
      })
    },
    findConfColumnsList () {
      return XEAjax.doGet('/api/conf/columns/list').then(({ data }) => {
        this.customColumns = data
      })
    },
    searchEvent () {
      this.pageVO.currentPage = 1
      this.findList()
    },
    handleSizeChange (pageSize) {
      this.pageVO.pageSize = pageSize
      this.findList()
    },
    handleCurrentChange (currentPage) {
      this.pageVO.currentPage = currentPage
      this.findList()
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
    insertEvent () {
      this.$refs.elxEditable.insert({
        name: `New ${Date.now()}`,
        age: 26,
        flag: false
      }).then(({ row }) => {
        this.$refs.elxEditable.setActiveRow(row)
      })
    },
    removeEvent (row) {
      if (row.id) {
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true
          XEAjax.doDelete(`/api/user/delete/${row.id}`).then(({ data }) => {
            this.findList()
          }).catch(e => {
            this.loading = false
          })
        }).catch(e => e)
      } else {
        this.$refs.elxEditable.remove(row)
      }
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
          XEAjax.doPost('/api/user/save', { removeRecords }).then(({ data }) => {
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
          let { insertRecords, updateRecords } = this.$refs.elxEditable.getAllRecords()
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
            XEAjax.doPost('/api/user/save', { insertRecords, updateRecords, removeRecords }).then(({ data }) => {
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
    },
    openCustomEvent () {
      this.selectColumns = this.allCustomColumnList.filter(item => item.visible).map(column => column.prop)
    },
    resetCustomEvent () {
      this.selectColumns = this.allCustomColumnList.map(column => column.prop)
    },
    saveCustomEvent () {
      if (!this.selectColumns.length) {
        return Message({
          type: 'error',
          message: '请至少选择一列！'
        })
      }
      this.dialogVisible = false
      this.allCustomColumnList.forEach(column => {
        column.visible = this.selectColumns.includes(column.prop)
      })
    }
  }
}
</script>

<style>
.click-table6-oper {
  margin-bottom: 18px;
}
.click-table6 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
.click-table6-pagination {
  margin-top: 18px;
  text-align: right;
}
.click-table6.elx-editable .elx-editable-row.new-insert,
.click-table6.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
