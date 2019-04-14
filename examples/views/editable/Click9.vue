<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">设置 disabledValidTip=true 关闭校验提示</p>
    <p style="color: red;font-size: 12px;">name字段（校验必填，校验3-50个字符）nickname字段（校验5-20个字符）sex字段（校验必填，校验手机号码）age字段（校验必填，自定义校验，18-60之间）phone字段（校验必填，校验手机号码）rate字段（校验必填，校验最少选中2颗星）url（校验必填，校验URL路径）attr1（校验数字）attr2（校验整数）attr3（校验小数）</p>

    <el-form ref="tableform" class="click-table9-form" size="mini" :inline="true" :model="formData">
      <el-form-item label="名字" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名字"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-input v-model="formData.role" placeholder="请输入角色"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="formData.sex" placeholder="请选择性别">
          <el-option v-for="(item, index) in sexList" :key="index" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchEvent">查询</el-button>
        <el-button @click="$refs.tableform.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="click-table9-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="click-table9"
      border
      height="466"
      size="mini"
      :data.sync="list"
      :row-class-name="tableRowClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'click', mode: 'cell', disabledValidTip: true}"
      @blur-active="blurActiveEvent"
      @valid-error="validErrorEvent"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
      <elx-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="sex" label="性别" :edit-render="{name: 'ElSelect', options: sexList}"></elx-editable-column>
      <elx-editable-column prop="age" label="年龄" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></elx-editable-column>
      <elx-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></elx-editable-column>
      <elx-editable-column prop="role" label="角色" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="date" label="日期" width="160" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy-MM-dd'}}"></elx-editable-column>
      <elx-editable-column prop="flag" label="是否启用" :edit-render="{name: 'ElSwitch', type: 'visible'}"></elx-editable-column>
      <elx-editable-column prop="rate" label="评分" min-width="150" :edit-render="{name: 'ElRate', type: 'visible'}"></elx-editable-column>
      <elx-editable-column prop="describe" label="备注" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column label="操作" width="100">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
        </template>
      </elx-editable-column>
    </elx-editable>

    <el-pagination
      class="click-table9-pagination"
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
    const checkAge = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('年龄不能为空'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入数字值'))
        } else {
          if (parseInt(value) < 18 || parseInt(value) > 60) {
            callback(new Error('年龄必须在18-60之间'))
          } else {
            callback()
          }
        }
      }, 50)
    }
    const checkRate = (rule, value, callback) => {
      if (parseInt(value || 0) < 2) {
        callback(new Error('最小选择2颗星'))
      } else {
        callback()
      }
    }
    const checkAttr2 = (rule, value, callback) => {
      if (!value || XEUtils.isInteger(Number(value))) {
        callback()
      } else {
        callback(new Error('请输入整数'))
      }
    }
    const checkAttr3 = (rule, value, callback) => {
      if (!value || XEUtils.isFloat(Number(value))) {
        callback()
      } else {
        callback(new Error('请输入小数'))
      }
    }
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
      validRules: {
        name: [
          { required: true, message: '名称必须填写', trigger: 'change' },
          { min: 3, max: 50, message: '名称长度在 3 到 50 个字符', trigger: 'change' }
        ],
        nickname: [
          { min: 5, max: 20, message: '名称长度在 5 到 20 个字符', trigger: 'change' }
        ],
        sex: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        region: [
          { required: true, message: '请选择地区', trigger: 'change' }
        ],
        age: [
          { required: true, message: '年龄必须填写', trigger: 'change' },
          { validator: checkAge, trigger: 'change' }
        ],
        phone: [
          { required: true, message: '手机号码必须填写', trigger: 'change' },
          { pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号码', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        rate: [
          { required: true, message: '请选择评分', trigger: 'change' },
          { validator: checkRate, trigger: 'change' }
        ],
        flag: [
          { required: true, message: '必须启用', trigger: 'change' }
        ],
        email: [
          { required: true, message: '邮件必须填写', trigger: 'change' },
          { pattern: /^[a-z0-9]+([._-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, message: '格式：http(s)://xxx.com', trigger: 'change' }
        ],
        attr1: [
          { type: 'number', message: '请输入数字', trigger: 'change' }
        ],
        attr2: [
          { validator: checkAttr2, trigger: 'change' }
        ],
        attr3: [
          { validator: checkAttr3, trigger: 'change' }
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
      this.pendingRemoveList = []
      XEAjax.doGet(`/api/user/page/list/${this.pageVO.pageSize}/${this.pageVO.currentPage}`, this.formData).then(response => {
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
    tableRowClassName ({ row, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return 'delete-row'
      }
      return ''
    },
    validErrorEvent (rule, row, column, cell) {
      Message({
        type: 'error',
        message: rule.message
      })
    },
    // 单元格失焦后实时保存数据
    blurActiveEvent (row, column) {
      this.$refs.elxEditable.validateRow(row)
    },
    insertEvent () {
      this.$refs.elxEditable.insert({
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
    },
    exportCsvEvent () {
      this.$refs.elxEditable.exportCsv()
    }
  }
}
</script>

<style>
.click-table9-oper {
  margin-bottom: 18px;
}
.click-table9 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
.click-table9-pagination {
  margin: 15px 20px 0 0;
  text-align: right;
}
.click-table9.elx-editable .elx-editable-row.new-insert,
.click-table9.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
