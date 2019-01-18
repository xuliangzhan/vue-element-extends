<template>
  <el-table
    ref="refElTable"
    :class="['editable', {'editable--icon': editIcon}]"
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
    :summaryMethod="summaryMethod"
    :selectOnIndeterminate="selectOnIndeterminate"
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
    selectOnIndeterminate: { type: Boolean, default: true }
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
    editIcon () {
      return this.editConfig ? !(this.editConfig.icon === false) : true
    }
  },
  watch: {
    globalClick (evnt) {
      if (this.lastActive) {
        let target = evnt.target
        let { cell } = this.lastActive
        while (target && target.nodeType && target !== document) {
          if (this.editConfig && this.editConfig.mode === 'row' ? target === cell.parentNode : target === cell) {
            return
          }
          target = target.parentNode
        }
        this.clearActive()
      }
    }
  },
  created () {
    this._initial(this.data, true)
  },
  methods: {
    _initial (datas, isReload) {
      if (isReload) {
        this.initialStore = this.$utils.clone(datas, true)
      }
      this.datas = (datas || []).map(item => this._toData(item))
    },
    _toData (item, status) {
      return item.editable && item.EDITABLE_PROTO === this.editProto ? item : {
        EDITABLE_PROTO: this.editProto,
        data: item,
        store: this.$utils.clone(item, true),
        editStatus: status || 'initial',
        editActive: null,
        editable: {
          size: this.size,
          icon: this.editIcon,
          status: this.editConfig ? !(this.editConfig.status === false) : true,
          mode: this.editConfig ? (this.editConfig.mode || 'cell') : 'cell'
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
        if (row && this.editConfig.mode === 'row') {
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
          this.datas.push(recordItem)
        } else {
          this.datas.splice(rowIndex, 0, recordItem)
        }
      } else {
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
      this.$utils.lastEach(this.datas, (item, index) => {
        if (rowIndexs.includes(index)) {
          this.removeRow(index)
        }
      })
    },
    remove (record) {
      this.removeRow(this.$utils.findIndexOf(this.datas, item => item.data === record))
    },
    removes (records) {
      this.$utils.lastEach(this.datas, (item, index) => {
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
      return this.getRecords(this.datas.filter(item => item.editStatus === 'initial' && !this.$utils.isEqual(item.data, item.store)))
    },
    updateStatus ({ $index, column }) {
      let trElem = this.$el.querySelectorAll('.el-table__row')[$index]
      let tdElem = trElem.querySelector(`.${column.id}`)
      let classList = tdElem.className.split(' ')
      if (!classList.includes('editable-col_dirty')) {
        classList.push('editable-col_dirty')
        tdElem.className = classList.join(' ')
      }
    }
  }
}
</script>
