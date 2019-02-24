<template>
  <div>
    <p style="color: red;font-size: 12px;">A字段（必填校验）</p>

    <p>
      <el-button size="mini" @click="$refs.editable.insertAt(null, -1)">新增</el-button>
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
import { MessageBox } from 'element-ui'

export default {
  data () {
    let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V']
    return {
      list: Array.from(new Array(15), (v, i) => {
        let rest = {}
        columns.forEach(name => {
          rest[name.toLowerCase()] = name === 'A' ? `A-${i < 10 ? '0' + i : i}` : ''
        })
        return rest
      }),
      columnConfigs: columns.map(name => {
        return {
          prop: name.toLowerCase(),
          label: name,
          sortable: name === 'A',
          editRender: { name: 'ElInput' }
        }
      }),
      validRules: {
        a: [
          { required: true, message: '必填字段', trigger: 'change' }
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
.excel-table2.el-table--customSize .editable-column {
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
