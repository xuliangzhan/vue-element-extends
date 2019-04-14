<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验4-20个字符）sex字段（校验必填）age字段（校验18-28）</p>
    <p style="color: red;font-size: 12px;">如果同时使用了数据校验和 fixed 列，请设置 useDefaultValidTip=true 使用默认的校验提示</p>
    <p style="color: red;font-size: 12px;">通过 blur-active 事件在单元格失焦后实时保存数据</p>

    <div class="click-table5-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="click-table5"
      border
      height="564"
      size="mini"
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell', useDefaultValidTip: true}"
      @blur-active="blurActiveEvent"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
      <elx-editable-column label="基本信息">
        <elx-editable-column prop="name" label="名字" min-width="200" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="sex" label="性别" min-width="160" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      </elx-editable-column>
      <elx-editable-column label="重要信息">
        <elx-editable-column prop="age" label="年龄" min-width="160" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></elx-editable-column>
        <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></elx-editable-column>
      </elx-editable-column>
      <elx-editable-column label="其他信息">
        <elx-editable-column prop="role" label="角色" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
        <elx-editable-column prop="describe" label="文本域" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></elx-editable-column>
        <elx-editable-column label="特殊信息">
          <elx-editable-column prop="date" label="日期" width="160" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd'}}"></elx-editable-column>
          <elx-editable-column prop="flag" label="是否启用" width="160" :edit-render="{name: 'ElSwitch', type: 'visible'}"></elx-editable-column>
        </elx-editable-column>
      </elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="describe3" label="备注" width="200" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column label="操作" width="80" fixed="right">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </elx-editable-column>
    </elx-editable>

    <el-pagination
      class="click-table5-pagination"
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
import { MessageBox, Message } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      sexList: [],
      regionList: [],
      list: [],
      pageVO: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, max: 50, message: '名称长度 3-50 个字符', trigger: 'change' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        age: [
          { type: 'number', min: 18, max: 28, message: '年龄范围18-28', trigger: 'change' }
        ]
      }
    }
  },
  created () {
    this.findSexList()
    this.findRegionList()
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      XEAjax.doGet(`/api/user/page/list/${this.pageVO.pageSize}/${this.pageVO.currentPage}`).then(response => {
        let { page, result } = response.data
        this.list = result
        this.pageVO.totalResult = page.totalResult
        this.loading = false
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
    getSelectLabel (value, valueProp, labelProp, list) {
      let item = XEUtils.find(list, item => item[valueProp] === value)
      return item ? item[labelProp] : null
    },
    getCascaderLabel (value, list) {
      let values = value || []
      let labels = []
      let matchCascaderData = function (index, list) {
        let val = values[index]
        if (list && values.length > index) {
          list.forEach(item => {
            if (item.value === val) {
              labels.push(item.label)
              matchCascaderData(++index, item.children)
            }
          })
        }
      }
      matchCascaderData(0, list)
      return labels.join(' / ')
    },
    getDatePicker (value) {
      return XEUtils.toDateString(value, 'yyyy/MM/dd')
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    // 单元格失焦后实时保存数据
    blurActiveEvent (row, column) {
      if (this.$refs.elxEditable.hasRowChange(row)) {
        this.saveRowEvent(row)
      }
    },
    insertEvent () {
      this.$refs.elxEditable.insert({
        name: `New ${Date.now()}`,
        age: 26,
        flag: false
      }).then(({ row }) => {
        this.$refs.elxEditable.setActiveCell(row, 'name')
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
    revertEvent (row) {
      if (this.$refs.elxEditable.hasRowChange(row)) {
        this.$refs.elxEditable.clearActive()
        this.$refs.elxEditable.revert(row)
        Message({
          type: 'success',
          message: '数据已还原！'
        })
      } else {
        Message({
          type: 'info',
          message: '数据未改动！'
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
    saveRowEvent (row) {
      this.$refs.elxEditable.validateRow(row, valid => {
        if (valid) {
          let url = '/api/user/add'
          if (row.id) {
            url = '/api/user/update'
          }
          if (XEUtils.isDate(row.date)) {
            row.date = row.date.getTime()
          }
          this.loading = true
          this.$refs.elxEditable.clearActive()
          XEAjax.doPost(url, row).then(({ data }) => {
            this.findList()
            Message({ message: '保存成功', type: 'success' })
          })
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
.click-table5-oper {
  margin-bottom: 18px;
}
.click-table5-pagination {
  margin-top: 18px;
  text-align: right;
}
.click-table5.elx-editable .elx-editable-row.new-insert,
.click-table5.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
