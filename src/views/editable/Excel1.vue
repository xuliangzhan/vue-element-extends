<template>
  <div>
    <p style="color: red;">渲染成 Excel 表格</p>

    <p>
      <el-button size="mini" @click="$refs.editable.insert()">新增</el-button>
      <el-button size="mini" @click="getAllEvent">获取所有</el-button>
      <el-button size="mini" @click="getUpdateEvent">获取改动</el-button>
      <el-button size="mini" @click="getResultEvent">获取有值数据</el-button>
    </p>

    <el-editable ref="editable" class="excel-table1" :data.sync="list" border size="mini" style="width: 100%" :editConfig="{trigger: 'click', showIcon: false}">
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
      list: Array.from(new Array(10), (v, i) => {
        let rest = {}
        columns.forEach(name => {
          rest[name.toLowerCase()] = ''
        })
        return rest
      }),
      columnConfigs: columns.map(name => {
        return {
          prop: name.toLowerCase(),
          label: name,
          editRender: {name: 'ElInput'}
        }
      })
    }
  },
  methods: {
    getAllEvent () {
      let rest = this.$refs.editable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` })
    },
    getUpdateEvent () {
      let rest = this.$refs.editable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` })
    },
    getResultEvent () {
      let rest = this.$refs.editable.getRecords().filter(item => Object.keys(item).some(key => item[key]))
      MessageBox({ message: JSON.stringify(rest), title: `获取有值数据(${rest.length}条)` })
    }
  }
}
</script>

<style>
.excel-table1 .el-table__body .el-table__row>td {
  cursor: cell;
}
.excel-table2 .el-table__body .el-table__row>td:first-child {
  cursor: default;
}
.excel-table1 .el-table__body .el-table__row:hover>td {
  background-color: inherit;
}
.excel-table1 .el-table__body .el-table__row>td.editable-col_checked,
.excel-table1 .el-table__row>td .cell .el-input__inner:focus {
  border: 1px solid #217346;
}
.excel-table1 .el-table__row>td .cell {
  padding: 0;
}
.excel-table1 .el-table__row>td .cell .el-input__inner {
  border-radius: 0;
  padding: 0 2px;
}
</style>
