<template>
  <el-table ref="refElTable" v-bind="attrs" v-on="events">
    <slot></slot>
    <template v-slot:append>
      <slot name="append"></slot>
    </template>
  </el-table>
</template>

<script>
import XEUtils from 'xe-utils'
import GlobalEvents from './globalEvents.js'

export default {
  name: 'ElEditable',
  props: {
    editConfig: Object,
    editRules: Object,

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
    spanMethod: Function
  },
  provide () {
    return {
      $editable: this
    }
  },
  data () {
    return {
      editProto: {},
      datas: [],
      initialStore: [],
      deleteRecords: [],
      lastActive: null,
      callEvent: null,
      isUpdateData: false
    }
  },
  computed: {
    attrs () {
      return {
        class: ['editable', `editable_${this.configs.trigger}`, { 'editable_icon': this.configs.showIcon }],
        data: this.datas,
        height: this.height,
        maxHeight: this.maxHeight,
        stripe: this.stripe,
        border: this.border,
        size: this.size,
        fit: this.fit,
        showHeader: this.showHeader,
        highlightCurrentRow: this.highlightCurrentRow,
        currentRowKey: this.currentRowKey,
        rowClassName: this._rowClassName,
        rowStyle: XEUtils.isFunction(this.rowStyle) ? this._rowStyle : this.rowStyle,
        cellClassName: this._cellClassName,
        cellStyle: XEUtils.isFunction(this.cellStyle) ? this._cellStyle : this.cellStyle,
        headerRowClassName: XEUtils.isFunction(this.headerRowClassName) ? this._headerRowClassName : this.headerRowClassName,
        headerRowStyle: XEUtils.isFunction(this.headerRowStyle) ? this._headerRowStyle : this.headerRowStyle,
        headerCellClassName: XEUtils.isFunction(this.headerCellClassName) ? this._headerCellClassName : this.headerCellClassName,
        headerCellStyle: XEUtils.isFunction(this.headerCellStyle) ? this._headerCellStyle : this.headerCellStyle,
        rowKey: XEUtils.isFunction(this.rowKey) ? this._rowKey : this.rowKey ? `data.${this.rowKey}` : this.rowKey,
        emptyText: this.emptyText,
        defaultExpandAll: this.defaultExpandAll,
        expandRowKeys: this.expandRowKeys,
        defaultSort: this.defaultSort,
        tooltipEffect: this.tooltipEffect,
        showSummary: this.showSummary,
        sumText: this.sumText,
        summaryMethod: this._summaryMethod,
        selectOnIndeterminate: this.selectOnIndeterminate,
        spanMethod: this._spanMethod
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
    },
    configs () {
      let editConfig = this.editConfig || {}
      let tipConf = editConfig ? (editConfig.validTooltip || {}) : {}
      let conf = Object.assign({
        // 触发方式
        trigger: 'click',
        // 是否显示列头编辑图标
        showIcon: true,
        // 是否实时显示单元格值的修改状态
        showStatus: true,
        // 编辑模式
        mode: 'cell',
        // 是否使用默认的 tip 校验提示框，如果同时使用了数据校验和 fixed 列，建议设置为 true，否则会出现多个 tip 提示（因为隐藏的 fixed 列部分也会被渲染，所以会导致同时出现多个校验提示）
        useDefaultValidTip: false,
        // 是否关闭校验提示
        disabledValidTip: false,
        // 当点击其它地方后，自动清除最后活动行或列
        autoClearActive: true,
        // 当单元格被激活时，自动将单元格滚动到可视区域内
        autoScrollIntoView: false,
        // 是否启用 Tab 键切换到下一个单元格
        isTabKey: false,
        // 是否启用箭头键切换行和单元格
        isArrowKey: false,
        // 是否启用选中状态是否允许值覆盖式编辑，当 isTabKey 或 isArrowKey 为true 时启用时默认 true，否则 false
        isCheckedEdit: !!(editConfig.isTabKey || editConfig.isArrowKey)
      }, editConfig, {
        // 限制 Tooltip 固定参数不允许修改
        validTooltip: Object.assign({
          disabled: false,
          offset: 10,
          placement: 'bottom-start'
        }, tipConf, {
          manual: true,
          popperClass: ['editable-valid_tooltip'].concat(tipConf.popperClass ? tipConf.popperClass.split(' ') : []).join(' ')
        })
      })
      return conf
    }
  },
  watch: {
    data (value) {
      if (!this.isUpdateData) {
        if (value.length) {
          this.reload(value)
        } else {
          this.clear()
        }
      } else {
        this.isUpdateData = false
      }
    }
  },
  created () {
    this._bindEvents()
    this._initial(this.data, true)
  },
  destroyed () {
    this._unbindEvents()
  },
  methods: {
    /**************************/
    /* Original methods statrt */
    /**************************/
    clearSelection () {
      this.$nextTick(() => this.$refs.refElTable.clearSelection())
    },
    toggleRowSelection (record, selected) {
      this.$nextTick(() => this.$refs.refElTable.toggleRowSelection(this.datas.find(item => item.data === record), selected))
    },
    toggleAllSelection () {
      this.$nextTick(() => this.$refs.refElTable.toggleAllSelection())
    },
    toggleRowExpansion (record, expanded) {
      this.$nextTick(() => this.$refs.refElTable.toggleRowExpansion(this.datas.find(item => item.data === record), expanded))
    },
    setCurrentRow (record) {
      this.$nextTick(() => this.$refs.refElTable.setCurrentRow(this.datas.find(item => item.data === record)))
    },
    clearSort () {
      this.$nextTick(() => this.$refs.refElTable.clearSort())
    },
    clearFilter () {
      this.$nextTick(() => this.$refs.refElTable.clearFilter())
    },
    doLayout () {
      this.$nextTick(() => this.$refs.refElTable.doLayout())
    },
    sort (prop, order) {
      this.$nextTick(() => this.$refs.refElTable.sort(prop, order))
    },
    insert (newRecord) {
      return this.insertAt(newRecord, 0)
    },
    /**************************/
    /* Original methods end */
    /**************************/

    /***************************/
    /* Interior methods statrt */
    /***************************/
    _initial (datas, isReload) {
      if (isReload) {
        this.initialStore = XEUtils.clone(datas, true)
      }
      this.datas = (datas || []).map(record => this._toData(this.datas.some(row => row.data === record) ? record : Object.assign(record, this._defineProp(record))))
      this.$nextTick(() => {
        this.datas.forEach(row => {
          if (row.data._checked) {
            this.$refs.refElTable.toggleRowSelection(row, true)
          }
        })
      })
    },
    _getData (datas) {
      return (datas || this.datas).map(item => item.data)
    },
    _defineProp (record) {
      let recordItem = Object.assign({}, record)
      this.getColumns().forEach(column => {
        if (column.property && !XEUtils.has(recordItem, column.property)) {
          XEUtils.set(recordItem, column.property, null)
        }
      })
      return recordItem
    },
    _toData (item, status) {
      return item && item._EDITABLE_PROTO === this.editProto ? item : {
        _EDITABLE_PROTO: this.editProto,
        data: item,
        store: XEUtils.clone(item, true),
        validActive: null,
        validRule: null,
        showValidMsg: false,
        checked: null,
        editActive: null,
        editStatus: status || 'initial',
        config: {
          size: this.size,
          showIcon: this.configs.showIcon,
          showStatus: this.configs.showStatus,
          mode: this.configs.mode,
          useDefaultValidTip: this.configs.useDefaultValidTip,
          validTooltip: this.configs.validTooltip,
          disabledValidTip: this.configs.disabledValidTip,
          rules: this.editRules
        }
      }
    },
    _updateData () {
      this.isUpdateData = true
      this.$emit('update:data', this.datas.map(item => item.data))
    },
    _bindEvents () {
      GlobalEvents.on(this, 'click', evnt => this._triggerClear(evnt))
      if (this.configs.trigger !== 'manual') {
        GlobalEvents.on(this, 'keydown', evnt => this._triggerKeydown(evnt))
      }
    },
    _unbindEvents () {
      GlobalEvents.off(this, 'click')
      GlobalEvents.off(this, 'keydown')
    },
    _getIndex (list, item) {
      return XEUtils.findIndexOf(list, obj => obj === item)
    },
    _getDataIndex (row) {
      return this._getIndex(this.datas, row)
    },
    _getDataIndexByRecord (record) {
      return XEUtils.findIndexOf(this.datas, item => item.data === record)
    },
    _getTDatas () {
      return this.$refs.refElTable ? this.$refs.refElTable.tableData : this.datas
    },
    _getTDataIndex (row) {
      return this._getIndex(this._getTDatas(), row)
    },
    _getTDataIndexByRecord (record) {
      return XEUtils.findIndexOf(this._getTDatas(), item => item.data === record)
    },
    _getColumnIndex (column) {
      return this._getIndex(this.getColumns(), column)
    },
    _getColumnIndexByProp (prop) {
      return this._getIndex(this.getColumns(), column => column.property === prop)
    },
    _rowClassName ({ row, rowIndex }) {
      let clsName = 'editable-row '
      let rowClassName = this.rowClassName
      if (this.configs.mode === 'row' && this._isDisabledEdit(row)) {
        clsName += 'editable-row_disabled '
      }
      if (row.editStatus === 'insert') {
        clsName += 'new-insert '
      }
      if (XEUtils.isFunction(rowClassName)) {
        clsName += rowClassName({ row: row.data, rowIndex }) || ''
      } else if (XEUtils.isString(rowClassName)) {
        clsName += `${rowClassName}`
      }
      return XEUtils.trimRight(clsName)
    },
    _rowStyle ({ row, rowIndex }) {
      return this.rowStyle({ row: row.data, rowIndex })
    },
    _cellClassName ({ row, column, rowIndex, columnIndex }) {
      let clsName = ''
      let cellClassName = this.cellClassName
      if (this.configs.mode === 'cell' && row.editActive && row.editActive === column.property) {
        clsName += 'editable-col_active '
      }
      if (this.configs.showStatus && !XEUtils.isEqual(XEUtils.get(row.data, column.property), XEUtils.get(row.store, column.property))) {
        clsName += 'editable-col_dirty '
      }
      if (row.checked && row.checked === column.property) {
        clsName = 'editable-col_checked '
      }
      if (row.validActive && row.validActive === column.property) {
        clsName += 'valid-error '
      }
      if (this.configs.mode === 'cell' && this._isDisabledEdit(row, column, columnIndex)) {
        clsName += 'editable-col_disabled '
      }
      if (XEUtils.isFunction(cellClassName)) {
        clsName += cellClassName({ row: row.data, column, rowIndex, columnIndex }) || ''
      } else if (XEUtils.isString(cellClassName)) {
        clsName += `${cellClassName}`
      }
      return XEUtils.trimRight(clsName)
    },
    _cellStyle ({ row, column, rowIndex, columnIndex }) {
      return this.cellStyle({ row: row.data, column, rowIndex, columnIndex })
    },
    _headerRowClassName ({ row, rowIndex }) {
      return this.headerRowClassName({ row: row.data, rowIndex })
    },
    _headerRowStyle ({ row, rowIndex }) {
      return this.headerRowStyle({ row: row.data, rowIndex })
    },
    _headerCellClassName ({ row, column, rowIndex, columnIndex }) {
      return this.headerCellClassName({ row: row.data, column, rowIndex, columnIndex })
    },
    _headerCellStyle ({ row, column, rowIndex, columnIndex }) {
      return this.headerCellStyle({ row: row.data, column, rowIndex, columnIndex })
    },
    _rowKey (row) {
      return this.rowKey(row.data)
    },
    _select (selection, row) {
      this.$emit('select', selection.map(item => item ? item.data : item), row.data)
    },
    _selectAll (selection) {
      this.$emit('select-all', selection.map(item => item ? item.data : item))
    },
    _selectionChange (selection) {
      this.$emit('selection-change', selection.map(item => item ? item.data : item))
    },
    _cellMouseEnter (row, column, cell, event) {
      this.$emit('cell-mouse-enter', row.data, column, cell, event)
    },
    _cellMouseLeave (row, column, cell, event) {
      this.$emit('cell-mouse-leave', row.data, column, cell, event)
    },
    _cellClick (row, column, cell, event) {
      this._cellHandleEvent('click', row, column, cell, event)
    },
    _cellDBLclick (row, column, cell, event) {
      this._cellHandleEvent('dblclick', row, column, cell, event)
    },
    _arrowLeftAndRightColumn (row, columns, offsetColumnIndex) {
      let offsetColumn = columns[offsetColumnIndex]
      if (offsetColumn && offsetColumn.property) {
        row.checked = offsetColumn.property
      }
    },
    _arrowUpAndDownColumn (list, row, column, offsetRowIndex) {
      let offsetRow = list[offsetRowIndex]
      if (offsetRow) {
        row.checked = null
        offsetRow.checked = column.property
      }
    },
    /**
     * 监听方向键和 Tab 键切换行和单元格
     */
    _triggerKeydown (evnt) {
      let keyCode = evnt.keyCode
      let isTab = keyCode === 9
      let tableData = this._getTDatas()
      if (isTab || (keyCode >= 37 && keyCode <= 40)) {
        if ((this.configs.isTabKey && isTab) || this.configs.isArrowKey) {
          let rowIndex = XEUtils.findIndexOf(tableData, isTab ? row => row.editActive || row.checked : row => row.checked)
          let row = tableData[rowIndex]
          if (row) {
            let columns = this.getColumns()
            let columnIndex = XEUtils.findIndexOf(columns, isTab ? column => column.property === row.editActive || column.property === row.checked : column => column.property === row.checked)
            let column = columns[columnIndex]
            if (column) {
              switch (keyCode) {
                case 9:
                  let offsetColumn = columns.find((column, index) => index > columnIndex && column.property)
                  // 从当前行中查找下一个可编辑列
                  // 如果找不到则从下一行开始找
                  if (offsetColumn && offsetColumn.property) {
                    if (this.configs.mode === 'cell' && row.editActive) {
                      let { cell } = this._getColumnByRowIndex(rowIndex, column.property)
                      this._validCellRules('blur', row, column)
                        .then(() => {
                          this._restoreTooltip()
                          this._clearActiveData()
                          row.editActive = null
                          row.checked = offsetColumn.property
                        }).catch(rule => this._toValidError(rule, row, column, cell))
                    } else {
                      row.checked = offsetColumn.property
                    }
                    evnt.preventDefault()
                  } else {
                    let offsetRow = tableData[rowIndex + 1]
                    if (offsetRow) {
                      columnIndex = XEUtils.findIndexOf(columns, column => column.property)
                      let offsetColumn = columns[columnIndex]
                      if (this.configs.mode === 'cell' && row.editActive) {
                        let { cell } = this._getColumnByRowIndex(rowIndex, column.property)
                        this._validCellRules('blur', row, column)
                          .then(() => {
                            row.editActive = null
                            row.checked = null
                            offsetRow.checked = offsetColumn.property
                            this._restoreTooltip()
                          }).catch(rule => this._toValidError(rule, row, column, cell))
                      } else {
                        row.checked = null
                        offsetRow.checked = offsetColumn.property
                      }
                      evnt.preventDefault()
                    }
                  }
                  break
                case 37:
                  if (columnIndex > 0) {
                    this._arrowLeftAndRightColumn(row, columns, columnIndex - 1)
                  }
                  break
                case 39:
                  if (columnIndex < columns.length - 1) {
                    this._arrowLeftAndRightColumn(row, columns, columnIndex + 1)
                  }
                  break
                case 38:
                  if (rowIndex > 0) {
                    this._arrowUpAndDownColumn(tableData, row, column, rowIndex - 1)
                  }
                  break
                case 40:
                  if (rowIndex < tableData.length - 1) {
                    this._arrowUpAndDownColumn(tableData, row, column, rowIndex + 1)
                  }
                  break
              }
            }
          }
        }
      } else if (this.configs.isCheckedEdit) {
        let rowIndex = XEUtils.findIndexOf(tableData, row => !row.editActive && row.checked)
        let row = tableData[rowIndex]
        if (row) {
          let columns = this.getColumns()
          let columnIndex = XEUtils.findIndexOf(columns, column => column.property === row.checked)
          let column = columns[columnIndex]
          if (column) {
            let { cell } = this._getColumnByRowIndex(rowIndex, column.property)
            this._triggerActive(row, column, cell, event)
              .then(() => XEUtils.set(row.data, column.property, null))
          }
        }
      }
    },
    /**
     * 如果点击了表格外会触发清除
     * 如果点击了表格内不同行或单元格会触发清除
     * 如果存在校验不通过，自动聚焦到错误单元格
     * type=in 如果是在当前表格内点击了其他 mode=row 行或 mode=cell 单元格
     * type=out 如果是点击当前表格之外
     */
    _triggerClear (evnt) {
      this._triggerClearChecked(evnt)
      if (this.configs.autoClearActive && this.lastActive && (this.callEvent ? this.callEvent.vT < Date.now() : true)) {
        let target = evnt.target
        let clearActiveMethod = this.configs.clearActiveMethod
        let { row, column, cell } = this.lastActive
        let rowIndex = this._getDataIndex(row)
        let trElem = cell.parentNode
        let isClearActive = true
        let type = null
        while (target && target.nodeType && target !== document) {
          if (this.configs.mode === 'row') {
            if (target === trElem) {
              return
            } else if (this._hasClass(target, 'editable-row')) {
              if (this._getIndex(Array.from(target.parentNode.children), target) === rowIndex) {
                return
              } else {
                type = 'in'
              }
            }
          } else {
            if (target === cell) {
              return
            } else if (this._hasClass(target, 'editable-column')) {
              type = 'in'
            }
          }
          if (type && this._hasClass(target, 'editable')) {
            if (target !== this.$el) {
              type = 'out'
            }
            break
          }
          target = target.parentNode
        }
        if (clearActiveMethod) {
          let param = {
            type: type || 'out',
            row: row.data,
            rowIndex
          }
          if (this.configs.mode === 'cell') {
            Object.assign(param, {
              column,
              columnIndex: this._getColumnIndex(column)
            })
          }
          isClearActive = clearActiveMethod(param)
        }
        if (isClearActive) {
          this._validActiveCell().then(() => {
            this._clearValidError(row)
            this._clearActiveData()
            this._restoreTooltip()
            if (this.configs.mode === 'row') {
              this.$emit('clear-active', row.data, evnt)
            } else {
              this.$emit('clear-active', row.data, column, cell, evnt)
            }
          }).catch(e => e)
        }
      }
      this.callEvent = null
    },
    /**
     * 触发编辑事件
     * 如果调用清除函数则不激活编辑
     * 如果是手动模式则不激活编辑
     * 如果是非渲染列则不激活编辑
     * 行模式和列模式，如果当前列已是激活状态不重复激活编辑
     * 激活编辑时先校验活动行或列的配置规则是否全部通过
     * 如果配置了规则且校验不通过，则停止激活新行，聚焦到校验错误行
     */
    _cellHandleEvent (type, row, column, cell, event) {
      if (this.configs.trigger !== 'manual' &&
        this._hasClass(cell, 'editable-col_edit') &&
        (row.editActive
          ? this.configs.mode === 'row' && this.lastActive
            ? this.lastActive.column.property !== column.property
            : (this.configs.mode === 'cell' && row.editActive !== column.property)
          : true
        )) {
        this._validActiveCell().then(() => {
          if (this.lastActive) {
            this._clearValidError(this.lastActive.row)
          }
          if (this.configs.trigger === type) {
            this._triggerActive(row, column, cell, event)
            if (this.configs.mode === 'row') {
              this._validRowRules('change', row)
                .catch(({ rule, row, column, cell }) => this._toValidError(rule, row, column, cell))
            } else {
              this._validCellRules('change', row, column)
                .catch(rule => this._toValidError(rule, row, column, cell))
            }
          } else {
            this.datas.forEach(item => {
              item.checked = item === row ? column.property : null
            })
          }
        }).catch(e => e).then(() => this.$emit(`cell-${type}`, row.data, column, cell, event))
      } else {
        this.$emit(`cell-${type}`, row.data, column, cell, event)
      }
    },
    _rowClick (row, column, event) {
      this.$emit('row-click', row.data, column, event)
    },
    _rowContextmenu (row, column, event) {
      this.$emit('row-contextmenu', row.data, column, event)
    },
    _rowDBLclick (row, column, event) {
      this.$emit('row-dblclick', row.data, column, event)
    },
    _headerClick (column, event) {
      this._clearChecked()
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
        this.$emit('current-change', currentRow.data, null)
      } else if (oldCurrentRow) {
        this.$emit('current-change', null, oldCurrentRow.data)
      }
    },
    _headerDragend (newWidth, oldWidth, column, event) {
      this.$emit('header-dragend', newWidth, oldWidth, column, event)
    },
    _expandChange (row, expandedRows) {
      this.$emit('expand-change', row.data, expandedRows)
    },
    _clearChecked () {
      this.datas.forEach(row => {
        row.checked = null
      })
    },
    _triggerClearChecked (evnt) {
      let target = evnt.target
      let isRow = false
      let isColumn = false
      let isHeader = false
      while (target && target.nodeType && target !== document) {
        if (!isRow && this._hasClass(target, 'editable-row')) {
          isRow = true
        }
        if (!isColumn && this._hasClass(target, 'editable-column')) {
          isColumn = true
        }
        if (!isHeader && this._hasClass(target, 'el-table__header-wrapper')) {
          isHeader = true
        }
        if (target === this.$el) {
          if (!isHeader && (isRow || isColumn)) {
            return
          }
        }
        target = target.parentNode
      }
      this._clearChecked()
    },
    _clearActiveData () {
      this.lastActive = null
      this.datas.forEach(item => {
        item.editActive = null
        item.showValidMsg = false
      })
    },
    _restoreTooltip (cell) {
      Array.from(this.$el.querySelectorAll('.disabled-el-tooltip')).forEach(elem => {
        this._removeClass(elem, ['disabled-el-tooltip'])
        this._addClass(elem, ['el-tooltip'])
      })
    },
    /**
     * 阻止带有 tooltip 组件的列
     * 如果行或列被激活编辑时，关闭 tooltip 提示并禁用
     */
    _disabledTooltip (cell) {
      let tElems = ['row', 'manual'].includes(this.configs.mode) ? cell.parentNode.querySelectorAll('td.editable-col_edit>.cell.el-tooltip') : cell.querySelectorAll('.cell.el-tooltip')
      if (this.$refs.refElTable) {
        let refElTableBody = this.$refs.refElTable.$children.find(comp => this._hasClass(comp.$el, 'el-table__body'))
        if (refElTableBody && refElTableBody.$refs.tooltip) {
          refElTableBody.$refs.tooltip.hide()
        }
      }
      Array.from(tElems).forEach(elem => {
        this._removeClass(elem, ['el-tooltip'])
        this._addClass(elem, ['disabled-el-tooltip'])
      })
    },
    _addClass (cell, clss) {
      let classList = cell.className.split(' ')
      clss.forEach(name => {
        if (classList.indexOf(name) === -1) {
          classList.push(name)
        }
      })
      cell.className = classList.join(' ')
    },
    _hasClass (cell, cls) {
      return cell.className.split(' ').includes(cls)
    },
    _removeClass (cell, clss) {
      let classList = []
      cell.className.split(' ').forEach(name => {
        if (clss.indexOf(name) === -1) {
          classList.push(name)
        }
      })
      cell.className = classList.join(' ')
    },
    /**
     * 设置单元格聚焦
     * 默认对文本款类的激活后自动聚焦
     * 如果是自定义渲染，也可以指定 class=editable-custom_input 使该单元格自动聚焦
     * 允许通过单元格渲染配置指定 autofocus 来打开或关闭自动聚焦
     */
    _setCellFocus (cell) {
      let inpElem = cell.querySelector('.el-input>input')
      if (!inpElem) {
        inpElem = cell.querySelector('.el-textarea>textarea')
        if (!inpElem) {
          inpElem = cell.querySelector('.editable-custom_input')
        }
      }
      if (inpElem && this._hasClass(cell, 'editable-col_autofocus')) {
        inpElem.focus()
      }
    },
    _scrollIntoView (cell) {
      if (this.configs.autoScrollIntoView && cell) {
        if (cell.scrollIntoViewIfNeeded) {
          cell.scrollIntoViewIfNeeded()
        } else if (cell.scrollIntoView) {
          cell.scrollIntoView()
        }
      }
    },
    _isRowDataChange (row, column) {
      // 如果是新插入的数据，返回 true
      if (row.editStatus === 'insert') {
        return true
      }
      if (column) {
        return !XEUtils.isEqual(XEUtils.get(row.data, column.property), XEUtils.get(row.store, column.property))
      }
      return !this.getColumns().every(column => XEUtils.isEqual(XEUtils.get(row.data, column.property), XEUtils.get(row.store, column.property)))
    },
    _isDisabledEdit (row, column, columnIndex) {
      let param = {
        row: row.data,
        rowIndex: this._getTDataIndex(row)
      }
      if (this.configs.mode === 'cell') {
        Object.assign(param, {
          column,
          columnIndex
        })
      }
      return this.configs.activeMethod ? !this.configs.activeMethod(param) : false
    },
    _triggerActive (row, column, cell, event) {
      let rest = { row, column, cell, event }
      return new Promise((resolve, reject) => {
        if (!this._isDisabledEdit(row, column)) {
          this._restoreTooltip(cell)
          this._disabledTooltip(cell)
          this._clearChecked()
          this._clearActiveData()
          this.lastActive = { row, column, cell }
          row.editActive = column.property
          this.$nextTick(() => {
            this._scrollIntoView(cell)
            this._setCellFocus(cell)
            if (row.editActive !== column.property) {
              this.$emit('edit-active', row.data, column, cell, event)
            }
            resolve(rest)
          })
        } else {
          this.$emit('edit-disabled', row.data, column, cell, event)
          resolve(rest)
        }
      })
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
            sums[index] = this.sumText || (this.$t ? this.$t('el.table.sumText') : '合计')
            return
          }
          sums[index] = data.some(item => isNaN(Number(item[column.property]))) ? '' : XEUtils.sum(data, column.property)
        })
      }
      return sums
    },
    _spanMethod ({ row, column, rowIndex, columnIndex }) {
      let rowspan = 1
      let colspan = 1
      let spanMethod = this.spanMethod
      if (XEUtils.isFunction(spanMethod)) {
        var result = spanMethod({ row: row.data, column, rowIndex, columnIndex })
        if (XEUtils.isArray(result)) {
          rowspan = result[0]
          colspan = result[1]
        } else if (XEUtils.isPlainObject(result)) {
          rowspan = result.rowspan
          colspan = result.colspan
        }
      }
      return { rowspan, colspan }
    },
    _validRowRules (type, row) {
      let validPromise = Promise.resolve()
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        let ruleKeys = Object.keys(editRules)
        let rowIndex = this._getTDataIndex(row)
        this._clearValidError(row)
        this.getColumns().forEach((column, columnIndex) => {
          if (ruleKeys.includes(column.property)) {
            validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
              this._validCellRules('all', row, column)
                .then(resolve)
                .catch(rule => {
                  let { cell } = this._getColumnByRowIndex(rowIndex, column.property)
                  let rest = { rule, row, column, cell }
                  return reject(rest)
                })
            }))
          }
        })
      }
      return validPromise
    },
    /**
     * 校验数据
     * 按表格行、列顺序依次校验（同步或异步）
     * 校验规则根据索引顺序依次校验，如果是异步则会等待校验完成才会继续校验下一列
     * 如果校验失败则，触发回调或者Promise，结果返回一个 Boolean 值
     * 如果是传回调方式这返回一个 Boolean 值和校验不通过列的错误消息
     *
     * 参数：required=Boolean 是否必填，min=Number 最小长度，max=Number 最大长度，validator=Function(rule, value, callback) 自定义校验，trigger=blur|change 触发方式
     */
    _validCellRules (type, row, column) {
      let property = column.property
      let validPromise = Promise.resolve()
      if (property && !XEUtils.isEmpty(this.editRules)) {
        let rules = this.editRules[property]
        let value = row.data[property]
        if (rules) {
          for (let rIndex = 0; rIndex < rules.length; rIndex++) {
            validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
              let rule = rules[rIndex]
              let isRequired = rule.required === true
              if ((type === 'all' || !rule.trigger || rule.trigger === 'change' || type === rule.trigger) && (isRequired || value)) {
                if (XEUtils.isFunction(rule.validator)) {
                  rule.validator(rule, value, e => {
                    if (XEUtils.isError(e)) {
                      let cusRule = { type: 'custom', message: e.message, rule }
                      return reject(cusRule)
                    }
                    return resolve(rule)
                  })
                } else {
                  let restVal
                  let isNumber = rule.type === 'number'
                  if (isNumber) {
                    restVal = XEUtils.toNumber(value)
                  } else {
                    restVal = '' + (value || '')
                  }
                  if (isRequired && !value) {
                    reject(rule)
                  } else if (value &&
                    ((isNumber && isNaN(value)) ||
                    (XEUtils.isRegExp(rule.pattern) && !rule.pattern.test(value)) ||
                    (XEUtils.isNumber(rule.min) && (isNumber ? restVal < rule.min : restVal.length < rule.min)) ||
                    (XEUtils.isNumber(rule.max) && (isNumber ? restVal > rule.max : restVal.length > rule.max)))
                  ) {
                    reject(rule)
                  } else {
                    resolve(rule)
                  }
                }
              } else {
                resolve(rule)
              }
            }))
          }
        }
      }
      return validPromise
    },
    _getColumnByRowIndex (rowIndex, property) {
      let tableData = this._getTDatas()
      let row = tableData[rowIndex]
      let columns = this.getColumns()
      let columnIndex = XEUtils.findIndexOf(columns, item => property ? property === item.property : item.property)
      let column = columns[columnIndex]
      if (column) {
        let trElemList = this.$el.querySelectorAll('.el-table__body-wrapper .editable-row')
        let trElem = trElemList[rowIndex]
        let cell = trElem.querySelector(`.${column.id}`)
        return { row, rowIndex, column, columnIndex, cell }
      }
      return { row, rowIndex }
    },
    _callTriggerEvent (type) {
      // 解决事件触发的同时调用了 active 和 validate 函数，导致重复执行 Clear
      // 如果通过函数式调用，超过一定时间后才允许触发 Clear 相关操作，不应该和事件叠加触发
      return { vT: Date.now() + 100 }
    },
    _toActiveRow (record, prop) {
      let rowIndex = this._getTDataIndexByRecord(record)
      let { row, column, cell } = this._getColumnByRowIndex(rowIndex, prop)
      if (row && column) {
        this.callEvent = this._callTriggerEvent('activate')
        this.datas.forEach(row => {
          if (row.data !== record) {
            this._clearValidError(row)
          }
        })
        this._validRowRules('all', row)
          .then(valid => this._triggerActive(row, column, cell, { type: 'edit' }))
          .catch(({ rule, row, column, cell }) => this._toValidError(rule, row, column, cell))
        return true
      }
      return false
    },
    _validActiveCell () {
      if (this.lastActive && !XEUtils.isEmpty(this.editRules)) {
        let { row, column, cell } = this.lastActive
        if (row && this.configs.mode === 'row') {
          return this._validRowRules(row.validActive ? 'all' : 'blur', row)
            .catch(({ rule, row, column, cell }) => {
              let rest = { rule, row, column, cell }
              this._toValidError(rule, row, column, cell)
              return Promise.reject(rest)
            })
        } else {
          return this._validCellRules(row.validActive ? 'all' : 'blur', row, column).catch(rule => {
            let rest = { rule, row, column, cell }
            this._toValidError(rule, row, column, cell)
            return Promise.reject(rest)
          })
        }
      }
      return Promise.resolve()
    },
    _clearValidError (row) {
      row.showValidMsg = false
      row.validRule = null
      row.validActive = null
    },
    _toValidError (rule, row, column, cell) {
      this._triggerActive(row, column, cell, { type: 'valid' }).then(() => {
        row.validRule = rule
        row.validActive = column.property
        row.showValidMsg = true
        if (!this.configs.useDefaultValidTip) {
          // 解决 ElTooltip 默认无法自动弹出问题
          row.showValidMsg = false
          this.$nextTick(() => {
            if (row.validActive) {
              row.showValidMsg = true
            }
          })
        }
        this.$emit('valid-error', rule, row, column, cell)
      })
    },
    _deleteData (index) {
      if (index > -1) {
        let items = this.datas.splice(index, 1)
        items.forEach(item => {
          if (item.editStatus === 'initial') {
            this.deleteRecords.push(item)
          }
        })
        return items
      }
      return []
    },
    _clearAllOpers () {
      this.clearSelection()
      this.clearFilter()
      this.clearSort()
    },
    _getCsvUrl (opts, content) {
      let browse = XEUtils.browse()
      if (window.Blob && window.URL && window.URL.createObjectURL && !browse.safari) {
        return URL.createObjectURL(new Blob([content], { type: 'text/csv' }))
      }
      return `data:attachment/csv;charset=utf-8,${encodeURIComponent(content)}`
    },
    _getCsvLabelData (opts, columns) {
      let trElemList = this.$el.querySelectorAll('.el-table__body-wrapper .editable-row')
      return this._getTDatas().map((row, rowIndex) => {
        let item = {}
        let trElem = trElemList[rowIndex]
        columns.forEach(column => {
          let cell = trElem.querySelector(`.${column.id}`)
          item[column.id] = cell.innerText.trim()
        })
        return item
      })
    },
    _getCsvContent (opts) {
      let isOriginal = opts.original
      let columns = opts.columns ? opts.columns : this.getColumns()
      if (opts.columnFilterMethod) {
        columns = columns.filter(opts.columnFilterMethod)
      }
      let datas = opts.data ? opts.data : (isOriginal ? this._getData(this._getTDatas()) : this._getCsvLabelData(opts, columns))
      if (opts.dataFilterMethod) {
        datas = datas.filter(opts.dataFilterMethod)
      }
      let content = '\ufeff'
      datas.forEach((record, rowIndex) => {
        if (isOriginal) {
          content += columns.map((column, columnIndex) => {
            if (column.type === 'index') {
              return column.index ? column.index(rowIndex) : rowIndex + 1
            }
            return XEUtils.get(record, column.property) || ''
          }).join(',') + '\n'
        } else {
          content += columns.map((column, columnIndex) => record[column.id]).join(',') + '\n'
        }
      })
      return content
    },
    _downloadCsc (opts, content) {
      let browse = XEUtils.browse()
      if (navigator.msSaveBlob && window.Blob) {
        navigator.msSaveBlob(new Blob([content], { type: 'text/csv' }), opts.filename)
      } else if (browse['-ms']) {
        var win = window.top.open('about:blank', '_blank')
        win.document.charset = 'utf-8'
        win.document.write(content)
        win.document.close()
        win.document.execCommand('SaveAs', opts.filename)
        win.close()
      } else {
        var linkElem = document.createElement('a')
        linkElem.target = '_blank'
        linkElem.download = opts.filename
        linkElem.href = this._getCsvUrl(opts, content)
        document.body.appendChild(linkElem)
        linkElem.click()
        document.body.removeChild(linkElem)
      }
    },
    /***************************/
    /* Interior methods end    */
    /***************************/

    /***************************/
    /* Public methods start    */
    /***************************/
    reload (datas) {
      this.deleteRecords = []
      this._clearAllOpers()
      this._clearChecked()
      this._clearActiveData()
      this._initial(datas, true)
      this._updateData()
    },
    reloadRow (record) {
      let row = this.datas.find(item => item.data === record)
      if (row) {
        XEUtils.destructuring(row.data, record)
        Object.assign(row, { store: XEUtils.clone(row.data, true) })
      }
    },
    /**
     * 还原更改，以最后一次 reload 或 reloadRow 的数据为源数据或者初始值 data
     * 还原指定行数据
     * 还原整个表格数据
     */
    revert (record) {
      if (record) {
        let { data, store } = this.datas.find(item => item.data === record)
        XEUtils.destructuring(data, XEUtils.clone(store, true))
      } else {
        this._clearAllOpers()
        this.reload(this.initialStore)
      }
    },
    /**
     * 清空表格
     */
    clear () {
      this.deleteRecords = []
      this._clearChecked()
      this._clearActiveData()
      this._initial([])
      this._updateData()
    },
    getColumns () {
      return this.$refs.refElTable ? this.$refs.refElTable.columns : []
    },
    /**
     * 插入数据
     * 如果是 record 或 rowIndex 则在指定位置新增一行新数据
     * 如果是 null 或 0 则插入到第一行
     * 如果是 -1 或 大于行索引 则使用 push 到表格最后
     */
    insertAt (newRecord, recordOrIndex) {
      let len = this.datas.length
      let recordItem = this._toData(this._defineProp(newRecord), 'insert')
      if (recordOrIndex) {
        if (!XEUtils.isNumber(recordOrIndex)) {
          recordOrIndex = XEUtils.findIndexOf(this.datas, item => item.data === recordOrIndex)
        }
        if (recordOrIndex === -1 || recordOrIndex >= len) {
          this.datas.push(recordItem)
        } else {
          this.datas.splice(recordOrIndex, 0, recordItem)
        }
      } else {
        this.datas.unshift(recordItem)
      }
      this._updateData()
      return recordItem.data
    },
    hasRowInsert (record) {
      let row = this.datas.find(item => item.data === record)
      return row && row.editStatus === 'insert'
    },
    /**
     * 根据索引删除行数据
     */
    removeByIndex (rowIndex) {
      let tableData = this._getTDatas()
      let row = tableData[rowIndex]
      if (row) {
        return this.remove(row.data)
      }
      return null
    },
    removeByIndexs (rowIndexs) {
      let tableData = this._getTDatas()
      return this.removes(rowIndexs.map(index => tableData[index] ? tableData[index].data : null))
    },
    remove (record) {
      let items = this._deleteData(this._getDataIndexByRecord(record))
      this._clearActiveData()
      this._updateData()
      return items.length ? items[0].data : null
    },
    removes (records) {
      let items = []
      XEUtils.lastEach(this.datas, (item, index) => {
        if (records.includes(item.data)) {
          items = items.concat(this._deleteData(index))
        }
      })
      this._clearActiveData()
      this._updateData()
      return items.map(item => item.data)
    },
    getSelecteds () {
      return this.$refs.refElTable ? this.$refs.refElTable.selection.map(item => item.data) : []
    },
    removeSelecteds () {
      this.removes(this.getSelecteds())
    },
    getRecords (rowIndex) {
      let list = this._getData()
      return arguments.length ? list[rowIndex] : list
    },
    getAllRecords () {
      return {
        records: this._getData(),
        selecteds: this.getSelecteds(),
        insertRecords: this.getInsertRecords(),
        removeRecords: this.getRemoveRecords(),
        updateRecords: this.getUpdateRecords()
      }
    },
    getInsertRecords () {
      return this._getData(this.datas.filter(item => item.editStatus === 'insert'))
    },
    getRemoveRecords () {
      return this._getData(this.deleteRecords)
    },
    getUpdateRecords () {
      return this._getData(this.datas.filter(item => item.editStatus === 'initial' && !XEUtils.isEqual(item.data, item.store)))
    },
    clearActive () {
      this.callEvent = this._callTriggerEvent('clear')
      this._clearChecked()
      this._clearActiveData()
      this._restoreTooltip()
    },
    /**
     * 激活指定某一行为可编辑状态
     */
    setActiveRow (record) {
      if (this.configs.mode === 'row') {
        return this._toActiveRow(record, null)
      }
      return false
    },
    /**
     * 激活指定某一行的单元格为可编辑状态
     * 如果不指定 prop 和 setActiveRow 一样效果
     */
    setActiveCell (record, prop) {
      return this._toActiveRow(record, prop)
    },
    hasActiveRow (record) {
      return this.lastActive ? this.lastActive.row.data === record : false
    },
    getActiveRow () {
      if (this.lastActive) {
        let { row, column } = this.lastActive
        let rowIndex = this._getTDataIndex(row)
        if (this.configs.mode === 'row') {
          return {
            row: row.data,
            rowIndex: rowIndex,
            isUpdate: this._isRowDataChange(row)
          }
        }
        return {
          row: row.data,
          rowIndex: rowIndex,
          column,
          columnIndex: this._getColumnIndex(column),
          isUpdate: this._isRowDataChange(row, column)
        }
      }
      return null
    },
    hasRowChange (record, property) {
      let row = this.datas.find(item => item.data === record)
      return property ? this._isRowDataChange(row, { property }) : this._isRowDataChange(row)
    },
    /**
     * 更新列状态
     * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一列编辑状态
     * 由于缓存策略，但行数据发生增加或删除时，需要更新所有行
     */
    updateStatus (scope) {
      if (scope) {
        this.$nextTick(() => {
          let { $index, column } = scope
          let { row, cell } = this._getColumnByRowIndex($index, column.property)
          if (cell) {
            return this._validCellRules(row.validActive ? 'all' : 'change', row, column)
              .then(rule => {
                if (this.configs.mode === 'row' ? row.validActive && row.validActive === column.property : true) {
                  this._clearValidError(row)
                }
              }).catch(rule => {
                this._toValidError(rule, row, column, cell)
              })
          }
        })
      }
    },
    checkValid () {
      let row = this.datas.find(item => item.validActive)
      if (row) {
        let column = this._getColumnIndexByProp(row.validActive)
        return {
          error: true,
          row: row.data,
          rowIndex: this._getTDataIndex(row),
          column,
          columnIndex: this._getColumnIndex(column),
          rule: row.validRule
        }
      }
      return {
        error: false
      }
    },
    /**
     * 对表格某一行进行校验的方法
     * 返回 Promise 对象，或者使用回调方式
     */
    validateRow (record, cb) {
      let rowIndex = this._getTDataIndexByRecord(record)
      this.callEvent = this._callTriggerEvent('valid')
      return new Promise((resolve, reject) => {
        let tableData = this._getTDatas()
        let row = tableData[rowIndex]
        this._validRowRules('all', row)
          .then(rest => {
            let valid = true
            if (cb) {
              cb(valid)
            }
            resolve(true)
          }).catch(({ rule, row, column, cell }) => {
            let valid = false
            this._toValidError(rule, row, column, cell)
            if (cb) {
              cb(valid, { [column.property]: [new Error(rule.message)] })
              resolve(valid)
            } else {
              reject(valid)
            }
          })
      })
    },
    /**
     * 对整个表格数据进行校验
     * 返回 Promise 对象，或者使用回调方式
     */
    validate (cb) {
      let validPromise = Promise.resolve(true)
      this.callEvent = this._callTriggerEvent('valid')
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        let tableData = this._getTDatas()
        let columns = this.getColumns()
        let ruleKeys = Object.keys(editRules)
        tableData.forEach((row, rowIndex) => {
          this._clearValidError(row)
          columns.forEach((column, columnIndex) => {
            if (ruleKeys.includes(column.property)) {
              validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
                this._validCellRules('all', row, column)
                  .then(resolve)
                  .catch(rule => {
                    let { cell } = this._getColumnByRowIndex(rowIndex, column.property)
                    let rest = { rule, row, column, cell }
                    return reject(rest)
                  })
              }))
            }
          })
        })
        return validPromise.then(() => {
          let valid = true
          if (cb) {
            cb(valid)
          }
          return true
        }).catch(({ rule, row, column, cell }) => {
          let valid = false
          this._toValidError(rule, row, column, cell)
          if (cb) {
            cb(valid, { [column.property]: [new Error(rule.message)] })
          }
          return cb ? Promise.resolve(valid) : Promise.reject(valid)
        })
      } else {
        let valid = true
        if (cb) {
          cb(valid)
        }
      }
      return validPromise
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
        columnFilterMethod: column => column.type === 'index' || (['selection', 'expand'].indexOf(column.type) === -1 && column.property),
        dataFilterMethod: null
      }, options)
      if (opts.filename.indexOf('.csv') === -1) {
        opts.filename += '.csv'
      }
      this._downloadCsc(opts, this._getCsvContent(opts))
    }
    /***************************/
    /* Public methods end      */
    /***************************/
  }
}
</script>

<style src="../../../style/editable.css"></style>
