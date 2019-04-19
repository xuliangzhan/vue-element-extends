<template>
  <el-table
    ref="refElTable"
    class="elx-editable"
    v-bind="attrs"
    v-on="events">
    <slot></slot>
    <template v-if="$slots.empty" v-slot:empty>
      <slot name="empty"></slot>
    </template>
    <template v-slot:append>
      <div v-if="isCtxMenu" ref="contextMenu" class="elx-contextmenu" v-show="ctxMenuStore.visible" :style="ctxMenuStore.style">
        <div class="ctx-menu_wrapper" v-for="(options, index) in ctxMenuStore.list" :key="index">
          <template v-for="item in options">
            <a v-if="item.visible !== false" class="ctx-menu_link" :key="item.code" :class="[item.code, {disabled: item.disabled, 'active': item === ctxMenuStore.selected}]" @click="_ctxMenuEvent(item, $event)" @mouseover="_ctxMenuMouseoverEvent(item, $event)" @mouseout="_ctxMenuMouseoutEvent(item, $event)">
              <i v-if="item.prefixIcon" class="ctx-prefix-icon" :class="item.prefixIcon"></i>
              <span>{{ item.name }}</span>
              <i v-if="item.suffixIcon" class="ctx-suffix-icon" :class="item.suffixIcon"></i>
            </a>
          </template>
        </div>
      </div>
      <template v-if="$slots.append">
        <slot name="append"></slot>
      </template>
    </template>
  </el-table>
</template>

<script>
import XEUtils from 'xe-utils'
import GlobalEvent from './event.js'
import UtilHandle from './util'
import ScrollHandle from '../../editable/src/scroll'
import DefineHandle from '../../editable/src/define'

