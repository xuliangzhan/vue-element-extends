<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">合并行或列</p>

     <el-form ref="tableform" class="click-table2-form" size="mini" :inline="true" :model="formData">
      <el-form-item label="键值" prop="key">
        <el-input v-model="formData.key" placeholder="请输入键值"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="name">
        <el-input v-model="formData.name" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item label="语言" prop="language">
        <el-select v-model="formData.language" placeholder="请选择语言">
          <el-option v-for="(item, index) in languageList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchEvent">查询</el-button>
        <el-button @click="$refs.tableform.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="click-table8-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="editable"
      class="click-table8"
      border
      height="466"
      size="mini"
      :data.sync="list"
      :span-method="objectSpanMethod"
      :row-class-name="tableRowClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell'}"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="key" label="键值" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="name" label="内容" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="language" label="语言" width="160" :edit-render="{name: 'ElSelect', options: languageList}"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
    </elx-editable>

    <el-pagination
      class="click-table8-pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageVO.currentPage"
      :page-sizes="[5, 10, 15, 20, 50, 100, 150, 200]"
      :page-size="pageVO.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageVO.totalResult">
    </el-pagination>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import { Message } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      languageList: [],
      list: [],
      formData: {
        key: null,
        name: null,
        language: null
      },
      pageVO: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      validRules: {
        key: [
          { required: true, message: '请输入键值', trigger: 'change' }
        ],
        language: [
          { required: true, message: '请选择语言', trigger: 'change' }
        ]
      },
      pendingRemoveList: []
    }
  },
  created () {
    this.findLanguageList()
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      this.pendingRemoveList = []
      XEAjax.doGet(`/api/i18n/page/list/${this.pageVO.pageSize}/${this.pageVO.currentPage}`, this.formData).then(response => {
        let { page, result } = response.data
        this.list = result
        this.pageVO.totalResult = page.totalResult
        this.loading = false
      }).catch(e => {
        this.loading = false
      })
    },
    findLanguageList () {
      XEAjax.doGet('/api/conf/languages/list').then(({ data }) => {
        this.languageList = data
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
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd hh:mm:ss')
    },
    tableRowClassName ({ row, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return 'delete-row'
      }
      return ''
    },
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      let prevRow = this.list[rowIndex - 1]
      let nextRow = this.list[rowIndex + 1]
      if (column.property === 'key') {
        if (prevRow && prevRow.key === row.key) {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
        if (nextRow && nextRow.key === row.key) {
          return {
            rowspan: 2,
            colspan: 1
          }
        }
      }
    },
    insertEvent () {
      this.$refs.editable.insert().then(({ row }) => {
        this.$refs.editable.setActiveCell(row, 'key')
      })
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
            XEAjax.doPost('/api/i18n/save', { insertRecords, updateRecords, removeRecords }).then(({ data }) => {
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
.click-table8-oper {
  margin-bottom: 18px;
}
.click-table8 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
.click-table8-pagination {
  margin-top: 18px;
  text-align: right;
}
.click-table8.elx-editable .editable-row.new-insert,
.click-table8.elx-editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
