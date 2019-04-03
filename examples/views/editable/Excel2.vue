<template>
  <div>
    <p style="color: red;font-size: 12px;">A字段（校验数值）B字段（校验汉字）C字段（校验字母）D字段（校验整数）E字段（校验小数）</p>

    <p>
      <el-button size="mini" @click="$refs.editable.insertAt(null, -1)">新增</el-button>
      <el-button size="mini" @click="$refs.editable.clearFilter()">清空筛选条件</el-button>
      <el-button size="mini" @click="$refs.editable.clearSort()">清空排序条件</el-button>
      <el-button size="mini" @click="getAllEvent">获取所有</el-button>
      <el-button size="mini" @click="getUpdateEvent">获取改动</el-button>
      <el-button size="mini" @click="getResultEvent">获取有值数据</el-button>
    </p>

    <el-editable
      ref="editable"
      class="excel-table2"
      border
      tooltip-effect="light"
      size="customSize"
      :data.sync="list"
      :edit-rules="validRules"
      :edit-config="{trigger: 'dblclick', showIcon: false, showStatus: false}"
      style="width: 100%" >
      <el-editable-column type="index" align="center" width="50"></el-editable-column>
      <template v-for="(column, index) in columnConfigs">
        <el-editable-column :key="index" v-bind="column" header-align="center" min-width="60" show-overflow-tooltip></el-editable-column>
      </template>
    </el-editable>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import { MessageBox } from 'element-ui'

export default {
  data () {
    let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
    const checkD = (rule, value, callback) => {
      if (!value || XEUtils.isInteger(Number(value))) {
        callback()
      } else {
        callback(new Error('请输入整数'))
      }
    }
    const checkE = (rule, value, callback) => {
      if (!value || XEUtils.isFloat(Number(value))) {
        callback()
      } else {
        callback(new Error('请输入小数'))
      }
    }
    return {
      list: Array.from(new Array(20), (v, i) => {
        let rest = {}
        columns.forEach(name => {
          switch (name) {
            case 'A':
              rest[name.toLowerCase()] = `${100 + i}`
              break
            case 'B':
              rest[name.toLowerCase()] = `值`
              break
            case 'C':
              rest[name.toLowerCase()] = `ABC`
              break
            case 'D':
              rest[name.toLowerCase()] = `${200 + i}`
              break
            case 'E':
              rest[name.toLowerCase()] = `${300.33 + i}`
              break
            case 'F':
              rest[name.toLowerCase()] = `${name}-${i < 10 ? '0' + i : i}`
              break
            default:
              rest[name.toLowerCase()] = ''
          }
        })
        return rest
      }),
      columnConfigs: columns.map(name => {
        let column = {
          prop: name.toLowerCase(),
          label: name,
          minWidth: '80',
          sortable: true,
          editRender: { name: 'ElInput' }
        }
        switch (name) {
          case 'A':
            column.filters = [{ text: '大于10', value: 10 }, { text: '大于50', value: 50 }, { text: '大于100', value: 100 }]
            column.filterMethod = (value, row, column) => Number(row[column.property] || 0) > value
            break
          case 'C':
            column.filters = [{ text: 'a开头', value: 'a' }, { text: 'b开头', value: 'b' }, { text: 'c开头', value: 'c' }]
            column.filterMethod = (value, row, column) => (row[column.property] || '').substring(0, 1) === value
            break
          case 'D':
            column.filters = [{ text: '大于0', value: 0 }, { text: '大于20', value: 20 }, { text: '大于200', value: 200 }]
            column.filterMethod = (value, row, column) => Number(row[column.property] || 0) > value
            break
          case 'E':
            column.filters = [{ text: '大于2.5', value: 2.5 }, { text: '大于7.8', value: 7.8 }, { text: '大于9.5', value: 9.5 }]
            column.filterMethod = (value, row, column) => Number(row[column.property] || 0) > value
            break
        }
        return column
      }),
      validRules: {
        a: [
          { type: 'number', message: '必须输入数字', trigger: 'change' }
        ],
        b: [
          { pattern: /^[\u4e00-\u9fa5]{1,5}$/, message: '校验1-5个汉字', trigger: 'change' }
        ],
        c: [
          { pattern: /^[a-zA-Z]{1,5}$/, message: '校验1-5个字母', trigger: 'blur' }
        ],
        d: [
          { validator: checkD, trigger: 'blur' }
        ],
        e: [
          { validator: checkE, trigger: 'change' }
        ]
      }
    }
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
.excel-table2.el-table--customSize .elx-editable-column {
  height: 30px;
}
.excel-table2 .el-table__body .el-table__row>td {
  cursor: cell;
}
.excel-table2 .el-table__header th,
.excel-table2 .el-table__body .el-table__row>td:first-child,
.excel-table2 .el-table__body .el-table__row:hover>td:first-child {
  background-color: #f5f5f5;
}
.excel-table2 .el-table__body .el-table__row>td:first-child {
  cursor: default;
}
.excel-table2 .el-table__body .el-table__row:hover>td {
  background-color: inherit;
}
.excel-table2 .el-table__body .el-table__row>td.editable-col_checked {
  border: 1px solid #217346;
}
.excel-table2 .el-table__body .el-table__row>td .cell {
  width: 100% !important;
  line-height: 30px;
  padding: 0 3px;
}
.excel-table2 .el-table__body .el-table__row>td.editable-col_checked .cell {
  padding: 0 2px;
  line-height: 28px;
}
.excel-table2 .el-table__body .el-table__row>td.editable-col_active .cell {
  padding: 0;
}
.excel-table2 .el-table__body .el-table__row>td .cell,
.excel-table2 .el-table__body .el-table__row>td .cell .el-input,
.excel-table2 .el-table__body .el-table__row>td .cell .el-input__inner {
  height: 100%;
}
.excel-table2 .el-table__body .el-table__row>td .cell .el-input__inner {
  border-radius: 0;
  padding: 0 2px;
  line-height: 30px;
  border-color: #217346;
}
</style>