export default {
  name: 'ElxEditable',
  props: {
    editConfig: Object,
    editRules: Object,
    contextMenuConfig: Object,
    customColumns: Array,
    ...DefineHandle.tableProps
  },
  provide () {
    return {
      $editable: this,
      elxConfig: this.configs,
      elxRules: this.editRules
    }
  },
  data () {
    return {
      editProto: {},
      datas: [],
      selection: [],
      initialStore: [],
      deleteRecords: [],
      lastActive: null,
      lastOperation: null,
      callEvent: null,
      currentRow: null,
      elTreeOpts: {
        children: 'children'
      },
      ctxMenuStore: {
        selected: null,
        visible: false,
        list: [],
        style: {
          top: 0,
          left: 0
        }
      },
      columnList: [],
      visibleIndex: 0,
      visibleStart: 0
    }
  },
  computed: {
    attrs () {
      return {
        class: [`editable_${this.configs.trigger}`, { 'editable_icon': this.configs.showIcon }],
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
        lazy: this.lazy,
        indent: this.indent,
        rowClassName: this._rowClassName,
        rowStyle: XEUtils.isFunction(this.rowStyle) ? this._rowStyle : this.rowStyle,
        cellClassName: this._cellClassName,
        cellStyle: XEUtils.isFunction(this.cellStyle) ? this._cellStyle : this.cellStyle,
        headerRowClassName: XEUtils.isFunction(this.headerRowClassName) ? this._headerRowClassName : this.headerRowClassName,
        headerRowStyle: XEUtils.isFunction(this.headerRowStyle) ? this._headerRowStyle : this.headerRowStyle,
        headerCellClassName: this._headerCellClassName,
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
        spanMethod: this._spanMethod,
        load: this._load
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
      // 限制 Tooltip 固定参数不允许修改
      let validTooltip = Object.assign({
        disabled: false,
        offset: 10,
        placement: 'bottom-start'
      }, tipConf, {
        manual: true,
        popperClass: ['elx-valid_tooltip'].concat(tipConf.popperClass ? tipConf.popperClass.split(' ') : []).join(' ')
      })
      let conf = Object.assign({
        // 触发方式
        trigger: 'click',
        // 编辑模式
        mode: 'cell',
        // 渲染方式，可以设置为 scroll 启用滚动渲染，支持海量数据
        render: 'default',
        // 只对 render=scroll 有效，自定义滚动实时渲染条数，不应该低于可视区域数量的两倍（高级参数）
        renderSize: 0,
        // 只对 render=scroll 有效，自定义滚动实时渲染阈值，不应该低于可视区域的数量（高级参数）
        offsetSize: 0,
        // 是否显示列头编辑图标
        showIcon: true,
        // 是否实时显示单元格值的修改状态
        showStatus: true,
        // 配置项
        props: this.elTreeOpts,
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
        // 只对 isTabKey=true 有效，是否启用 Tab 键切换后直接激活为编辑状态
        tabToActive: false,
        // 是否启用箭头键切换行和单元格
        isArrowKey: false,
        // 是否启用选中状态是否允许值覆盖式编辑，当 isTabKey 或 isArrowKey 为true 时启用时默认 true，否则 false
        isCheckedEdit: !!(editConfig.isTabKey || editConfig.isArrowKey)
      }, editConfig, { validTooltip })
      return conf
    },
    scrollLoad () {
      return this.configs.render === 'scroll'
    },
    isCtxMenu () {
      return this.ctxMenuConfig.bodyMenus || this.ctxMenuConfig.headerMenus
    },
    ctxMenuConfig () {
      return Object.assign({}, this.contextMenuConfig)
    },
    ctxMenuList () {
      let rest = []
      this.ctxMenuStore.list.forEach(list => {
        list.forEach(item => {
          rest.push(item)
        })
      })
      return rest
    }
  },
  watch: {
    data (value) {
      if (!this.isUpdateData) {
        this.reload(value)
      } else {
        this.isUpdateData = false
      }
    },
    customColumns (value) {
      if (!this.isUpdateColumns) {
        this._handleColumns()
      } else {
        this.isUpdateColumns = false
      }
    },
    selection (value) {
      this.$emit('selection-change', this._getData(value))
    }
  },
  created () {
    this._bindEvents()
    if (this.scrollLoad) {
      this._bindScrollEvent().then(() => this._reloadScrollData())
    }
    this._initial(this.data, true)
    this._setDefaultChecked()
    this._handleColumns()
    this._updateData()
  },
  mounted () {
    if (this.isCtxMenu && this.$refs.contextMenu) {
      this.ctxMenuStore.el = this.$refs.contextMenu
      document.body.appendChild(this.ctxMenuStore.el)
    }
  },
  destroyed () {
    let ctxMenuStore = this.ctxMenuStore
    if (ctxMenuStore.el && ctxMenuStore.el.parentNode) {
      ctxMenuStore.el.parentNode.removeChild(ctxMenuStore.el)
      ctxMenuStore.el = null
    }
    this._unbindEvents()
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
      let matchObj = XEUtils.findTree(this.datas, row => row.data === record, this.elTreeOpts)
      return this.$refs.refElTable.toggleRowSelection(matchObj.item, selected)
    },
    toggleAllSelection () {
      return this.$refs.refElTable.toggleAllSelection()
    },
    toggleRowExpansion (record, expanded) {
      let matchObj = XEUtils.findTree(this.datas, row => row.data === record, this.elTreeOpts)
      return this.$refs.refElTable.toggleRowExpansion(matchObj.item, expanded)
    },
    setCurrentRow (record) {
      let matchObj = XEUtils.findTree(this.datas, row => row.data === record, this.elTreeOpts)
      return this.$refs.refElTable.setCurrentRow(matchObj.item)
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

    /******************************/
    /* Original Attribute statrt  */
    /******************************/
    _rowClassName ({ row, rowIndex }) {
      let clsName = 'elx-editable-row '
      let rowClassName = this.rowClassName
      if (this.configs.mode === 'row' && this._isDisabledEdit(row)) {
        clsName += 'elx_disabled '
      }
      if (row.editStatus === 'insert') {
        clsName += 'new-insert '
      }
      if (row.checked) {
        clsName += 'elx_checked '
      }
      if (row.editActive) {
        clsName += 'elx_active '
      }
      if (XEUtils.isFunction(rowClassName)) {
        clsName += rowClassName({ row: row.data, rowIndex }) || ''
      } else if (XEUtils.isString(rowClassName)) {
        clsName += `${rowClassName}`
      }
      return clsName
    },
    _rowStyle ({ row, rowIndex }) {
      return this.rowStyle({ row: row.data, rowIndex })
    },
    _cellClassName ({ row, column, rowIndex, columnIndex }) {
      let clsName = ''
      let cellClassName = this.cellClassName
      if (this.configs.mode === 'cell' && row.editActive && row.editActive === column.property) {
        clsName += 'elx_active editable-col_active '
      }
      if (this.configs.showStatus && row.editStatus === 'initial' && !XEUtils.isEqual(XEUtils.get(row.data, column.property), XEUtils.get(row.store, column.property))) {
        clsName += 'elx_dirty '
      }
      if (row.checked && row.checked === column.property) {
        clsName = 'elx_checked editable-col_checked '
      }
      if (row.validActive && row.validActive === column.property) {
        clsName += 'valid-error '
      }
      if (this.configs.mode === 'cell' && this._isDisabledEdit(row, column, columnIndex)) {
        clsName += 'elx_disabled '
      }
      if (XEUtils.isFunction(cellClassName)) {
        clsName += cellClassName({ row: row.data, column, rowIndex, columnIndex }) || ''
      } else if (XEUtils.isString(cellClassName)) {
        clsName += `${cellClassName}`
      }
      return clsName
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
      let clsName = ''
      let headerCellClassName = this.headerCellClassName
      let matchObj = XEUtils.findTree(this.datas, row => row.checked || row.editActive, this.elTreeOpts)
      if (matchObj) {
        if (matchObj.item.checked === column.property) {
          clsName += 'elx-header_checked '
        } else if (matchObj.item.editActive === column.property) {
          clsName += 'elx-header_active '
        }
      }
      if (XEUtils.isFunction(headerCellClassName)) {
        clsName += headerCellClassName({ row: row.data, column, rowIndex, columnIndex }) || ''
      } else if (XEUtils.isString(headerCellClassName)) {
        clsName += `${headerCellClassName}`
      }
      return clsName
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
      this._clearAllChecked()
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
      if (this.spanMethod) {
        var result = this.spanMethod({ row: row.data, column, rowIndex, columnIndex })
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
    _load (row, treeNode, resolve) {
      if (this.load) {
        this.load(row.data, treeNode, rest => {
          let nodeList = this._toDatas(rest)
          row.children = nodeList
          resolve(nodeList)
        })
      }
    },
    /******************************/
    /* Original Attribute end     */
    /******************************/

    /****************************/
    /* Interior methods statrt  */
    /****************************/
    _initial (data, isReload) {
      if (isReload) {
        this.initialStore = XEUtils.clone(data, true)
      }
      let datas = this._toDatas(data)
      this._fullData = datas
      if (this.scrollLoad) {
        this._reloadScrollData()
      } else {
        this.datas = datas
      }
      this.$nextTick(() => {
        if (this.highlightCurrentRow) {
          let matchObj = this.currentRow ? XEUtils.findTree(this.datas, row => row.data === this.currentRow, this.elTreeOpts) : null
          this.$refs.refElTable.setCurrentRow(matchObj ? matchObj.item : null)
        }
      })
    },
    _getData (datas) {
      return XEUtils.mapTree(datas || this.datas, row => row.data, {
        children: this.elTreeOpts.children,
        mapChildren: this.configs.props.children
      })
    },
    _toDatas (datas, status) {
      return XEUtils.mapTree(datas, item => this._toData(item, status), {
        children: this.configs.props.children,
        mapChildren: this.elTreeOpts.children
      })
    },
    _toData (item, status) {
      if (item && item._EDITABLE_PROTO === this.editProto) {
        return Object.assign({}, item)
      }
      let data = this._defineProp(item)
      let rest = {
        _EDITABLE_PROTO: this.editProto,
        // 数据
        data: data,
        // 数据源
        store: XEUtils.clone(data, true),
        // 当前触发的校验的字段
        validActive: null,
        // 当前触发的校验规则
        validRule: null,
        // 显示校验提示
        showValidMsg: false,
        // 是否选中状态
        checked: null,
        // 只对滚动渲染有效，是否选中
        scrollChecked: false,
        // 激活编辑的字段
        editActive: null,
        // 编辑状态
        editStatus: status || 'initial'
      }
      if (data.hasChildren) {
        rest.hasChildren = data.hasChildren
      }
      return rest
    },
    _updateData () {
      let data = this._getData()
      this.isUpdateData = true
      this.$emit('update:data', data)
    },
    _updateSelection (selection) {
      this.selection = selection
    },
    _bindEvents () {
      GlobalEvent.on(this, 'click', evnt => this._triggerClear(evnt))
      if (this.isCtxMenu || this.configs.trigger !== 'manual') {
        GlobalEvent.on(this, 'keydown', evnt => this._triggerKeydown(evnt))
      }
      if (this.isCtxMenu) {
        GlobalEvent.on(this, 'mousewheel', evnt => this._triggerMousewheel(evnt))
        GlobalEvent.on(this, 'contextmenu', evnt => this._triggerContextMenu(evnt))
      }
    },
    _unbindEvents () {
      GlobalEvent.off(this, 'click')
      GlobalEvent.off(this, 'contextmenu')
      GlobalEvent.off(this, 'mousewheel')
      GlobalEvent.off(this, 'keydown')
    },
    // 定义列属性
    _defineProp (record) {
      let recordItem = Object.assign({}, record)
      this.getColumns().forEach(column => {
        if (column.property && !XEUtils.has(recordItem, column.property)) {
          XEUtils.set(recordItem, column.property, null)
        }
      })
      return recordItem
    },
    // 获取表格真实列表
    _getTDatas () {
      return this.lazy ? XEUtils.toTreeArray(this.datas, this.configs.props) : (this.$refs.refElTable ? this.$refs.refElTable.tableData : this.datas)
    },
    // 获取 row 在表格中的索引
    _getRowIndex (row) {
      return XEUtils.findIndexOf(this._getTDatas(), item => item === row)
    },
    // 获取列的索引
    _getColumnIndex (column) {
      return XEUtils.findIndexOf(this.getColumns(), item => item === column)
    },
    // 获取选中
    _getSelectRows () {
      return this.scrollLoad ? this.selection : (this.$refs.refElTable ? this.$refs.refElTable.selection : [])
    },
    // 设置默认勾选
    _setDefaultChecked () {
      this.$nextTick(() => {
        XEUtils.eachTree(this.datas, row => {
          if (row.data._checked) {
            this.$refs.refElTable.toggleRowSelection(row, true)
          }
        }, this.elTreeOpts)
      })
    },
    // 方向键左右移动
    _moveLeftAndRight (row, columns, offsetColumnIndex) {
      let offsetColumn = columns[offsetColumnIndex]
      if (offsetColumn && offsetColumn.property) {
        row.checked = offsetColumn.property
      }
    },
    // 方向键上下移动
    _moveUpAndDown (list, row, column, offsetRowIndex) {
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
      let ctxMenuStore = this.ctxMenuStore
      if (ctxMenuStore.visible && [13, 32, 37, 38, 39, 40].includes(keyCode)) {
        // 如果配置了右键菜单并使用上下箭头移动
        evnt.preventDefault()
        evnt.stopPropagation()
        if (![37, 39].includes(keyCode)) {
          let ctxMenuList = this.ctxMenuList
          let selectIndex = XEUtils.findIndexOf(ctxMenuList, item => ctxMenuStore.selected === item)
          if (keyCode === 38) {
            ctxMenuStore.selected = ctxMenuList[selectIndex - 1] || ctxMenuList[ctxMenuList.length - 1]
          } else if (keyCode === 40) {
            ctxMenuStore.selected = ctxMenuList[selectIndex + 1] || ctxMenuList[0]
          } else if (ctxMenuStore.selected) {
            this._ctxMenuEvent(ctxMenuStore.selected, evnt)
          }
        }
        return
      } else if (isTab || (keyCode >= 37 && keyCode <= 40)) {
        // 方向键、Tab 键处理
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
                      let { cell } = this._getColumnByRowIndex(row.data, column.property)
                      this._validCellRules('blur', row, column)
                        .then(() => {
                          this._restoreTooltip()
                          this._clearActiveData()
                          this._tabActiveCell(row, offsetColumn)
                        }).catch(rule => this._toValidError(rule, row, column, cell))
                    } else {
                      this._tabActiveCell(row, offsetColumn)
                    }
                    evnt.preventDefault()
                  } else {
                    let offsetRow = tableData[rowIndex + 1]
                    if (offsetRow) {
                      columnIndex = XEUtils.findIndexOf(columns, column => column.property)
                      let offsetColumn = columns[columnIndex]
                      if (this.configs.mode === 'cell' && row.editActive) {
                        let { cell } = this._getColumnByRowIndex(row.data, column.property)
                        this._validCellRules('blur', row, column)
                          .then(() => {
                            row.editActive = null
                            row.checked = null
                            this._tabActiveCell(offsetRow, offsetColumn)
                            this._restoreTooltip()
                          }).catch(rule => this._toValidError(rule, row, column, cell))
                      } else {
                        row.checked = null
                        this._tabActiveCell(offsetRow, offsetColumn)
                      }
                      evnt.preventDefault()
                    }
                  }
                  break
                case 37:
                  if (columnIndex > 0) {
                    this._moveLeftAndRight(row, columns, columnIndex - 1)
                  }
                  break
                case 39:
                  if (columnIndex < columns.length - 1) {
                    this._moveLeftAndRight(row, columns, columnIndex + 1)
                  }
                  break
                case 38:
                  if (rowIndex > 0) {
                    this._moveUpAndDown(tableData, row, column, rowIndex - 1)
                  }
                  break
                case 40:
                  if (rowIndex < tableData.length - 1) {
                    this._moveUpAndDown(tableData, row, column, rowIndex + 1)
                  }
                  break
              }
            }
          }
        }
      } else if (this.configs.isCheckedEdit) {
        // 如果是选中状态，按任意键进入编辑
        let rowIndex = XEUtils.findIndexOf(tableData, row => !row.editActive && row.checked)
        let row = tableData[rowIndex]
        if (row) {
          let columns = this.getColumns()
          let columnIndex = XEUtils.findIndexOf(columns, column => column.property === row.checked)
          let column = columns[columnIndex]
          if (column) {
            let { cell } = this._getColumnByRowIndex(row.data, column.property)
            this._triggerActive(row, column, cell, event)
              .then(() => {
                if (this.configs.checkedEditMethod ? this.configs.checkedEditMethod({ row: row.data, rowIndex, column, columnIndex, cell }, evnt) !== false : true) {
                  XEUtils.set(row.data, column.property, null)
                }
              })
          }
        }
      }
      this.closeContextMenu()
    },
    _tabActiveCell (offsetRow, offsetColumn) {
      if (this.configs.tabToActive) {
        let { cell } = this._getColumnByRowIndex(offsetRow.data, offsetColumn.property)
        this._triggerActive(offsetRow, offsetColumn, cell, { type: 'edit', trigger: 'call' })
      } else {
        offsetRow.editActive = null
        offsetRow.checked = offsetColumn.property
      }
    },
    /**
     * 显示右键菜单
     */
    _showContextMenu (isHeader, params, evnt) {
      let ctxMenuStore = this.ctxMenuStore
      let menus = this.ctxMenuConfig[isHeader ? 'headerMenus' : 'bodyMenus']
      let visibleMethod = this.ctxMenuConfig[isHeader ? 'headerVisibleMethod' : 'bodyVisibleMethod']
      let disabled = this.ctxMenuConfig[isHeader ? 'disabledHeader' : 'disabledBody']
      if (disabled) {
        evnt.preventDefault()
      } else if (menus && menus.length) {
        if (!visibleMethod || visibleMethod(params, evnt)) {
          evnt.preventDefault()
          let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
          let scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
          let top = evnt.clientY + scrollTop
          let left = evnt.clientX + scrollLeft
          ctxMenuStore.visible = true
          ctxMenuStore.list = menus
          ctxMenuStore.style.top = `${top}px`
          ctxMenuStore.style.left = `${left}px`
          ctxMenuStore.info = params
          this.$nextTick(() => {
            let viewHeight = document.documentElement.clientHeight || document.body.clientHeight
            let viewWidth = document.documentElement.clientWidth || document.body.clientWidth
            let clientHeight = this.$refs.contextMenu.clientHeight
            let clientWidth = this.$refs.contextMenu.clientWidth
            let offsetTop = evnt.clientY + clientHeight - viewHeight
            let offsetLeft = evnt.clientX + clientWidth - viewWidth
            if (offsetTop > -10) {
              ctxMenuStore.style.top = `${top - clientHeight}px`
            }
            if (offsetLeft > -10) {
              ctxMenuStore.style.left = `${left - clientWidth}px`
            }
          })
        } else {
          this.closeContextMenu()
        }
      }
    },
    /**
     * 鼠标右键菜单
     */
    _triggerContextMenu (evnt) {
      let showMenu, cellElem, headerElem, bodyElem
      let target = evnt.target
      while (target && target.nodeType && target !== document) {
        if (UtilHandle.hasClass(target, 'elx-contextmenu')) {
          evnt.preventDefault()
          return
        } else if (UtilHandle.hasClass(target, 'el-table__header')) {
          headerElem = target
        } else if (UtilHandle.hasClass(target, 'el-table__body')) {
          bodyElem = target
        } else if (UtilHandle.hasClass(target, 'elx-editable-column')) {
          cellElem = target
        } else if (UtilHandle.hasClass(target, 'elx-editable')) {
          if ((headerElem || bodyElem) && cellElem && target === this.$el) {
            showMenu = true
          }
          break
        }
        target = target.parentNode
      }
      this._triggerClear(evnt)
      if (showMenu) {
        let rowElem = cellElem.parentNode
        let columnIndex = XEUtils.findIndexOf(Array.from(rowElem.children), tdElem => tdElem === cellElem)
        let column = this.getColumns()[columnIndex]
        if (headerElem) {
          this._showContextMenu(1, { column, columnIndex, cell: cellElem }, evnt)
        } else {
          let tableData = this._getTDatas()
          let rowIndex = XEUtils.findIndexOf(Array.from(bodyElem.querySelector('tbody').children), trElem => trElem === rowElem)
          let row = tableData[rowIndex]
          if (row.editActive !== column.property) {
            this._showContextMenu(0, { row, rowIndex, column, columnIndex, cell: cellElem }, evnt)
            this._setChecked(row, column)
          }
        }
      } else {
        this.closeContextMenu()
      }
    },
    /**
     * 鼠标滚轮处理
     */
    _triggerMousewheel (evnt) {
      this.closeContextMenu()
    },
    /**
     * 事件顺序 clearActiveMethod -> clear -> blur
     * 如果点击了表格外会触发清除
     * 如果点击了表格内不同行或单元格会触发清除
     * 如果存在校验不通过，自动聚焦到错误单元格
     * type=in 如果是在当前表格内点击了其他 mode=row 行或 mode=cell 单元格
     * type=out 如果是点击当前表格之外
     */
    _triggerClear (evnt) {
      let target = evnt.target
      while (target && target.nodeType && target !== document) {
        if (UtilHandle.hasClass(target, 'elx-contextmenu')) {
          evnt.preventDefault()
          return
        }
        target = target.parentNode
      }
      this._triggerClearChecked(evnt)
      if (this.configs.autoClearActive && this.lastActive && (this.callEvent ? this.callEvent.vT < Date.now() : true)) {
        let clearActiveMethod = this.configs.clearActiveMethod
        let { row, column, cell } = this.lastActive
        let rowIndex = this._getRowIndex(row)
        let type = 'out'
        let isClearActive = true
        let trElem, cellElem
        target = evnt.target
        while (target && target.nodeType && target !== document) {
          if (UtilHandle.hasClass(target, 'elx-editable-row')) {
            trElem = target
          } else if (UtilHandle.hasClass(target, 'elx-editable-column')) {
            cellElem = target
          } else if (UtilHandle.hasClass(target, 'elx-editable')) {
            // 如果是同表格
            if (trElem && cellElem && target === this.$el) {
              if (this.configs.mode === 'row') {
                // 并且是同一行
                if (XEUtils.findIndexOf(Array.from(trElem.parentNode.children), item => item === trElem) === rowIndex) {
                  return
                }
              } else {
                // 并且是同一单元格
                if (cellElem === cell) {
                  return
                }
              }
              type = 'in'
            }
            break
          }
          target = target.parentNode
        }
        if (clearActiveMethod) {
          let param = {
            type: type,
            row: row.data,
            rowIndex
          }
          if (this.configs.mode === 'cell') {
            Object.assign(param, {
              column,
              columnIndex: this._getColumnIndex(column)
            })
          }
          isClearActive = clearActiveMethod(param, evnt)
        }
        if (isClearActive) {
          this._validActiveCell().then(() => {
            this._clearValidError(row)
            this._clearActiveData()
            this._restoreTooltip()
            if (this.configs.mode === 'row') {
              this.$emit('clear-active', row.data, evnt)
              this.$emit('blur-active', row.data, evnt)
            } else {
              this.$emit('clear-active', row.data, column, cell, evnt)
              this.$emit('blur-active', row.data, column, cell, evnt)
            }
          }).catch(e => e)
        } else {
          if (this.configs.mode === 'row') {
            this.$emit('blur-active', row.data, evnt)
          } else {
            this.$emit('blur-active', row.data, column, cell, evnt)
          }
        }
      }
      this.callEvent = null
      this.closeContextMenu()
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
      // 触发顺序 -> clear -> active
      setTimeout(() => {
        if (this.configs.trigger !== 'manual' &&
        UtilHandle.hasClass(cell, 'elx_edit') &&
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
              this._setChecked(row, column)
            }
          }).catch(e => e).then(() => this.$emit(`cell-${type}`, row.data, column, cell, event))
        } else {
          this.$emit(`cell-${type}`, row.data, column, cell, event)
        }
      })
    },
    _triggerClearChecked (evnt) {
      let target = evnt.target
      let isRow = false
      let isColumn = false
      let isHeader = false
      while (target && target.nodeType && target !== document) {
        if (!isRow && UtilHandle.hasClass(target, 'elx-editable-row')) {
          isRow = true
        } else if (!isColumn && UtilHandle.hasClass(target, 'elx-editable-column')) {
          isColumn = true
        } else if (!isHeader && UtilHandle.hasClass(target, 'el-table__header-wrapper')) {
          isHeader = true
        } else if (target === this.$el) {
          if (!isHeader && (isRow || isColumn)) {
            return
          }
        }
        target = target.parentNode
      }
      this._clearAllChecked()
    },
    // 清除校验
    _clearValidError (row) {
      row.showValidMsg = false
      row.validRule = null
      row.validActive = null
    },
    // 清除操作
    _clearAllOpers () {
      this.clearSelection()
      this.clearFilter()
      this.clearSort()
    },
    // 清除活动
    _clearActiveData () {
      this.lastActive = null
      XEUtils.eachTree(this.datas, row => {
        row.editActive = null
        row.showValidMsg = false
      }, this.elTreeOpts)
    },
    _setChecked (row, column) {
      this.datas.forEach(item => {
        item.checked = item === row ? column.property : null
      })
    },
    // 清除选中
    _clearAllChecked () {
      XEUtils.eachTree(this.datas, row => {
        row.checked = null
      }, this.elTreeOpts)
    },
    // 还原列 Tooltip
    _restoreTooltip (cell) {
      Array.from(this.$el.querySelectorAll('.disabled-el-tooltip')).forEach(elem => {
        UtilHandle.removeClass(elem, ['disabled-el-tooltip'])
        UtilHandle.addClass(elem, ['el-tooltip'])
      })
    },
    /**
     * 滚动渲染情况下
     * 当进行 remove 操作时，更新多选框状态
     */
    _clearScrollChecked () {
      if (this.$refs.refElTable) {
        this.$refs.refElTable.$children.forEach(comp => {
          if (comp && comp.handleCheckRow) {
            comp.handleCheckRow()
          }
        })
      }
    },
    /**
     * 禁用列 Tooltip
     * 如果行或列被激活编辑时，关闭 tooltip 提示并禁用
     */
    _disabledTooltip (cell) {
      let tElems = ['row', 'manual'].includes(this.configs.mode) ? cell.parentNode.querySelectorAll('td.elx_edit>.cell.el-tooltip') : cell.querySelectorAll('.cell.el-tooltip')
      if (this.$refs.refElTable) {
        let refElTableBody = this.$refs.refElTable.$children.find(comp => UtilHandle.hasClass(comp.$el, 'el-table__body'))
        if (refElTableBody && refElTableBody.$refs.tooltip) {
          refElTableBody.$refs.tooltip.hide()
        }
      }
      Array.from(tElems).forEach(elem => {
        UtilHandle.removeClass(elem, ['el-tooltip'])
        UtilHandle.addClass(elem, ['disabled-el-tooltip'])
      })
    },
    /**
     * 设置单元格聚焦
     * 默认对文本款类的激活后自动聚焦
     * 如果是自定义渲染，也可以指定 class=elx-custom_input 使该单元格自动聚焦
     * 允许通过单元格渲染配置指定 autofocus 来打开或关闭自动聚焦
     */
    _setCellFocus (cell) {
      let inpElem = cell.querySelector('.el-input>input')
      if (!inpElem) {
        inpElem = cell.querySelector('.el-textarea>textarea')
        if (!inpElem) {
          inpElem = cell.querySelector('.elx-custom_input')
          if (!inpElem) {
            inpElem = cell.querySelector('.editable-custom_input')
          }
        }
      }
      if (inpElem && UtilHandle.hasClass(cell, 'elx_autofocus')) {
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
        rowIndex: this._getRowIndex(row)
      }
      if (this.configs.mode === 'cell') {
        Object.assign(param, {
          column,
          columnIndex
        })
      }
      return this.configs.activeMethod ? !this.configs.activeMethod(param) : false
    },
    _triggerActive (row, column, cell, evnt) {
      let rest = { row, column, cell, evnt }
      return new Promise((resolve, reject) => {
        if (!this._isDisabledEdit(row, column)) {
          this._restoreTooltip(cell)
          this._disabledTooltip(cell)
          this._clearAllChecked()
          this._clearActiveData()
          this.lastActive = { row, column, cell }
          row.editActive = column.property
          this.$nextTick(() => {
            this._scrollIntoView(cell)
            this._setCellFocus(cell)
            if (this.configs.mode === 'row') {
              this.$emit('edit-active', row.data, evnt)
            } else {
              this.$emit('edit-active', row.data, column, cell, evnt)
            }
            resolve(rest)
          })
        } else {
          if (this.configs.mode === 'row') {
            this.$emit('edit-disabled', row.data, evnt)
          } else {
            this.$emit('edit-disabled', row.data, column, cell, evnt)
          }
          resolve(rest)
        }
      })
    },
    _validRowRules (type, row) {
      let validPromise = Promise.resolve()
      if (!XEUtils.isEmpty(this.editRules)) {
        let editRules = this.editRules
        this._clearValidError(row)
        this.getColumns().forEach((column, columnIndex) => {
          if (XEUtils.has(editRules, column.property)) {
            validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
              this._validCellRules('all', row, column)
                .then(resolve)
                .catch(rule => {
                  let { cell } = this._getColumnByRowIndex(row.data, column.property)
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
      let editRules = this.editRules
      let validPromise = Promise.resolve()
      if (property && !XEUtils.isEmpty(editRules)) {
        let rules = XEUtils.get(editRules, property)
        let value = XEUtils.get(row.data, property)
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
                  let isEmpty = value === null || value === undefined || value === ''
                  if (isNumber) {
                    restVal = XEUtils.toNumber(value)
                  } else {
                    restVal = isEmpty ? '' : '' + value
                  }
                  if (isRequired && isEmpty) {
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
    _getColumnByRowIndex (record, property) {
      let tableData = this._getTDatas()
      let columns = this.getColumns()
      let columnIndex = XEUtils.findIndexOf(columns, item => property ? property === item.property : item.property)
      let column = columns[columnIndex]
      let rowIndex = XEUtils.findIndexOf(tableData, row => row.data === record)
      let row = tableData[rowIndex]
      if (column) {
        let trElemList = this.$el.querySelectorAll('.el-table__body-wrapper .el-table__row')
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
      let { row, column, cell } = this._getColumnByRowIndex(record, prop)
      if (row && column) {
        this.callEvent = this._callTriggerEvent('activate')
        this.datas.forEach(row => {
          if (row.data !== record) {
            this._clearValidError(row)
          }
        })
        if (prop) {
          this._validCellRules('all', row, column)
            .then(valid => this._triggerActive(row, column, cell, { type: 'edit', trigger: 'call' }))
            .catch(rule => this._toValidError(rule, row, column, cell))
        } else {
          this._validRowRules('all', row)
            .then(valid => this._triggerActive(row, column, cell, { type: 'edit', trigger: 'call' }))
            .catch(({ rule, row, column, cell }) => this._toValidError(rule, row, column, cell))
        }
        this.currentRow = row.data
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
    _toValidError (rule, row, column, cell) {
      this._triggerActive(row, column, cell, { type: 'valid', trigger: 'call' }).then(() => {
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
    _saveOperStatus () {
      let expandeKeys = []
      XEUtils.each(this.$refs.refElTable.store.states.treeData, (treeData, key) => {
        if (treeData.expanded) {
          expandeKeys.push(key)
        }
      })
      this.lastOperation = {
        expandeKeys
      }
    },
    _ctxMenuMouseoverEvent (item, evnt) {
      evnt.preventDefault()
      evnt.stopPropagation()
      this.ctxMenuStore.selected = item
    },
    _ctxMenuMouseoutEvent (item, evnt) {
      this.ctxMenuStore.selected = null
    },
    // 右菜单事件
    _ctxMenuEvent ({ code, disabled }, evnt) {
      if (!disabled) {
        let ctxMenuStore = this.ctxMenuStore
        if (ctxMenuStore.info) {
          let { row, rowIndex, column, cell } = ctxMenuStore.info
          switch (code) {
            case 'CELL_RESET':
              XEUtils.set(row.data, column.property, null)
              break
            case 'CELL_REVERT':
              XEUtils.set(row.data, column.property, XEUtils.get(row.store, column.property))
              break
            case 'SELECT_REMOVE':
              this.removeSelecteds()
              break
            case 'SELECT_RESET':
              this.reset(this.getSelecteds())
              break
            case 'SELECT_REVERT':
              this.revert(this.getSelecteds())
              break
            case 'SELECT_EXPORT':
              let selectRows = this._getSelectRows()
              let selectIndexs = []
              this._getTDatas().forEach((row, index) => {
                if (selectRows.includes(row)) {
                  selectIndexs.push(index)
                }
              })
              this.exportCsv({
                dataFilterMethod (item, index) {
                  return selectIndexs.includes(index)
                }
              })
              break
            case 'ROW_INSERT':
              this.insertAt(null, row.data).then(({ _row }) => this._setChecked(_row, column))
              break
            case 'ROW_INSERT_ACTIVE':
              this.insertAt(null, row.data).then(({ row }) => this._toActiveRow(row, column.property))
              break
            case 'ROW_REMOVE':
              this.remove(row.data)
              break
            case 'ROW_RESET':
              this.reset(row.data)
              break
            case 'ROW_REVERT':
              this.revert(row.data)
              break
            case 'ROW_EXPORT':
              this.exportCsv({
                dataFilterMethod (item, index) {
                  return rowIndex === index
                }
              })
              break
            case 'ALL_REMOVE':
              this.clear()
              break
            case 'ALL_RESET':
              this.reset()
              break
            case 'ALL_REVERT':
              this.revert()
              break
            case 'ALL_EXPORT':
              this.exportCsv()
              break
            default:
              this.$emit('custom-menu-link', code, row.data, column, cell, evnt)
              break
          }
        }
        this.closeContextMenu()
      }
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
    /****************************/
    /* Interior methods end     */
    /****************************/

    /****************************/
    /* Scroll methods end       */
    /****************************/
    _reloadScrollData: ScrollHandle.reload(),
    _bindScrollEvent: ScrollHandle.bind(),
    _unbindScrollEvent: ScrollHandle.unbind(),
    _scrollEvent: ScrollHandle.scroll(),
    _computeScroll: ScrollHandle.compute(3),
    /****************************/
    /* Scroll methods end       */
    /****************************/

    /****************************/
    /* Public methods start     */
    /****************************/
    reload (datas) {
      this.currentRow = null
      this.deleteRecords = []
      this._clearAllOpers()
      this._clearAllChecked()
      this._clearActiveData()
      this._initial(datas, true)
      this._setDefaultChecked()
      this._updateData()
      return this.$nextTick()
    },
    reloadRow (record) {
      let matchObj = XEUtils.findTree(this.datas, row => row.data === record, this.elTreeOpts)
      if (matchObj) {
        let { item } = matchObj
        XEUtils.destructuring(item.data, record)
        Object.assign(item, {
          store: XEUtils.clone(item.data, true),
          validActive: null,
          validRule: null,
          showValidMsg: false,
          checked: null,
          editActive: null,
          editStatus: 'initial'
        })
      }
      return this.$nextTick()
    },
    /**
     * 还原更改，以最后一次 reload 或 reloadRow 的数据为源数据或者初始值 data
     * 还原行数据
     * 还原指定行数据
     * 还原整个表格数据
     */
    revert (records) {
      this.currentRow = null
      if (records) {
        if (!XEUtils.isArray(records)) {
          records = [records]
        }
        XEUtils.eachTree(this.datas, row => {
          if (records.includes(row.data)) {
            XEUtils.destructuring(row.data, XEUtils.clone(row.store, true))
          }
        }, this.elTreeOpts)
      } else {
        this._clearAllOpers()
        return this.reload(this.initialStore)
      }
      return this.$nextTick()
    },
    // 刷新表格
    refresh (force) {
      this._initial(this.datas)
      this._updateData()
      return this.$nextTick().then(() => {
        if (!force && this.lastOperation) {
          let { expandeKeys } = this.lastOperation
          expandeKeys.forEach(key => this.$refs.refElTable.store.toggleTreeExpansion(key))
          return this.$nextTick()
        }
      })
    },
    /**
     * 清空表格
     */
    clear () {
      return this.reload([])
    },
    /**
     * 重置数据
     * 清除行数据
     * 清除指定行数据
     * 清除整个表格数据
     */
    reset (records = this._getData()) {
      let columns = this.getColumns()
      if (records && !XEUtils.isArray(records)) {
        records = [records]
      }
      records.forEach(record => {
        columns.forEach(column => {
          if (column.property) {
            XEUtils.set(record, column.property, null)
          }
        })
      })
      return this.$nextTick()
    },
    getColumns () {
      return this.$refs.refElTable ? this.$refs.refElTable.columns : []
    },
    insert (newRecord) {
      return this.insertAt(newRecord)
    },
    /**
     * 插入数据
     * 如果是 record 则在指定位置新增一行新数据
     * 如果是 null 或 0 则插入到第一行
     * 如果是 -1 则使用 push 到表格最后
     */
    insertAt (newRecord, record) {
      let rowItem = this._toDatas([newRecord], 'insert')[0]
      let rest = { row: rowItem.data, _row: rowItem }
      if (record) {
        if (record === -1) {
          this._fullData.push(rowItem)
        } else {
          let matchObj = XEUtils.findTree(this._fullData, row => row.data === record, this.elTreeOpts)
          if (matchObj) {
            if (matchObj.parent) {
              rest.parent = matchObj.parent.data
            }
            matchObj.items.splice(matchObj.index, 0, rowItem)
          } else {
            this._fullData.push(rowItem)
          }
        }
      } else {
        this._fullData.unshift(rowItem)
      }
      this.currentRow = rowItem.data
      this._saveOperStatus()
      this._updateData()
      if (this.scrollLoad) {
        this._reloadScrollData()
      }
      return this.$nextTick().then(() => rest)
    },
    hasRowInsert (record) {
      let matchObj = XEUtils.findTree(this._fullData, row => row.data === record, this.elTreeOpts)
      return matchObj && matchObj.item.editStatus === 'insert'
    },
    /**
     * 删除行
     * 删除行数据
     * 删除指定行数据
     * 删除整个表格数据
     */
    remove (records) {
      let rest = []
      if (records && !XEUtils.isArray(records)) {
        records = [records]
      }
      if (records.length) {
        this._saveOperStatus()
        records.forEach(record => {
          let matchObj = XEUtils.findTree(this._fullData, row => row.data === record, this.elTreeOpts)
          if (matchObj) {
            let { index, items } = matchObj
            let removeRow = items.splice(index, 1)[0]
            if (removeRow.editStatus === 'initial') {
              this.deleteRecords.push(removeRow)
            }
            rest.push(removeRow.data)
          }
        })
        this._clearActiveData()
        this._updateData()
        if (this.scrollLoad) {
          this._reloadScrollData(true)
          this._clearScrollChecked()
        }
      }
      return this.$nextTick().then(() => rest)
    },
    getSelecteds () {
      return this._getSelectRows().map(item => item.data)
    },
    removeSelecteds () {
      this.remove(this.getSelecteds())
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
      return this._getData(XEUtils.filterTree(this.datas, item => item.editStatus === 'insert', this.elTreeOpts))
    },
    getRemoveRecords () {
      return this._getData(this.deleteRecords)
    },
    getUpdateRecords () {
      return this._getData(XEUtils.filterTree(this.datas, item => item.editStatus === 'initial' && !XEUtils.isEqualWith(Object.assign({}, item.data, { children: [] }), Object.assign({}, item.store, { children: [] }), (v1, v2, key) => {
        if (key === this.elTreeOpts.children) {
          return true
        }
      })), this.elTreeOpts)
    },
    clearActive () {
      this.callEvent = this._callTriggerEvent('clear')
      this._clearAllChecked()
      this._clearActiveData()
      this._restoreTooltip()
      return this.$nextTick()
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
        let rowIndex = this._getRowIndex(row)
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
      let matchObj = XEUtils.findTree(this.datas, row => row.data === record, this.elTreeOpts)
      return property ? this._isRowDataChange(matchObj.item, { property }) : this._isRowDataChange(matchObj.item)
    },
    /**
     * 更新列状态
     * 如果组件值 v-model 发生 change 时，调用改函数用于更新某一列编辑状态
     * 如果单元格配置了校验规则，则会进行校验
     */
    updateStatus (scope) {
      return this.$nextTick().then(() => {
        if (scope) {
          let column = scope.column
          let record = scope.row
          let { row, cell } = this._getColumnByRowIndex(record, column.property)
          if (cell) {
            return this._validCellRules('change', row, column)
              .then(rule => {
                if (this.configs.mode === 'row' ? row.validActive && row.validActive === column.property : true) {
                  this._clearValidError(row)
                }
              })
              .catch(rule => this._toValidError(rule, row, column, cell))
              .then(() => this.$nextTick())
          }
        }
      })
    },
    checkValid () {
      // 查找是否存在校验不通过的列
      let matchObj = XEUtils.findTree(this.datas, row => row.validActive, this.elTreeOpts)
      if (matchObj) {
        let row = matchObj.item
        let column = XEUtils.findIndexOf(this.getColumns(), column => column.property === row.validActive)
        return {
          error: true,
          row: row.data,
          rowIndex: this._getRowIndex(row),
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
      this.callEvent = this._callTriggerEvent('valid')
      return new Promise((resolve, reject) => {
        let matchObj = XEUtils.findTree(this.datas, row => row.data === record, this.elTreeOpts)
        let row = matchObj.item
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
        let columns = this.getColumns()
        this._getTDatas().forEach((row, rowIndex) => {
          this._clearValidError(row)
          columns.forEach((column, columnIndex) => {
            if (XEUtils.has(editRules, column.property)) {
              validPromise = validPromise.then(rest => new Promise((resolve, reject) => {
                this._validCellRules('all', row, column)
                  .then(resolve)
                  .catch(rule => {
                    let { cell } = this._getColumnByRowIndex(row.data, column.property)
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
        columnFilterMethod: column => ['index', 'selection', 'expand'].indexOf(column.type) === -1 && column.property,
        dataFilterMethod: null
      }, options)
      if (opts.filename.indexOf('.csv') === -1) {
        opts.filename += '.csv'
      }
      let columns = this.getColumns()
      let oData = this.scrollLoad ? this._fullData : this._getData(this._getTDatas())
      UtilHandle.downloadCsc(opts, UtilHandle.getCsvContent(opts, oData, columns, this.$el))
    },
    closeContextMenu () {
      this.ctxMenuStore.info = null
      this.ctxMenuStore.visible = false
    }
    /****************************/
    /* Public methods end       */
    /****************************/
  }
}
</script>

<style src="../../../style/editable.css"></style>
