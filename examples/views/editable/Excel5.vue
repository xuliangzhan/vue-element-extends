<template>
  <div>
    <p style="color: red;font-size: 12px;">通过参数 context-menu-config 配置右键菜单；通过 custom-menu-link 事件处理自定义菜单</p>
    <p style="color: red;font-size: 12px;">A字段（校验数值）B字段（校验汉字）C字段（校验字母）D字段（校验整数）E字段（校验小数）</p>

    <p>
      <el-button size="mini" @click="getAllEvent">获取所有</el-button>
      <el-button size="mini" @click="getUpdateEvent">获取改动</el-button>
      <el-button size="mini" @click="getResultEvent">获取有值数据</el-button>
    </p>

    <elx-editable
      ref="elxEditable"
      class="excel-table5"
      border
      size="customSize"
      :data.sync="list"
      :custom-columns.sync="customColumns"
      :cell-class-name="cellClassName"
      :edit-rules="validRules"
      :edit-config="{trigger: 'dblclick', showIcon: false, showStatus: false, isTabKey: true, isArrowKey: true, isCheckedEdit: true}"
      :context-menu-config="{headerMenus, bodyMenus}"
      @edit-active="editActiveEvent"
      @custom-menu-link="customMenuLinkEvent"
      style="width: 100%" >
      <elx-editable-column type="index" align="center" width="50">
        <template v-slot:header>
          <i class="el-icon-setting" @click="dialogVisible = true"></i>
        </template>
      </elx-editable-column>
      <template v-for="(item, index) in columnConfigs">
        <elx-editable-column :key="index" v-bind="item" header-align="center" min-width="60" show-overflow-tooltip :edit-render="{name: 'ElInput'}">
          <template v-slot="scope">
            <span class="content">{{ scope.row[scope.column.property] }}</span>
          </template>
        </elx-editable-column>
      </template>
    </elx-editable>

    <el-dialog title="自定义列" :visible.sync="dialogVisible" width="540px" append-to-body @open="openCustomEvent">
      <el-transfer
        v-model="selectColumns"
        :data="allCustomColumnList"
        :titles="['隐藏列', '显示列']"
        :props="{key: 'prop', label: 'label'}"></el-transfer>
        <span slot="footer" class="dialog-footer">
          <el-button @click="resetCustomEvent">重 置</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCustomEvent">保 存</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
import XEUtils from 'xe-utils'
import XEClipboard from 'xe-clipboard'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import { Message, MessageBox } from 'element-ui'

