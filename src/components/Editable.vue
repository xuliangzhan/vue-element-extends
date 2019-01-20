<template>
  <el-table
    ref="refElTable"
    :class="['editable', {'editable--icon': showIcon}]"
    :data="datas"
    :height="height"
    :maxHeight="maxHeight"
    :stripe="stripe"
    :border="border"
    :size="size"
    :fit="fit"
    :showHeader="showHeader"
    :highlightCurrentRow="highlightCurrentRow"
    :currentRowKey="currentRowKey"
    :rowClassName="rowClassName"
    :rowStyle="rowStyle"
    :headerRowClassName="headerRowClassName"
    :headerRowStyle="headerRowStyle"
    :headerCellClassName="headerCellClassName"
    :headerCellStyle="headerCellStyle"
    :rowKey="rowKey"
    :emptyText="emptyText"
    :defaultExpandAll="defaultExpandAll"
    :expandRowKeys="expandRowKeys"
    :defaultSort="defaultSort"
    :tooltipEffect="tooltipEffect"
    :showSummary="showSummary"
    :sumText="sumText"
    :summaryMethod="_summaryMethod"
    :selectOnIndeterminate="selectOnIndeterminate"
    :spanMethod="_spanMethod"
    @select="_select"
    @select-all="_selectAll"
    @selection-change="_selectionChange"
    @cell-mouse-enter="_cellMouseEnter"
    @cell-mouse-leave="_cellMouseLeave"
    @cell-click="_cellClick"
    @cell-dblclick="_cellDBLclick"
    @row-click="_rowClick"
    @row-contextmenu="_rowContextmenu"
    @row-dblclick="_rowDBLclick"
    @header-click="_headerClick"
    @header-contextmenu="_headerContextmenu"
    @sort-change="_sortChange"
    @filter-change="_filterChange"
    @current-change="_currentChange"
    @header-dragend="_headerDragend"
    @expand-change="_expandChange">
    <slot></slot>
  </el-table>
</template>

<script>
import XEUtils from 'xe-utils'
import { mapGetters } from 'vuex'

