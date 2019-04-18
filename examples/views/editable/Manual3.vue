<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">注意：element-ui table 的实现方式 fixed 列 left 和 right 都是克隆一份独立的 table，所以如果使用了 fixed 列不可避免的会多次渲染 template</p>
    <p style="color: red;font-size: 12px;">带校验：name字段（校验必填，校验3-50个字符）；age（校验必填）</p>
    <p style="color: red;font-size: 12px;">默认勾选：可以给 data 设置特殊；_checked=true 默认选中；_disabled=true 默认禁止勾选，如果自定义了 selectable 方法，则根据该方法结果决定是否允许勾选</p>

    <div class="manual-table3-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="info" size="mini" @click="$refs.elxEditable.toggleRowSelection(list[1])">第二个选中/取消</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="manual-table3"
      border
      height="500"
      row-key="id"
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'manual', mode: 'row', useDefaultValidTip: true}"
      @edit-active="editActiveEvent"
      @blur-active="blurActiveEvent"
      @clear-active="clearActiveEvent"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column type="index" width="55"></elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
      <elx-editable-column prop="name" label="名字" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="sex" label="性别" width="100" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column prop="age" label="年龄" width="140" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></elx-editable-column>
      <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></elx-editable-column>
      <elx-editable-column prop="describe2" label="文本输入" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="describe" label="文本域" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></elx-editable-column>
      <elx-editable-column prop="date" label="日期" width="220" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy年MM月dd日 HH时ss分mm秒'}}"></elx-editable-column>
      <elx-editable-column prop="flag" label="是否启用" width="100" :formatter="formatterFlag" :edit-render="{name: 'ElSwitch'}"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="describe3" label="备注" width="200" fixed="right" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column label="操作" width="150" fixed="right">
        <template v-slot="scope">
          <template v-if="$refs.elxEditable.hasActiveRow(scope.row)">
            <el-button size="mini" type="warning" @click="cancelRowEvent(scope.row)">取消</el-button>
            <el-button size="mini" type="info" @click="$refs.elxEditable.revert(scope.row)">还原</el-button>
          </template>
          <template v-else>
            <el-button size="mini" type="primary" @click="openActiveRowEvent(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          </template>
        </template>
      </elx-editable-column>
    </elx-editable>

    <el-pagination
      class="manual-table3-pagination"
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
          { required: true, message: '请输入年龄', trigger: 'change' }
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
        this.list = result.map(item => {
          // 默认勾选年龄大于20小于25
          item._checked = item.age > 20 && item.age < 25
          return item
        })
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
    handleSizeChange (pageSize) {
      this.pageVO.pageSize = pageSize
      this.findList()
    },
    handleCurrentChange (currentPage) {
      this.pageVO.currentPage = currentPage
      this.findList()
    },
    formatterFlag (row, column, cellValue, index) {
      return cellValue ? '是' : '否'
    },
    formatterDate (row, column, cellValue, index) {
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd HH:mm:ss')
    },
    editActiveEvent (row, column) {
      // 判断是否通过函数触发的
      if (event.trigger === 'call') {
        console.log('函数触发 edit-active 事件')
      } else {
        console.log('点击触发 edit-active 事件')
      }
    },
    blurActiveEvent (row, column) {
      console.log('触发 blur-active 事件')
    },
    clearActiveEvent (row, column) {
      console.log('触发 clear-active 事件')
    },
    insertEvent () {
      let activeInfo = this.$refs.elxEditable.getActiveRow()
      let { insertRecords } = this.$refs.elxEditable.getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        this.$refs.elxEditable.insert({
          name: `New ${Date.now()}`,
          age: 26,
          flag: false
        }).then(({ row }) => {
          this.$refs.elxEditable.setActiveRow(row)
        })
      }
    },
    // 编辑处理
    openActiveRowEvent (row) {
      if (!this.$refs.elxEditable.checkValid().error) {
        this.$refs.elxEditable.setActiveRow(row)
      }
    },
    // 取消处理
    cancelRowEvent (row) {
      this.$refs.elxEditable.clearActive()
    },
    removeEvent (row) {
      if (row.id) {
        MessageBox.confirm('确定删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.elxEditable.remove(row)
        })
      } else {
        this.$refs.elxEditable.remove(row)
      }
    },
    deleteSelectedEvent () {
      let removeRecords = this.$refs.elxEditable.getSelecteds()
      if (removeRecords.length) {
        MessageBox.confirm('确定删除所选数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.elxEditable.removeSelecteds()
        })
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
.manual-table3-oper {
  margin-bottom: 18px;
}
.manual-table3-pagination {
  margin-top: 18px;
  text-align: right;
}
.manual-table3.elx-editable .elx-editable-row.new-insert,
.manual-table3.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