export default {
  data () {
    let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
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
      dialogVisible: false,
      list: Array.from(new Array(20), (v, i) => {
        let rest = {}
        columns.forEach((name, index) => {
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
            default:
              rest[name.toLowerCase()] = `${name}-${i < 10 ? '0' + i : i}`
          }
        })
        return rest
      }),
      customColumns: [],
      selectColumns: [],
      columnConfigs: columns.map((name, index) => {
        let column = {
          prop: name.toLowerCase(),
          label: name
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
      },
      lastCopy: {
        content: null
      },
      headerMenus: [
        [
          {
            code: 'ALL_RESET',
            name: '重置所有数据',
            prefixIcon: 'el-icon-close'
          },
          {
            code: 'ALL_REVERT',
            name: '还原所有数据'
          },
          {
            code: 'ALL_EXPORT',
            name: '导出全部.cvs',
            prefixIcon: 'el-icon-download'
          }
        ]
      ],
      bodyMenus: [
        [
          {
            code: 'copy',
            name: '复制',
            prefixIcon: 'el-icon-document'
          },
          {
            code: 'paste',
            name: '粘贴',
            prefixIcon: 'el-icon-news'
          },
          {
            code: 'ROW_INSERT',
            name: '插入新行',
            prefixIcon: 'el-icon-plus'
          },
          {
            code: 'ROW_REMOVE',
            name: '删除行',
            prefixIcon: 'el-icon-minus'
          }
        ],
        [
          {
            code: 'CELL_RESET',
            name: '清除内容',
            prefixIcon: 'el-icon-close'
          },
          {
            code: 'ROW_RESET',
            name: '清除行数据'
          },
          {
            code: 'CELL_REVERT',
            name: '还原数据'
          },
          {
            code: 'ROW_REVERT',
            name: '还原行数据'
          }
        ],
        [
          {
            code: 'ROW_EXPORT',
            name: '导出行.cvs',
            prefixIcon: 'el-icon-download'
          },
          {
            code: 'ALL_EXPORT',
            name: '导出全部.cvs'
          },
          {
            code: 'xlsx',
            name: '导出全部.xlsx'
          },
          {
            code: 'printer',
            name: '打印',
            prefixIcon: 'el-icon-printer'
          },
          {
            code: 'test',
            name: '更多功能',
            prefixIcon: 'el-icon-view',
            disabled: true
          }
        ]
      ]
    }
  },
  computed: {
    allCustomColumnList () {
      return this.customColumns.filter(item => item.prop)
    }
  },
  methods: {
    cellClassName ({ row, column }) {
      if (this.lastCopy) {
        return this.lastCopy.row === row && this.lastCopy.column === column ? 'to-copy' : ''
      }
      return ''
    },
    editActiveEvent () {
      this.lastCopy = {
        row: null,
        column: null,
        content: null
      }
    },
    // 自定义菜单事件
    customMenuLinkEvent (code, row, column, cell) {
      switch (code) {
        case 'copy':
          this.lastCopy = {
            row,
            column,
            content: row[column.property]
          }
          XEClipboard.copy(this.lastCopy.content)
          break
        case 'paste':
          row[column.property] = this.lastCopy.content || null
          break
        case 'printer':
          print()
          break
        case 'xlsx':
          var sheetName = 'Sheet1'
          var book = {
            SheetNames: [sheetName],
            Sheets: {
              [sheetName]: XLSX.utils.json_to_sheet(this.$refs.elxEditable.getRecords().map(item => Object.values(item)), { skipHeader: true })
            }
          }
          var blob = new Blob([XLSX.write(book, { bookType: 'xlsx', bookSST: true, type: 'array' }, { type: 'application/octet-stream' })])
          FileSaver.saveAs(blob, 'table.xlsx')
          break
      }
    },
    getAllEvent () {
      let rest = this.$refs.elxEditable.getRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取所有数据(${rest.length}条)` }).catch(e => e)
    },
    getUpdateEvent () {
      let rest = this.$refs.elxEditable.getUpdateRecords()
      MessageBox({ message: JSON.stringify(rest), title: `获取已修改数据(${rest.length}条)` }).catch(e => e)
    },
    getResultEvent () {
      let rest = this.$refs.elxEditable.getRecords().filter(item => Object.keys(item).some(key => item[key]))
      MessageBox({ message: JSON.stringify(rest), title: `获取有值数据(${rest.length}条)` }).catch(e => e)
    },
    openCustomEvent () {
      this.selectColumns = this.allCustomColumnList.filter(item => item.visible).map(column => column.prop)
    },
    resetCustomEvent () {
      this.selectColumns = this.allCustomColumnList.map(column => column.prop)
    },
    saveCustomEvent () {
      if (!this.selectColumns.length) {
        return Message({
          type: 'error',
          message: '请至少选择一列！'
        })
      }
      this.dialogVisible = false
      this.allCustomColumnList.forEach(column => {
        column.visible = this.selectColumns.includes(column.prop)
      })
    }
  }
}
</script>

<style>
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column {
  cursor: cell;
}
.excel-table5 .el-table__header th,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column:first-child,
.excel-table5 .el-table__body .elx-editable-row:hover>.elx-editable-column:first-child {
  background-color: #f5f5f5;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column:first-child {
  cursor: default;
}
.excel-table5 .el-table__body .elx-editable-row:hover>.elx-editable-column {
  background-color: inherit;
}
.excel-table5 .el-table__header .elx-editable-column.elx_checked .cell:after,
  .excel-table5 .el-table__header .elx-editable-column.elx_active .cell:after{
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #217346;
}
.excel-table5 .el-table__header .elx-editable-column.elx_checked,
.excel-table5 .el-table__header .elx-editable-column.elx_active,
.excel-table5 .el-table__body .elx-editable-row.elx_checked>.elx-editable-column:first-child,
.excel-table5 .el-table__body .elx-editable-row.elx_active>.elx-editable-column:first-child{
  background-color: #D2D2D2;
  color: #1B5D39;
}
.excel-table5 .el-table__body .elx-editable-row.elx_checked>.elx-editable-column:first-child .cell:after,
.excel-table5 .el-table__body .elx-editable-row.elx_active>.elx-editable-column:first-child .cell:after{
  content: '';
  position: absolute;
  width: 2px;
  height: 100%;
  top: 0;
  right: -3px;
  z-index: 1;
  background-color: #217346;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_active {
  border: 2px solid #217346;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked.to-copy {
  border: 1px solid #217346;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_active.to-copy {
  border: 0;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column .cell {
  width: 100% !important;
  padding: 0 4px;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.to-copy .cell .content {
  padding: 0 1px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_active .cell {
  padding: 0;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked .cell,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column .cell .el-input__inner {
  padding: 0 2px;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked.to-copy .cell{
  padding: 0 1px;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked .cell,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_active .cell,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked .cell .el-input,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_active .cell .el-input,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked .cell .el-input__inner,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_active .cell .el-input__inner,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.to-copy .cell .content {
  height: 26px;
  line-height: 26px;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked.to-copy .cell .content {
  line-height: 24px;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked.to-copy .cell,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked.to-copy .cell .el-input,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.elx_checked.to-copy .cell .el-input__inner {
  height: 29px;
  line-height: 26px;
}
.excel-table5.el-table--customSize .el-table__body .elx-editable-column,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column .cell,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.to-copy .cell,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column .cell .el-input,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.to-copy .cell .el-input,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column .cell .el-input__inner,
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column.to-copy .cell .el-input__inner {
  height: 30px;
  line-height: 30px;
}
.excel-table5.el-table--customSize .el-table__header .elx-editable-column,
.excel-table5.el-table--customSize .el-table__header .elx-editable-column .cell {
  height: 35px;
  line-height: 35px;
}
.excel-table5 .el-table__body .elx-editable-row>.elx-editable-column .cell .el-input__inner {
  border-radius: 0;
  border: 0;
}
.excel-table5.el-table--customSize .el-table__body .elx-editable-column.to-copy .cell {
  position: relative;
  background: repeating-linear-gradient(135deg, transparent, transparent 3px, #217346 3px, #217346 8px);
  animation: shine 1s infinite linear;
  overflow: hidden;
}
.excel-table5.el-table--customSize .el-table__body .elx-editable-column.to-copy .cell .content {
  content: '';
  background-color: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
}
.custom-wrapper {
  height: 200px;
  overflow: auto;
}
@keyframes shine {
  0% {
    background-position: -1px -1px;
  }
  100% {
    background-position: -12px -12px;
  }
}
</style>