export default {
  name: 'ElEditable',
  props: {
    editConfig: Object,

    data: Array,
    height: [String, Number],
    maxHeight: [String, Number],
    stripe: Boolean,
    border: Boolean,
    size: { type: String, default: 'small' },
    fit: { type: Boolean, default: true },
    showHeader: { type: Boolean, default: true },
    highlightCurrentRow: Boolean,
    currentRowKey: [String, Number],
    rowClassName: [Function, String],
    rowStyle: [Function, Object],
    cellClassName: [Function, String],
    cellStyle: [Function, Object],
    headerRowClassName: [Function, String],
    headerRowStyle: [Function, Object],
    headerCellClassName: [Function, String],
    headerCellStyle: [Function, Object],
    rowKey: [Function, String],
    emptyText: String,
    defaultExpandAll: Boolean,
    expandRowKeys: Array,
    defaultSort: Object,
    tooltipEffect: { type: String, default: 'dark' },
    showSummary: Boolean,
    sumText: { type: String, default: '合计' },
    summaryMethod: Function,
    selectOnIndeterminate: { type: Boolean, default: true },
    spanMethod: Function
  },
  data () {
    return {
      editProto: {},
      datas: [],
      initialStore: [],
      deleteRecords: [],
      lastActive: null
    }
  },
  computed: {
    ...mapGetters([
      'globalClick'
    ]),
    showIcon () {
      return this.editConfig ? !(this.editConfig.showIcon === false) : true
    },
    showStatus () {
      return this.editConfig ? !(this.editConfig.showStatus === false) : true
    },
    mode () {
      return this.editConfig ? (this.editConfig.mode || 'cell') : 'cell'
    }
  },
  watch: {
    globalClick (evnt) {
      if (this.lastActive) {
        let target = evnt.target
        let { cell } = this.lastActive
        while (target && target.nodeType && target !== document) {
          if (this.mode === 'row' ? target === cell.parentNode : target === cell) {
            return
          }
          target = target.parentNode
        }
        this.clearActive()
      }
    },
    datas () {
      this.updateStatus()
    }
  },
  created () {
    this._initial(this.data, true)
  },
  methods: {
    _initial (datas, isReload) {
      if (isReload) {
        this.initialStore = XEUtils.clone(datas, true)
      }
      this.datas = (datas || []).map(item => this._toData(item))
    },
    _toData (item, status) {
      return item.editable && item._EDITABLE_PROTO === this.editProto ? item : {
        _EDITABLE_PROTO: this.editProto,
        data: item,
        store: XEUtils.clone(item, true),
        editStatus: status || 'initial',
        editActive: null,
        editable: {
          size: this.size,
          showIcon: this.showIcon,
          showStatus: this.showStatus,
          mode: this.mode
        }
      }
    },
    _updateData () {
      this.$emit('update:data', this.datas.map(item => item.data))
    },
    _select (selection, row) {
      this.$emit('select', selection.map(item => item.data), row.data)
    },
    _selectAll (selection) {
      this.$emit('select-all', selection.map(item => item.data))
    },
    _selectionChange (selection) {
      this.$emit('selection-change', selection.map(item => item.data))
    },
    _cellMouseEnter (row, column, cell, event) {
      this.$emit('cell-mouse-enter', row.data, column, cell, event)
    },
    _cellMouseLeave (row, column, cell, event) {
      this.$emit('cell-mouse-leave', row.data, column, cell, event)
    },
    _cellClick (row, column, cell, event) {
      if (!this.editConfig || this.editConfig.trigger === 'click') {
        this._triggerActive(row, column, cell)
      }
      this.$emit('cell-click', row.data, column, cell, event)
    },
    _cellDBLclick (row, column, cell, event) {
      if (this.editConfig && this.editConfig.trigger === 'dblclick') {
        this._triggerActive(row, column, cell)
      }
      this.$emit('cell-dblclick', row.data, column, cell, event)
    },
    _rowClick (row, event, column) {
      this.$emit('row-click', row.data, event, column)
    },
    _rowContextmenu (row, event) {
      this.$emit('row-contextmenu', row.data, event)
    },
    _rowDBLclick (row, event) {
      this.$emit('row-dblclick', row.data, event)
    },
    _headerClick (column, event) {
      this.$emit('header-click', column, event)
    },
    _headerContextmenu (column, event) {
      this.$emit('header-contextmenu', column, event)
    },
    _sortChange ({ column, prop, order }) {
      this.$emit('sort-change', { column, prop, order })
    },
    _filterChange (filters) {
      this.$emit('filter-change', filters)
    },
    _currentChange (currentRow, oldCurrentRow) {
      if (currentRow && oldCurrentRow) {
        this.$emit('current-change', currentRow.data, oldCurrentRow.data)
      } else if (currentRow) {
        this.$emit('current-change', currentRow.data)
      } else if (oldCurrentRow) {
        this.$emit('current-change', oldCurrentRow.data)
      }
    },
    _headerDragend (newWidth, oldWidth, column, event) {
      this.$emit('header-dragend', newWidth, oldWidth, column, event)
    },
    _expandChange (row, expandedRows) {
      this.$emit('expand-change', row.data, expandedRows)
    },
    _triggerActive (row, column, cell) {
      this.clearActive()
      this.lastActive = { row, column, cell }
      cell.className += ` editable-col_active`
      row.editActive = column.property
      this.$nextTick(() => {
        let inpElem = cell.querySelector('.el-input>input')
        if (!inpElem) {
          inpElem = cell.querySelector('.el-textarea>textarea')
          if (!inpElem) {
            inpElem = cell.querySelector('.editable-custom_input')
          }
        }
        if (inpElem) {
          inpElem.focus()
        }
      })
    },
    _updateColumnStatus (trElem, column, tdElem) {
      if (column.className.split(' ').includes('editable-col_edit')) {
        let classList = tdElem.className.split(' ')
        if (!classList.includes('editable-col_dirty')) {
          classList.push('editable-col_dirty')
          tdElem.className = classList.join(' ')
        }
      }
    },
    _summaryMethod (param) {
      let { columns } = param
      let data = param.data.map(item => item.data)
      let sums = []
      if (this.summaryMethod) {
        sums = this.summaryMethod({ columns, data })
      } else {
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = this.sumText
            return
          }
          let values = data.map(item => Number(item[column.property]))
          let precisions = []
          let notNumber = true
          values.forEach(value => {
            if (!isNaN(value)) {
              notNumber = false
              let decimal = ('' + value).split('.')[1]
              precisions.push(decimal ? decimal.length : 0)
            }
          })
          let precision = Math.max.apply(null, precisions)
          if (!notNumber) {
            sums[index] = values.reduce((prev, curr) => {
              let value = Number(curr)
              if (!isNaN(value)) {
                return parseFloat((prev + curr).toFixed(Math.min(precision, 20)))
              } else {
                return prev
              }
            }, 0)
          } else {
            sums[index] = ''
          }
        })
      }
      return sums
    },
    _spanMethod ({ row, column, rowIndex, columnIndex }) {
      let rowspan = 1
      let colspan = 1
      let fn = this.spanMethod
      if (XEUtils.isFunction(fn)) {
        var result = fn({
          row: row.data,
          column: column,
          rowIndex: rowIndex,
          columnIndex: columnIndex
        })
        if (XEUtils.isArray(result)) {
          rowspan = result[0]
          colspan = result[1]
        } else if (XEUtils.isPlainObject(result)) {
          rowspan = result.rowspan
          colspan = result.colspan
        }
      }
      return {
        rowspan: rowspan,
        colspan: colspan
      }
    },
    clearActive () {
      this.lastActive = null
      this.datas.forEach(item => {
        item.editActive = null
      })
      Array.from(this.$el.querySelectorAll('.editable-col_active.editable-column')).forEach(elem => {
        elem.className = elem.className.split(' ').filter(name => name !== 'editable-col_active').join(' ')
      })
    },
    setActiveRow (rowIndex) {
      setTimeout(() => {
        let row = this.datas[rowIndex]
        if (row && this.mode === 'row') {
          let column = this.$refs.refElTable.columns.find(column => column.property)
          let trElemList = this.$el.querySelectorAll('.el-table__body-wrapper .el-table__row')
          let cell = trElemList[rowIndex].children[0]
          this._triggerActive(row, column, cell)
        }
      }, 5)
    },
    reload (datas) {
      this.deleteRecords = []
      this.clearActive()
      this._initial(datas, true)
      this._updateData()
    },
    revert () {
      this.reload(this.initialStore)
    },
    clear () {
      this.deleteRecords = []
      this.clearActive()
      this._initial([])
      this._updateData()
    },
    insert (record) {
      this.insertAt(record, 0)
    },
    insertAt (record, rowIndex) {
      let recordItem = {}
      let len = this.datas.length
      this.$refs.refElTable.columns.forEach(column => {
        if (column.property) {
          recordItem[column.property] = null
        }
      })
      recordItem = this._toData(Object.assign(recordItem, record), 'insert')
      if (rowIndex) {
        if (rowIndex === -1 || rowIndex >= len) {
          rowIndex = len
          this.datas.push(recordItem)
        } else {
          this.datas.splice(rowIndex, 0, recordItem)
        }
      } else {
        rowIndex = 0
        this.datas.unshift(recordItem)
      }
      this._updateData()
    },
    removeRow (rowIndex) {
      let items = this.datas.splice(rowIndex, 1)
      items.forEach(item => {
        if (item.editStatus === 'initial') {
          this.deleteRecords.push(item)
        }
      })
      this._updateData()
    },
    removeRows (rowIndexs) {
      XEUtils.lastEach(this.datas, (item, index) => {
        if (rowIndexs.includes(index)) {
          this.removeRow(index)
        }
      })
    },
    remove (record) {
      this.removeRow(XEUtils.findIndexOf(this.datas, item => item.data === record))
    },
    removes (records) {
      XEUtils.lastEach(this.datas, (item, index) => {
        if (records.includes(item.data)) {
          this.removeRow(index)
        }
      })
    },
    removeSelecteds () {
      this.removes(this.$refs.refElTable.selection.map(item => item.data))
    },
    getRecords (datas) {
      return (datas || this.datas).map(item => item.data)
    },
    getAllRecords () {
      return {
        records: this.getRecords(),
        insertRecords: this.getInsertRecords(),
        removeRecords: this.getRemoveRecords(),
        updateRecords: this.getUpdateRecords()
      }
    },
    getInsertRecords () {
      return this.getRecords(this.datas.filter(item => item.editStatus === 'insert'))
    },
    getRemoveRecords () {
      return this.getRecords(this.deleteRecords)
    },
    getUpdateRecords () {
      return this.getRecords(this.datas.filter(item => item.editStatus === 'initial' && !XEUtils.isEqual(item.data, item.store)))
    },
    updateStatus (scope) {
      if (this.showStatus) {
        if (arguments.length === 0) {
          this.$nextTick(() => {
            let trElems = this.$el.querySelectorAll('.el-table__row')
            if (trElems.length) {
              let columns = this.$refs.refElTable.columns
              this.datas.forEach((item, index) => {
                let trElem = trElems[index]
                if (trElem.children.length) {
                  if (item.editStatus === 'insert') {
                    columns.forEach((column, cIndex) => this._updateColumnStatus(trElem, column, trElem.children[cIndex]))
                  } else {
                    columns.forEach((column, cIndex) => {
                      let tdElem = trElem.children[cIndex]
                      if (tdElem) {
                        if (XEUtils.isEqual(item.data[column.property], item.store[column.property])) {
                          let classList = tdElem.className.split(' ')
                          tdElem.className = classList.filter(name => name !== 'editable-col_dirty').join(' ')
                        } else {
                          this._updateColumnStatus(trElem, column, trElem.children[cIndex])
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          this.$nextTick(() => {
            let { $index, _row, column, store } = scope
            let trElems = store.table.$el.querySelectorAll('.el-table__row')
            if (trElems.length) {
              let trElem = trElems[$index]
              let tdElem = trElem.querySelector(`.${column.id}`)
              if (tdElem) {
                let classList = tdElem.className.split(' ')
                if (XEUtils.isEqual(_row.data[column.property], _row.store[column.property])) {
                  tdElem.className = classList.filter(name => name !== 'editable-col_dirty').join(' ')
                } else {
                  this._updateColumnStatus(trElem, column, tdElem)
                }
              }
            }
          })
        }
      }
    }
  }
}
</script>
