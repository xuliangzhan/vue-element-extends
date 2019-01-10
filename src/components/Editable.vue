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
    currentRowKey: [String, Number]
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
        this.clearActive()
      }
    }
  },
  created () {
    window.aaa = this
    this._initial(this.data)
  },
  methods: {
    _initial (datas) {
      this.initialStore = this.$utils.clone(datas, true)
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
      this.clearActive()
      this.lastActive = { row, column, cell }
      cell.className += ` active`
      row.editable.active = column.property
      this.$emit('cell-click', row.data, column, cell, event)
    },
    reload (datas) {
      this.deleteRecords = []
      this.clearActive()
      this._initial(datas)
      this._updateData()
    },
    reset () {
      this.reload(this.initialStore)
    },
    clearActive () {
      this.lastActive = null
      this.datas.forEach(item => {
        item.editable.active = null
      })
      Array.from(this.$el.querySelectorAll('.active.editable-column')).forEach(elem => {
        elem.className = elem.className.replace(/\s?active/, '')
      })
    },
    insert (record) {
      this.insertAt(record, 0)
    },
    insertAt (record, rowIndex) {
      let recordItem = {}
      let len = this.data.length
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
