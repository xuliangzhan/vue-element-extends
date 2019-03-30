<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">第2行禁止勾选</p>

    <div class="click-table3-oper">
      <el-button type="success" size="mini" @click="insertEvent">新增</el-button>
      <el-button type="danger" size="mini" @click="pendingRemoveEvent">标记/取消删除</el-button>
      <el-button type="danger" size="mini" @click="deleteSelectedEvent">删除选中</el-button>
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <el-editable
      ref="editable"
      class="click-table3"
      border
      height="466"
      size="mini"
      :data.sync="list"
      :row-class-name="tableRowClassName"
      :edit-config="{trigger: 'click', mode: 'cell'}"
      @edit-active="editActiveEvent"
      @blur-active="blurActiveEvent"
      @clear-active="clearActiveEvent"
      style="width: 100%">
      <el-editable-column type="selection" width="55" :selectable="selectableEvent"></el-editable-column>
      <el-editable-column prop="id" label="ID" width="80"></el-editable-column>
      <el-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{type: 'default', autofocus: true}">
        <template v-slot:edit="scope">
          <el-input v-model="scope.row.name" size="mini" @input="$refs.editable.updateStatus(scope)"></el-input>
        </template>
        <template v-slot="scope">{{ scope.row.name }}</template>
      </el-editable-column>
      <el-editable-column prop="sex" label="性别" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-select v-model="scope.row.sex" size="mini" clearable @change="$refs.editable.updateStatus(scope)">
            <el-option v-for="item in sexList" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </template>
        <template v-slot="scope">{{ getSelectLabel(scope.row.sex, 'value', 'label', sexList) }}</template>
      </el-editable-column>
      <el-editable-column prop="age" label="年龄" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-input-number v-model="scope.row.age" size="mini" :min="1" :max="200" @input="$refs.editable.updateStatus(scope)"></el-input-number>
        </template>
        <template v-slot="scope">{{ scope.row.age }}</template>
      </el-editable-column>
      <el-editable-column prop="region" label="地区" width="200" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-cascader v-model="scope.row.region" size="mini" clearable :options="regionList" @change="$refs.editable.updateStatus(scope)"></el-cascader>
        </template>
        <template v-slot="scope">{{ getCascaderLabel(scope.row.region, regionList) }}</template>
      </el-editable-column>
      <el-editable-column prop="date" label="日期" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-date-picker v-model="scope.row.date" type="datetime" format="yyyy/MM/dd" size="mini" @change="$refs.editable.updateStatus(scope)"></el-date-picker>
        </template>
        <template v-slot="scope">{{ getDatePicker(scope.row.date) }}</template>
      </el-editable-column>
      <el-editable-column prop="flag" label="是否启用" :edit-render="{type: 'visible'}">
        <template v-slot:edit="scope">
          <el-switch v-model="scope.row.flag" size="mini" @change="$refs.editable.updateStatus(scope)"></el-switch>
        </template>
      </el-editable-column>
      <el-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></el-editable-column>
      <el-editable-column label="操作" width="160">
        <template v-slot="scope">
          <el-button size="mini" type="danger" @click="removeEvent(scope.row)">删除</el-button>
          <el-button size="mini" type="info" @click="revertEvent(scope.row)">还原</el-button>
        </template>
      </el-editable-column>
    </el-editable>

    <el-pagination
      class="click-table3-pagination"
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
      pendingRemoveList: []
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
    selectableEvent (row, index) {
      return index !== 1
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
      return XEUtils.toDateString(cellValue, 'yyyy-MM-dd hh:mm:ss')
    },
    tableRowClassName ({ row, rowIndex }) {
      if (this.pendingRemoveList.some(item => item === row)) {
        return 'delete-row'
      }
      return ''
    },
    editActiveEvent (row, column) {
      console.log('触发 edit-active 事件')
    },
    blurActiveEvent (row, column) {
      console.log('触发 blur-active 事件')
    },
    clearActiveEvent (row, column) {
      console.log('触发 clear-active 事件')
    },
    insertEvent () {
      let row = this.$refs.editable.insert({
        name: `New ${Date.now()}`,
        age: 26,
        flag: false
      })
      this.$nextTick(() => this.$refs.editable.setActiveCell(row, 'name'))
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
        this.$refs.editable.remove(row)
      }
    },
    revertEvent (row) {
      if (this.$refs.editable.hasRowChange(row)) {
        this.$refs.editable.clearActive()
        this.$refs.editable.revert(row)
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
      this.$refs.editable.exportCsv()
    }
  }
}
</script>

<style>
.click-table3-oper {
  margin-bottom: 18px;
}
.click-table3 .delete-row {
  color: #f56c6c;
  text-decoration: line-through;
}
.click-table3-pagination {
  margin-top: 18px;
  text-align: right;
}
.click-table3.editable .editable-row.new-insert,
.click-table3.editable .editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
</style>
