<template>
  <el-table
    ref="refElTable"
    class="elx-table"
    v-bind="attrs"
    v-on="events">
    <slot></slot>
    <template slot="empty">
      <slot name="empty"></slot>
    </template>
    <template slot="append">
      <slot name="append"></slot>
    </template>
  </el-table>
</template>

<script>
export default {
  name: 'ElxTable',
  props: {
    customKey: String,
    customColumns: Array,
    /**
     * 还原 ElTable 所有属性
     */
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
    sumText: String,
    summaryMethod: Function,
    selectOnIndeterminate: { type: Boolean, default: true },
    spanMethod: Function,
    load: this.load
  },
  provide () {
    return {
      $editable: this
    }
  },
  data () {
    return {
      isUpdateColumns: false,
      columnList: []
    }
  },
  computed: {
    attrs () {
      return {
        data: this.data,
        height: this.height,
        maxHeight: this.maxHeight,
        stripe: this.stripe,
        border: this.border,
        size: this.size,
        fit: this.fit,
        showHeader: this.showHeader,
        highlightCurrentRow: this.highlightCurrentRow,
        currentRowKey: this.currentRowKey,
        lazy: this.lazy,
        indent: this.indent,
        rowClassName: this.rowClassName,
        rowStyle: this.rowStyle,
        cellClassName: this.cellClassName,
        cellStyle: this.cellStyle,
        headerRowClassName: this.headerRowClassName,
        headerRowStyle: this.headerRowStyle,
        headerCellClassName: this.headerCellClassName,
        headerCellStyle: this.headerCellStyle,
        rowKey: this.rowKey,
        emptyText: this.emptyText,
        defaultExpandAll: this.defaultExpandAll,
        expandRowKeys: this.expandRowKeys,
        defaultSort: this.defaultSort,
        tooltipEffect: this.tooltipEffect,
        showSummary: this.showSummary,
        sumText: this.sumText,
        summaryMethod: this.summaryMethod,
        selectOnIndeterminate: this.selectOnIndeterminate,
        spanMethod: this.spanMethod
      }
    },
    events () {
      return {
        'select': this._select,
        'select-all': this._selectAll,
        'selection-change': this._selectionChange,
        'cell-mouse-enter': this._cellMouseEnter,
        'cell-mouse-leave': this._cellMouseLeave,
        'cell-click': this._cellClick,
        'cell-dblclick': this._cellDBLclick,
        'row-click': this._rowClick,
        'row-contextmenu': this._rowContextmenu,
        'row-dblclick': this._rowDBLclick,
        'header-click': this._headerClick,
        'header-contextmenu': this._headerContextmenu,
        'sort-change': this._sortChange,
        'filter-change': this._filterChange,
        'current-change': this._currentChange,
        'header-dragend': this._headerDragend,
        'expand-change': this._expandChange
      }
    }
  },
  watch: {
    customColumns (value) {
      if (!this.isUpdateColumns) {
        this._handleColumns()
      } else {
        this.isUpdateColumns = false
      }
    }
  },
  created () {
    this._initial()
  },
  methods: {
    /****************************/
    /* Original methods statrt  */
    /****************************/
    clearSelection () {
      return this.$refs.refElTable.clearSelection()
    },
    toggleRowSelection (record, selected) {
      return this.$refs.refElTable.toggleRowSelection(record, selected)
    },
    toggleAllSelection () {
      return this.$refs.refElTable.toggleAllSelection()
    },
    toggleRowExpansion (record, expanded) {
      return this.$refs.refElTable.toggleRowExpansion(record, expanded)
    },
    setCurrentRow (record) {
      return this.$refs.refElTable.setCurrentRow(record)
    },
    clearSort () {
      return this.$refs.refElTable.clearSort()
    },
    clearFilter () {
      return this.$refs.refElTable.clearFilter()
    },
    doLayout () {
      return this.$refs.refElTable.doLayout()
    },
    sort (prop, order) {
      return this.$refs.refElTable.sort(prop, order)
    },
    _select (selection, row) {
      this.$emit('select', selection, row)
    },
    _selectAll (selection) {
      this.$emit('select-all', selection)
    },
    _selectionChange (selection) {
      this.$emit('selection-change', selection)
    },
    _cellMouseEnter (row, column, cell, event) {
      this.$emit('cell-mouse-enter', row, column, cell, event)
    },
    _cellMouseLeave (row, column, cell, event) {
      this.$emit('cell-mouse-leave', row, column, cell, event)
    },
    _cellClick (row, column, cell, event) {
      this.$emit('cell-click', row, column, cell, event)
    },
    _cellDBLclick (row, column, cell, event) {
      this.$emit('cell-dblclick', row, column, cell, event)
    },
    _rowClick (row, column, event) {
      this.$emit('row-click', row, column, event)
    },
    _rowContextmenu (row, column, event) {
      this.$emit('row-contextmenu', row, column, event)
    },
    _rowDBLclick (row, column, event) {
      this.$emit('row-dblclick', row, column, event)
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
      this.$emit('current-change', currentRow, oldCurrentRow)
    },
    _headerDragend (newWidth, oldWidth, column, event) {
      this.$emit('header-dragend', newWidth, oldWidth, column, event)
    },
    _expandChange (row, expandedRows) {
      this.$emit('expand-change', row, expandedRows)
    },
    /****************************/
    /* Original methods end     */
    /****************************/

    /****************************/
    /* Attribute methods statrt */
    /****************************/
    _initial () {
      this._handleColumns()
    },
    _handleColumns () {
      this.columnList = []
      this.$nextTick(() => {
        let customColumns = this.customColumns && this.customColumns.length ? this.customColumns : null
        this.columnList = this.getColumns().map(column => {
          let customItem = customColumns ? customColumns.find(item => column.property && item.prop === column.property) : null
          return {
            id: column.id,
            prop: column.property,
            label: column.label,
            visible: customItem ? !!customItem.visible : true
          }
        })
        this.isUpdateColumns = true
        this.$emit('update:customColumns', this.columnList)
      })
    },
    /****************************/
    /* Attribute methods end    */
    /****************************/

    /****************************/
    /* Public methods start     */
    /****************************/
    getColumns () {
      return this.$refs.refElTable ? this.$refs.refElTable.columns : []
    }
    /****************************/
    /* Public methods end       */
    /****************************/
  }
}
</script>

<style src="../../../style/table.css"></style>
