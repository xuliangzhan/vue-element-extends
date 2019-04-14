<template>
  <el-table
    ref="refElTable"
    class="elx-table"
    :data="data"
    :height="height"
    :maxHeight="maxHeight"
    :stripe="stripe"
    :border="border"
    :size="size"
    :fit="fit"
    :showHeader="showHeader"
    :highlightCurrentRow="highlightCurrentRow"
    :currentRowKey="currentRowKey"
    :lazy="lazy"
    :indent="indent"
    :rowClassName="rowClassName"
    :rowStyle="rowStyle"
    :cellClassName="cellClassName"
    :cellStyle="cellStyle"
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
    :spanMethod="spanMethod"
    :load="load"
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
    lazy: Boolean,
    indent: Number,
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
    load: Function
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
    /****************************/
    /* Original methods end     */
    /****************************/

    /****************************/
    /* Original methods start   */
    /****************************/
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
    /******************************/
    /* Original Attribute statrt  */
    /******************************/

    /******************************/
    /* Interior methods statrt    */
    /******************************/
    _initial () {
      this._handleColumns()
    },
    _handleColumns () {
      this.columnList = []
      if (this.customColumns) {
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
      }
    },
    /******************************/
    /* Interior methods end       */
    /******************************/

    /******************************/
    /* Public methods start       */
    /******************************/
    getColumns () {
      return this.$refs.refElTable ? this.$refs.refElTable.columns : []
    }
    /******************************/
    /* Public methods end         */
    /******************************/
  }
}
</script>

<style src="../../../style/table.css"></style>
