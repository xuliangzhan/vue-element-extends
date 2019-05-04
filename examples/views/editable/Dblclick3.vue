<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">自定义校验提示内容</p>

    <div class="dblclick-table3-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="warning" size="mini" @click="validEvent">校验</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="dblclick-table3"
      border
      height="466"
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'dblclick', mode: 'cell', validTooltip: { placement: 'right', popperClass: 'dblclick-table3-validtip' }}"
      @edit-active="editActiveEvent"
      @blur-active="blurActiveEvent"
      @clear-active="clearActiveEvent"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
      <elx-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{name: 'ElInput'}">
        <template v-slot:valid="scope">自定义校验提示语的样式：<br>{{ scope.rule.message }}<br>名称为必填字段<br><a href="https://github.com/xuliangzhan/vue-element-extends" target="_blank">参考API说明</a></template>
      </elx-editable-column>
      <elx-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column prop="age" label="年龄" align="center" :edit-render="{name: 'ElInputNumber'}"></elx-editable-column>
      <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', props: {options: regionList}}"></elx-editable-column>
      <elx-editable-column prop="role" label="角色" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="describe" label="文本域" show-overflow-tooltip :edit-render="{name: 'ElInput', props: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></elx-editable-column>
      <elx-editable-column prop="date" label="日期" :edit-render="{name: 'ElDatePicker', props: {type: 'datetime', format: 'yyyy-MM-dd'}}"></elx-editable-column>
      <elx-editable-column prop="flag" label="是否启用" :edit-render="{name: 'ElSwitch', type: 'visible'}"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column label="操作" width="100">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </elx-editable-column>
    </elx-editable>

    <el-pagination
      class="dblclick-table3-pagination"
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
          { min: 3, max: 50, message: '名称长度 4-20 个字符', trigger: 'change' }
        ],
        age: [
          { required: true, type: 'number', message: '年龄必填', trigger: 'change' }
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
      XEAjax.doGet('/api/conf/sex/list').then(({ data }) => {
        this.sexList = data
      })
    },
    findRegionList () {
      XEAjax.doGet('/api/conf/region/list').then(({ data }) => {
        this.regionList = data
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
    editActiveEvent (row, column) {
      console.log('触发 edit-active 事件')
    },
    // 失焦后检查其他列，实现单元格连续编辑效果
    blurActiveEvent (row, column) {
      console.log('触发 blur-active 事件')
      this.$refs.elxEditable.validateRow(row)
    },
    clearActiveEvent (row, column) {
      console.log('触发 clear-active 事件')
    },
    insertEvent () {
      this.$refs.elxEditable.insert({
        name: `New ${Date.now()}`,
        age: 0,
        flag: false
      }).then(({ row }) => {
        this.$refs.elxEditable.setActiveCell(row, 'name')
      })
    },
    removeEvent (row) {
      if (row.id) {
        MessageBox.confirm('确定删除该数据?', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.elxEditable.remove(row)
        }).catch(e => e)
      } else {
        this.$refs.elxEditable.remove(row)
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
          this.$refs.elxEditable.removeSelecteds()
        }).catch(e => e)
      } else {
        Message({
          type: 'info',
          message: '请至少选择一条数据！'
        })
      }
    },
    validEvent () {
      this.$refs.elxEditable.validate(valid => {
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
      this.$refs.elxEditable.validate(valid => {
        if (valid) {
          let { insertRecords, updateRecords, removeRecords } = this.$refs.elxEditable.getAllRecords()
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
    }
  }
}
</script>

<style>
.dblclick-table3-oper {
  margin-bottom: 18px;
}
.dblclick-table3-pagination {
  margin: 15px 20px 0 0;
  text-align: right;
}
.dblclick-table3.elx-editable .elx-editable-row.new-insert,
.dblclick-table3.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
.el-tooltip__popper.editable-valid_tooltip.dblclick-table3-validtip {
  background: red;
}
.el-tooltip__popper.editable-valid_tooltip.dblclick-table3-validtip[x-placement^=right] .popper__arrow,
.el-tooltip__popper.editable-valid_tooltip.dblclick-table3-validtip[x-placement^=right] .popper__arrow::after {
  border-right-color: red;
}
</style>
