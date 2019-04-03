<template>
  <div v-loading="loading">
    <p style="color: red;font-size: 12px;">渲染成 Excel 表格</p>

    <p>
      <el-button size="mini" @click="$refs.editable.insert()">新增</el-button>
      <el-button size="mini" @click="getAllEvent">获取所有</el-button>
      <el-button size="mini" @click="getUpdateEvent">获取改动</el-button>
      <el-button size="mini" @click="getResultEvent">获取有值数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="excel-table1"
      border
      size="customSize"
      :data.sync="list"
      :edit-config="{trigger: 'dblclick', showIcon: false}"
      style="width: 100%" >
      <el-editable-column type="index" align="center" width="50"></el-editable-column>
      <template v-for="(column, index) in columnConfigs">
        <el-editable-column :key="index" v-bind="column" header-align="center" min-width="60"></el-editable-column>
      </template>
    </el-editable>
  </div>
</template>

<script>
import { MessageBox } from 'element-ui'

export default {
  data () {
    let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
    return {
      loading: false,
      list: [],
      columnConfigs: columns.map(name => {
        return {
          prop: name.toLowerCase(),
          label: name,
          editRender: { name: 'ElInput' }
        }
      })
    }
  },
  created () {
    this.loading = true
    setTimeout(() => {
      let list = [
        {
          a: 'tt',
          c: 'xx',
          d: 'tt'
        }, {
          b: 'tt',
          g: 'xx',
          f: 'tt'
        }, {
          h: 'tt',
          g: 'xx',
          j: 'tt'
        }
      ]
      this.list = list
      this.loading = false
    }, 300)
  },
  methods: {
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` }).catch(e => e)
    },
    getResultEvent () {
      let rest = this.$refs.editable.getRecords().filter(item => Object.keys(item).some(key => item[key]))
      MessageBox({ message: JSON.stringify(rest), title: `获取有值数据(${rest.length}条)` }).catch(e => e)
    }
  }
}
</script>

<style>
.excel-table1.el-table--customSize .elx-editable-column {
  height: 30px;
}
.excel-table1 .el-table__body .el-table__row>td {
  cursor: cell;
}
.excel-table1 .el-table__header th,
.excel-table1 .el-table__body .el-table__row>td:first-child,
.excel-table1 .el-table__body .el-table__row:hover>td:first-child {
  background-color: #f5f5f5;
}
.excel-table1 .el-table__body .el-table__row>td:first-child {
  cursor: default;
}
.excel-table1 .el-table__body .el-table__row:hover>td {
  background-color: inherit;
}
.excel-table1 .el-table__body .el-table__row>td.editable-col_checked {
  border: 1px solid #217346;
}
.excel-table1 .el-table__body .el-table__row>td .cell {
  width: 100% !important;
  padding: 0 3px;
}
.excel-table1 .el-table__body .el-table__row>td.editable-col_checked .cell {
  padding: 0 2px;
}
.excel-table1 .el-table__body .el-table__row>td.editable-col_active .cell {
  padding: 0;
}
.excel-table1 .el-table__body .el-table__row>td .cell,
.excel-table1 .el-table__body .el-table__row>td .cell .el-input,
.excel-table1 .el-table__body .el-table__row>td .cell .el-input__inner {
  height: 100%;
}
.excel-table1 .el-table__body .el-table__row>td .cell .el-input__inner {
  border-radius: 0;
  padding: 0 2px;
  border-color: #217346;
}
</style>
