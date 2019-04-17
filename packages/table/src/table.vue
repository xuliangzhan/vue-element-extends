<template>
  <el-table
    ref="refElTable"
    class="elx-table"
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
import UtilHandle from '../../editable/src/util'
import ScrollHandle from '../../editable/src/scroll'

export default {
  name: 'ElxTable',
  props: {
    config: Object,
    customColumns: Array,

    /**
     * 还原 ElTable 所有属性
     */
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
      $table: this
    }
  },
  data () {
    return {
      datas: [],
      columnList: [],
      visibleIndex: 0,
      visibleStart: 0
    }
  },
  computed: {
    configs () {
      return Object.assign({
        // 渲染方式，可以设置为 scroll 启用滚动渲染，支持海量数据
        render: 'default',
        // 只对 render=scroll 有效，滚动实时渲染条数
        size: null
      }, this.config)
    },
    scrollLoad () {
      return this.configs.render === 'scroll'
    }
  },
  watch: {
    data (value) {
      this.reload(value || [])
    },
    customColumns (value) {
      if (!this.isUpdateColumns) {
        this._handleColumns()
      } else {
        this.isUpdateColumns = false
      }
    }
  },
  created () {
    this._fullData = this.data || []
    this._handleColumns()
    if (this.scrollLoad) {
      this._bindScrollEvent().then(() => this._reloadScrollData())
    }
  },
  destroyed () {
    if (this.scrollLoad) {
      this._unbindScrollEvent()
    }
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
    _getTDatas () {
      return this.$refs.refElTable ? this.$refs.refElTable.tableData : this._fullData
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

    /****************************/
    /* Scroll methods end       */
    /****************************/
    _reloadScrollData: ScrollHandle.reload(),
    _bindScrollEvent: ScrollHandle.bind(),
    _unbindScrollEvent: ScrollHandle.unbind(),
    _scrollEvent: ScrollHandle.scroll(),
    _computeScroll: ScrollHandle.compute(8),
    /****************************/
    /* Scroll methods end       */
    /****************************/

    /******************************/
    /* Public methods start       */
    /******************************/
    reload (data) {
      this._fullData = data || []
      if (this.scrollLoad) {
        this._reloadScrollData()
      } else {
        this.datas = data
      }
      return this.$nextTick()
    },
    getColumns () {
      return this.$refs.refElTable ? this.$refs.refElTable.columns : []
    },
    getRecords (rowIndex) {
      return arguments.length ? this._fullData[rowIndex] : this._fullData
    },
    /**
     * 导出 csv 文件
     */
    exportCsv (options) {
      let opts = Object.assign({
        filename: 'table.csv',
        original: false,
        data: null,
        columns: null,
        columnFilterMethod: column => ['index', 'selection', 'expand'].indexOf(column.type) === -1 && column.property,
        dataFilterMethod: null
      }, options)
      if (opts.filename.indexOf('.csv') === -1) {
        opts.filename += '.csv'
      }
      let columns = this.getColumns()
      let oData = this.scrollLoad ? this._fullData : this._getTDatas()
      UtilHandle.downloadCsc(opts, UtilHandle.getCsvContent(opts, oData, columns, this.$el))
    }
    /******************************/
    /* Public methods end         */
    /******************************/
  }
}
</script>

<style src="../../../style/table.css"></style>
