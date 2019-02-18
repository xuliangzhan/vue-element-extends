<template>
  <el-table-column v-if="type === 'selection' || group" v-bind="attrs">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="type === 'index'" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="getHeadScope(scope)">#</slot>
    </template>
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="type === 'expand'" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="getHeadScope(scope)"></slot>
    </template>
    <template slot-scope="scope">
      <slot v-bind="getRowScope(scope)"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="editRender" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="getHeadScope(scope)">
        <i v-if="checkRequired(scope)" class="editable-required-icon"></i>
        <i v-if="checkIcon(scope)" class="el-icon-edit-outline editable-header-icon"></i>
        {{ scope.column.label }}
      </slot>
    </template>
    <template slot-scope="scope">
      <template v-if="editRender.type === 'visible'">
        <slot name="edit" v-bind="getRowScope(scope)">
          <template v-if="editRender.name === 'ElSelect'">
            <el-select v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)">
              <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="item.attrs"></el-option>
            </el-select>
          </template>
          <template v-else-if="comps.includes(editRender.name)">
            <component :is="editRender.name" v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)"></component>
          </template>
          <template v-else>
            <el-input v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)"></el-input>
          </template>
        </slot>
      </template>
      <template v-else>
        <template v-if="scope.row.editActive && (scope.row.config.mode === 'row' ? scope.row.editActive : scope.row.editActive === scope.column.property)">
          <slot name="edit" v-bind="getRowScope(scope)">
            <template v-if="editRender.name === 'ElSelect'">
              <el-select v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)">
                <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="item.attrs"></el-option>
              </el-select>
            </template>
            <template v-else-if="comps.includes(editRender.name)">
              <component :is="editRender.name" v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)"></component>
            </template>
            <template v-else>
              <el-input v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" v-on="getRendEvents(scope)"></el-input>
            </template>
          </slot>
        </template>
        <template v-else>
          <slot v-bind="getRowScope(scope)">{{ formatColumnLabel(scope) }}</slot>
        </template>
      </template>
      <template v-if="scope.row.validActive && scope.row.validActive === scope.column.property">
        <el-tooltip :value="scope.row.showValidMsg" v-bind="scope.row.config.validTooltip">
          <div class="editable-valid_error"></div>
          <div slot="content">
            <slot name="valid" v-bind="{rule: scope.row.validRule || {}, $index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, editRender, _self: scope._self, _row: scope.row}">{{ scope.row.validRule ? scope.row.validRule.message : '' }}</slot>
          </div>
        </el-tooltip>
      </template>
    </template>
  </el-table-column>
  <el-table-column v-else v-bind="attrs">
    <template slot-scope="scope">
      <slot v-bind="getRowScope(scope)">{{ formatColumnLabel(scope) }}</slot>
    </template>
  </el-table-column>
</template>

<script>
import XEUtils from 'xe-utils'

