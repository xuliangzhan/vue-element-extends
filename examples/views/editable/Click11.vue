<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">拖动排序</p>

    <div class="click-table11-oper">
      <el-button type="warning" size="mini" @click="submitEvent">保存</el-button>
      <el-button type="success" size="mini" @click="exportCsvEvent">导出</el-button>
    </div>

    <elx-editable
      ref="elxEditable"
      class="click-table11"
      border
      height="466"
      size="small"
      row-key="id"
      :data.sync="list"
      :edit-config="{trigger: 'click', mode: 'cell'}"
      style="width: 100%">
      <elx-editable-column type="selection" width="55"></elx-editable-column>
      <elx-editable-column width="40">
        <template v-slot:header="scope">
          <el-tooltip class="item" placement="top">
            <div slot="content">按住后可以上下拖动排序，<br>完成后点击保存即可！</div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <template>
          <i class="fa fa-arrows drag-btn"></i>
        </template>
      </elx-editable-column>
      <elx-editable-column prop="id" label="ID" width="80"></elx-editable-column>
      <elx-editable-column prop="name" label="名字" show-overflow-tooltip :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-input v-model="scope.row.name" size="mini" @input="$refs.elxEditable.updateStatus(scope)"></el-input>
        </template>
        <template v-slot="scope">{{ scope.row.name }}</template>
      </elx-editable-column>
      <elx-editable-column prop="sex" label="性别" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-select v-model="scope.row.sex" size="mini" clearable @change="$refs.elxEditable.updateStatus(scope)">
            <el-option v-for="item in sexList" :key="item.value" :value="item.value" :label="item.label"></el-option>
          </el-select>
        </template>
        <template v-slot="scope">{{ getSelectLabel(scope.row.sex, 'value', 'label', sexList) }}</template>
      </elx-editable-column>
      <elx-editable-column prop="age" label="年龄" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-input-number v-model="scope.row.age" size="mini" :min="1" :max="200" @input="$refs.elxEditable.updateStatus(scope)"></el-input-number>
        </template>
        <template v-slot="scope">{{ scope.row.age }}</template>
      </elx-editable-column>
      <elx-editable-column prop="region" label="地区" width="200" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-cascader v-model="scope.row.region" size="mini" clearable :options="regionList" @change="$refs.elxEditable.updateStatus(scope)"></el-cascader>
        </template>
        <template v-slot="scope">{{ getCascaderLabel(scope.row.region, regionList) }}</template>
      </elx-editable-column>
      <elx-editable-column prop="date" label="日期" :edit-render="{type: 'default'}">
        <template v-slot:edit="scope">
          <el-date-picker v-model="scope.row.date" type="datetime" format="yyyy/MM/dd" size="mini" @change="$refs.elxEditable.updateStatus(scope)"></el-date-picker>
        </template>
        <template v-slot="scope">{{ getDatePicker(scope.row.date) }}</template>
      </elx-editable-column>
      <elx-editable-column prop="flag" label="是否启用" :edit-render="{type: 'visible'}">
        <template v-slot:edit="scope">
          <el-switch v-model="scope.row.flag" size="mini" @change="$refs.elxEditable.updateStatus(scope)"></el-switch>
        </template>
      </elx-editable-column>
      <elx-editable-column prop="updateTime" label="更新时间" width="160" :formatter="formatterDate"></elx-editable-column>
      <elx-editable-column prop="createTime" label="创建时间" width="160" :formatter="formatterDate"></elx-editable-column>
    </elx-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEAjax from 'xe-ajax'
import Sortable from 'sortablejs'
import { Message } from 'element-ui'

export default {
  data () {
    return {
      loading: false,
      sexList: [],
      regionList: [],
      list: []
    }
  },
  created () {
    this.rowDrop()
    this.findSexList()
    this.findRegionList()
    this.findList()
  },
  methods: {
    findList () {
      this.loading = true
      XEAjax.doGet('/api/user/list', { sort: 'seq', order: 'asc' }).then(({ data }) => {
        this.list = data
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
    rowDrop () {
      this.$nextTick(() => {
        Sortable.create(this.$el.querySelector('.el-table__body-wrapper tbody'), {
          handle: '.drag-btn',
          onEnd: ({ newIndex, oldIndex }) => {
            let currRow = this.list.splice(oldIndex, 1)[0]
            this.list.splice(newIndex, 0, currRow)
          }
        })
      })
    },
    submitEvent () {
      this.$refs.elxEditable.validate(valid => {
        if (valid) {
          let list = this.list
          list.forEach((item, index) => {
            if (XEUtils.isDate(item.date)) {
              item.date = item.date.getTime()
            }
            // 重新生成排序后的序号
            item.seq = index
          })
          this.loading = true
          XEAjax.doPost('/api/user/save', { updateRecords: list }).then(({ data }) => {
            Message({
              type: 'success',
              message: '保存成功!'
            })
            this.findList()
          }).catch(e => {
            this.loading = false
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
.click-table11-oper {
  margin-bottom: 18px;
}
.click-table11-pagination {
  margin-top: 18px;
  text-align: right;
}
.click-table11 .drag-btn {
  font-size: 16px;
  cursor: move;
}
.click-table11.elx-editable .elx-editable-row.new-insert,
.click-table11.elx-editable .elx-editable-row.new-insert:hover>td {
  background-color: #f0f9eb;
}
.click-table11 .el-table__body tr.hover-row>td,
.click-table11 .el-table__body .el-table__row:hover>td {
  background-color: inherit;
}
.click-table11.elx-editable .elx-editable-row.sortable-ghost,
.click-table11.elx-editable .elx-editable-row.sortable-chosen {
  background-color: #fff6b2;
}
</style>
