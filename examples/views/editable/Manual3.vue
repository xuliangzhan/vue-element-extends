<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">带校验：name字段（校验必填，校验3-50个字符）；sex字段（校验必填）；age（校验18-28）</p>
    <p style="color: red;font-size: 12px;">默认勾选：可以给 data 设置特殊；_checked=true 默认选中；_disabled=true 默认禁止勾选，如果自定义了 selectable 方法，则根据该方法结果决定是否允许勾选</p>

    <div class="manual-table3-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <el-editable
      ref="editable"
      class="manual-table3"
      border
      height="500"
      size="mini"
      row-key="id"
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'manual', mode: 'row', useDefaultValidTip: true, clearActiveMethod}"
      style="width: 100%">
      <el-editable-column type="selection" width="55"></el-editable-column>
      <el-editable-column type="index" width="55"></el-editable-column>
      <el-editable-column prop="id" label="ID" width="80"></el-editable-column>
      <el-editable-column prop="name" label="名字" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="sex" label="性别" width="100" :edit-render="{name: 'ElSelect', options: sexList}"></el-editable-column>
      <el-editable-column prop="age" label="年龄" width="140" :edit-render="{name: 'ElInputNumber', attrs: {min: 1, max: 200}}"></el-editable-column>
      <el-editable-column prop="region" label="地区" width="200" :edit-render="{name: 'ElCascader', attrs: {options: regionList}}"></el-editable-column>
      <el-editable-column prop="describe2" label="文本输入" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column prop="describe" label="文本域" min-width="160" show-overflow-tooltip :edit-render="{name: 'ElInput', attrs: {type: 'textarea', autosize: {minRows: 1, maxRows: 4}}}"></el-editable-column>
      <el-editable-column prop="date" label="日期" width="220" :edit-render="{name: 'ElDatePicker', attrs: {type: 'datetime', format: 'yyyy年MM月dd日 HH时ss分mm秒'}}"></el-editable-column>
      <el-editable-column prop="flag" label="是否启用" width="100" :formatter="formatterFlag" :edit-render="{name: 'ElSwitch'}"></el-editable-column>
      <el-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column prop="describe3" label="备注" width="200" fixed="right" show-overflow-tooltip :edit-render="{name: 'ElInput'}"></el-editable-column>
      <el-editable-column label="操作" width="150" fixed="right">
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
      </el-editable-column>
      <template v-slot:append>
        <div>-- slot append --</div>
      </template>
    </el-editable>

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
      isClearActiveFlag: true,
      validRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'change' },
          { min: 3, max: 50, message: '名称长度 4-20 个字符', trigger: 'change' }
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
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd hh:mm:ss')
    },
    clearActiveMethod ({ type, row }) {
      return this.isClearActiveFlag && type === 'out' ? this.checkOutSave(row) : this.isClearActiveFlag
    },
    insertEvent () {
      let activeInfo = this.$refs.editable.getActiveRow()
      let { insertRecords } = this.$refs.editable.getAllRecords()
      if (!activeInfo && !insertRecords.length) {
        let row = this.$refs.editable.insert({
          name: `New ${Date.now()}`,
          age: 26,
          flag: false
        })
        this.$nextTick(() => this.$refs.editable.setActiveRow(row))
      }
    },
    // 点击表格外面处理
    checkOutSave (row) {
      if (!this.$refs.editable.checkValid().error) {
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
      }
      return this.isClearActiveFlag
    },
    // 编辑处理
    openActiveRowEvent (row) {
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
      if (row.id) {
        this.isClearActiveFlag = false
        MessageBox.confirm('确定永久删除该数据?', '温馨提示', {
          distinguishCancelAndClose: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          XEAjax.doDelete(`/api/user/delete/${row.id}`).then(({ data }) => {
            this.findList()
          })
        }).catch(action => action).then(() => {
          this.isClearActiveFlag = true
        })
      } else {
        this.$refs.editable.remove(row)
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
          XEAjax.doPost('/api/user/save', { removeRecords }).then(({ data }) => {
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
          let url = '/api/user/add'
          if (row.id) {
            url = '/api/user/update'
          }
          if (XEUtils.isDate(row.date)) {
            row.date = row.date.getTime()
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
.manual-table3-oper {
  margin-bottom: 18px;
}
.manual-table3-pagination {
  margin-top: 18px;
  text-align: right;
}
.manual-table3.editable .editable-row.new-insert,
.manual-table3.editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
