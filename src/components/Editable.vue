<template>
  <el-table
    ref="refElTable"
    class="editable"
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
    @cell-click="_cellClick">
    <slot></slot>
  </el-table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ElEditable',
  props: {
    data: Array,
    height: [String, Number],
    maxHeight: [String, Number],
    stripe: Boolean,
    border: Boolean,
    size: String,
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
      'onclick'
    ])
  },
  watch: {
    onclick (evnt) {
      if (this.lastActive) {
        let target = evnt.target
        let { cell } = this.lastActive
        while (target && target.nodeType && target !== document) {
          if (target === cell) {
            return
          }
          target = target.parentNode
        }
        this._clearActive()
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
        editable: {
          status: status || 'initial',
          active: null
        }
      }
    },
    _updateData () {
      this.$emit('update:data', this.datas.map(item => item.data))
    },
    _cellClick (row, column, cell, event) {
      this._clearActive()
      this.lastActive = { row, column, cell }
      cell.className += ` active`
      row.editable.active = column.property
      this.$emit('cell-click', row.data, column, cell, event)
    },
    _clearActive () {
      this.lastActive = null
      this.datas.forEach(item => {
        item.editable.active = null
      })
      Array.from(this.$el.querySelectorAll('.active.editable-column')).forEach(elem => {
        elem.className = elem.className.replace(/\s?active/, '')
      })
    },
    reload (datas) {
      this.deleteRecords = []
      this._clearActive()
      this._initial(datas, true)
      this._updateData()
    },
    revert () {
      this.reload(this.initialStore)
    },
    clear () {
      this.deleteRecords = []
      this._clearActive()
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
        if (item.editable.status === 'initial') {
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
      return this.getRecords(this.datas.filter(item => item.editable.status === 'insert'))
    },
    getRemoveRecords () {
      return this.getRecords(this.deleteRecords)
    },
    getUpdateRecords () {
      return this.getRecords(this.datas.filter(item => item.editable.status === 'initial' && !this.$utils.isEqual(item.data, item.store)))
    }
  }
}
</script>