export default {
  name: 'ElEditableColumn',
  props: {
    group: Boolean,
    editRender: Object,

    /**
     * 还原 ElTableColumn 所有属性
     */
    index: [Number, Function],
    type: String,
    label: String,
    columnKey: String,
    prop: String,
    width: String,
    minWidth: String,
    fixed: [Boolean, String],
    sortable: [Boolean, String],
    sortMethod: Function,
    sortBy: [String, Array, Function],
    sortOrders: Array,
    resizable: { type: Boolean, default: true },
    formatter: Function,
    showOverflowTooltip: Boolean,
    align: { type: String, default: 'left' },
    headerAlign: String,
    className: { type: String, default: '' },
    labelClassName: String,
    selectable: Function,
    reserveSelection: Boolean,
    filters: Array,
    filterPlacement: String,
    filterMultiple: { type: Boolean, default: true },
    filterMethod: Function,
    filteredValue: Array
  },
  inject: [
    '$editable'
  ],
  data () {
    return {
      comps: ['ElInput', 'ElSelect', 'ElCascader', 'ElTimePicker', 'ElDatePicker', 'ElInputNumber', 'ElSwitch', 'ElRate', 'ElColorPicker', 'ElSlider']
    }
  },
  computed: {
    isDefaultInput () {
      return this.editRender ? ['ElInput', 'ElInputNumber'].includes(this.editRender.name) : false
    },
    attrs () {
      let sortBy
      let className = this.className ? ` ${this.className}` : ''
      let editTypeClass = this.editRender ? ' editable-col_edit' : ' editable-col_readonly'
      let autofocusClass = this.editRender ? (this.editRender.autofocus === true || this.isDefaultInput ? ' autofocus' : '') : (this.isDefaultInput ? ' autofocus' : '')
      if (XEUtils.isFunction(this.sortBy)) {
        sortBy = this.sortBy
      } else if (XEUtils.isString(this.sortBy)) {
        sortBy = `data.${this.sortBy}`
      } else if (XEUtils.isArray(this.sortBy)) {
        sortBy = this.sortBy.map(name => `data.${name}`)
      } else if (this.prop) {
        sortBy = `data.${this.prop}`
      }
      return {
        index: this.index,
        type: this.type,
        label: this.label,
        columnKey: this.columnKey,
        prop: this.prop,
        width: this.width,
        minWidth: this.minWidth,
        fixed: this.fixed,
        sortable: this.sortable,
        sortMethod: this.sortMethod ? this.sortMethodEvent : this.sortMethod,
        sortBy,
        sortOrders: this.sortOrders,
        resizable: this.resizable,
        showOverflowTooltip: this.showOverflowTooltip,
        align: this.align,
        headerAlign: this.headerAlign,
        className: `editable-column${editTypeClass}${autofocusClass}${className}`,
        labelClassName: this.labelClassName,
        selectable: this.selectable ? this.selectableEvent : this.selectable,
        reserveSelection: this.reserveSelection,
        filters: this.filters,
        filterPlacement: this.filterPlacement,
        filterMultiple: this.filterMultiple,
        filterMethod: this.filterMethod ? this.filterMethodEvent : this.filterMethod,
        filteredValue: this.filteredValue
      }
    }
  },
  methods: {
    getHeadScope (scope) {
      return { $index: scope.$index, column: scope.column, store: scope.store, editRender: this.editRender, _self: scope._self }
    },
    getRowScope (scope) {
      return { $index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, editRender: this.editRender, _self: scope._self, _row: scope.row }
    },
    getRendAttrs (scope) {
      let size = scope.row.config.size
      return Object.assign({ size }, this.editRender.attrs)
    },
    getRendEvents ({ $index, row, column, store }) {
      let editRender = this.editRender
      let scope = { $index, row: row.data, column, store, editRender, _row: row }
      let defEvent = { [this.isDefaultInput ? 'input' : 'change']: () => this.$editable.updateStatus(scope) }
      if (editRender.events) {
        return Object.assign(defEvent, XEUtils.objectMap(editRender.events, cb => function () {
          cb.apply(null, [scope].concat(Array.from(arguments)))
        }))
      }
      return defEvent
    },
    formatColumnLabel (scope) {
      if (this.formatter) {
        return this.formatter(scope.row.data, scope.column, scope.row.data[scope.column.property], scope.$index)
      }
      if (this.editRender) {
        switch (this.editRender.name) {
          case 'ElSelect':
            return this.getSelectLabel(scope)
          case 'ElCascader':
            return this.getCascaderLabel(scope)
          case 'ElTimePicker':
            return this.getTimePickerLabel(scope)
          case 'ElDatePicker':
            return this.getDatePickerLabel(scope)
        }
      }
      return scope.row.data[scope.column.property]
    },
    getSelectLabel ({ row, column }) {
      let value = row.data[column.property]
      let selectItem = this.editRender.options.find(item => item.value === value)
      return selectItem ? selectItem.label : null
    },
    matchCascaderData (values, index, list, labels) {
      let val = values[index]
      if (list && values.length > index) {
        list.forEach(item => {
          if (item.value === val) {
            labels.push(item.label)
            this.matchCascaderData(values, ++index, item.children, labels)
          }
        })
      }
    },
    getCascaderLabel ({ row, column }) {
      let values = row.data[column.property] || []
      let labels = []
      let attrs = this.editRender.attrs || {}
      this.matchCascaderData(values, 0, attrs.options || [], labels)
      return labels.join(` ${attrs.separator || '/'} `)
    },
    getTimePickerLabel ({ row, column }) {
      let value = row.data[column.property]
      let attrs = this.editRender.attrs || {}
      return XEUtils.toDateString(value, attrs.format || 'hh:mm:ss')
    },
    getDatePickerLabel ({ row, column }) {
      let value = row.data[column.property]
      let attrs = this.editRender.attrs || {}
      switch (attrs.type) {
        case 'week':
          return this.getFormatDate(value, attrs, 'yyyywWW')
        case 'month':
          return this.getFormatDate(value, attrs, 'yyyy-MM')
        case 'year':
          return this.getFormatDate(value, attrs, 'yyyy')
        case 'dates':
          return this.getFormatDates(value, attrs, ', ', 'yyyy-MM-dd')
        case 'daterange':
          return this.getFormatDates(value, attrs, ` ${attrs.rangeSeparator || '-'} `, 'yyyy-MM-dd')
        case 'datetimerange':
          return this.getFormatDates(value, attrs, ` ${attrs.rangeSeparator || '-'} `, 'yyyy-MM-dd HH:ss:mm')
      }
      return this.getFormatDate(value, attrs, 'yyyy-MM-dd')
    },
    getFormatDate (value, attrs, defaultFormat) {
      return XEUtils.toDateString(value, attrs.format || defaultFormat)
    },
    getFormatDates (values, attrs, separator, defaultFormat) {
      return XEUtils.toArray(values).map(date => this.getFormatDate(date, attrs, defaultFormat)).join(separator)
    },
    checkRequired ({ column, store }) {
      if (column.property && this.$editable && this.$editable.editRules) {
        let rules = this.$editable.editRules[column.property]
        if (rules) {
          return rules.some(rule => rule.required === true)
        }
      }
      return false
    },
    checkIcon ({ column, store }) {
      return column.property && this.$editable && this.$editable.editConfig ? !(this.$editable.editConfig.showIcon === false) : true
    },
    sortByEvent (row, index) {
      return this.sortBy(row.data, index)
    },
    sortMethodEvent (v1, v2) {
      return this.sortMethod(v1.data, v2.data)
    },
    selectableEvent (row, index) {
      return this.selectable(row.data, index)
    },
    filterMethodEvent (value, row, column) {
      return this.filterMethod(value, row.data, column)
    }
  }
}
</script>

<style>
.editable .editable-required-icon:before {
  content: "*";
  color: #f56c6c;
}
.editable.el-table--mini .editable-column {
  height: 42px;
}
.editable.el-table--small .editable-column {
  height: 48px;
}
.editable .editable-column,
.editable.el-table--medium .editable-column {
  height: 62px;
  padding: 0;
}
.editable .editable-column.editable-col_dirty {
  position: relative;
}
.editable .editable-column.editable-col_dirty:before {
  content: '';
  top: -5px;
  left: -5px;
  position: absolute;
  border: 5px solid;
  border-color: transparent #f56c6c transparent transparent;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}
.editable .editable-column .cell > .edit-input,
.editable .editable-column .cell > .el-cascader,
.editable .editable-column .cell > .el-autocomplete,
.editable .editable-column .cell > .el-input-number,
.editable .editable-column .cell > .el-date-editor,
.editable .editable-column .cell > .el-select {
  width: 100%;
}
.editable .editable-column.editable-col_edit.editable-col_active .cell {
  line-height: inherit;
  overflow: inherit;
  position: relative;
}
.editable.editable_click .editable-column.editable-col_edit,
.editable.editable_dblclick .editable-column.editable-col_edit {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.editable .editable-column.valid-error .el-input__inner,
.editable .editable-column.valid-error .el-input__inner:focus,
.editable .editable-column.valid-error .el-textarea__inner,
.editable .editable-column.valid-error .el-textarea__inner:focus {
  border-color: #f56c6c;
}
.editable .editable-column .editable-valid_error {
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  z-index: -1;
}
.el-tooltip__popper.editable-valid_tooltip {
  background: #f56c6c;
}
.el-tooltip__popper.editable-valid_tooltip[x-placement^=top] .popper__arrow,
.el-tooltip__popper.editable-valid_tooltip[x-placement^=top] .popper__arrow::after {
  border-top-color: #f56c6c;
}
.el-tooltip__popper.editable-valid_tooltip[x-placement^=bottom] .popper__arrow,
.el-tooltip__popper.editable-valid_tooltip[x-placement^=bottom] .popper__arrow::after {
  border-bottom-color: #f56c6c;
}
.el-tooltip__popper.editable-valid_tooltip[x-placement^=left] .popper__arrow,
.el-tooltip__popper.editable-valid_tooltip[x-placement^=left] .popper__arrow::after {
  border-left-color: #f56c6c;
}
.el-tooltip__popper.editable-valid_tooltip[x-placement^=right] .popper__arrow,
.el-tooltip__popper.editable-valid_tooltip[x-placement^=right] .popper__arrow::after {
  border-right-color: #f56c6c;
}
</style>
