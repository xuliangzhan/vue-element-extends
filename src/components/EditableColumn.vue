<template>
  <el-table-column v-if="type === 'selection' || group" v-bind="attrs">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="type === 'index'" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="{$index: scope.$index, column: scope.column, store: scope.store}">#</slot>
    </template>
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="type === 'expand'" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="{$index: scope.$index, column: scope.column, store: scope.store}"></slot>
    </template>
    <template slot-scope="scope">
      <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, _row: scope.row}"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="editRender" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="{$index: scope.$index, column: scope.column, store: scope.store}">
        <i v-if="checkRequired(scope)" class="editable-required-icon"></i>
        <i v-if="checkIcon(scope)" class="el-icon-edit-outline editable-header-icon"></i>{{ scope.column.label }}
      </slot>
    </template>
    <template slot-scope="scope">
      <template v-if="editRender.type === 'visible'">
        <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, _row: scope.row}">
          <template v-if="editRender.name === 'ElSelect'">
            <el-select v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)">
              <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="editRender.optionAttrs"></el-option>
            </el-select>
          </template>
          <template v-else-if="editRender.name === 'ElCascader'">
            <el-cascader v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-cascader>
          </template>
          <template v-else-if="editRender.name === 'ElTimePicker'">
            <el-time-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-time-picker>
          </template>
          <template v-else-if="editRender.name === 'ElDatePicker'">
            <el-date-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-date-picker>
          </template>
          <template v-else-if="editRender.name === 'ElInputNumber'">
            <el-input-number v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-input-number>
          </template>
          <template v-else-if="editRender.name === 'ElSwitch'">
            <el-switch v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-switch>
          </template>
          <template v-else-if="editRender.name === 'ElRate'">
            <el-rate v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-rate>
          </template>
          <template v-else-if="editRender.name === 'ElColorPicker'">
            <el-color-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-color-picker>
          </template>
          <template v-else-if="editRender.name === 'ElSlider'">
            <el-slider v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-slider>
          </template>
          <template v-else>
            <el-input v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @input="changeEvent(scope)"></el-input>
          </template>
        </slot>
      </template>
      <template v-else>
        <template v-if="scope.row.editActive && (scope.row.config.mode === 'row' ? scope.row.editActive : scope.row.editActive === scope.column.property)">
          <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, _row: scope.row}">
            <template v-if="editRender.name === 'ElSelect'">
              <el-select v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)">
                <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="editRender.optionAttrs"></el-option>
              </el-select>
            </template>
            <template v-else-if="editRender.name === 'ElCascader'">
              <el-cascader v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-cascader>
            </template>
            <template v-else-if="editRender.name === 'ElTimePicker'">
              <el-time-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-time-picker>
            </template>
            <template v-else-if="editRender.name === 'ElDatePicker'">
              <el-date-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-date-picker>
            </template>
            <template v-else-if="editRender.name === 'ElInputNumber'">
              <el-input-number v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-input-number>
            </template>
            <template v-else-if="editRender.name === 'ElSwitch'">
              <el-switch v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-switch>
            </template>
            <template v-else-if="editRender.name === 'ElRate'">
              <el-rate v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-rate>
            </template>
            <template v-else-if="editRender.name === 'ElColorPicker'">
              <el-color-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-color-picker>
            </template>
            <template v-else-if="editRender.name === 'ElSlider'">
              <el-slider v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @change="changeEvent(scope)"></el-slider>
            </template>
            <template v-else>
              <el-input v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)" @input="changeEvent(scope)"></el-input>
            </template>
          </slot>
        </template>
        <template v-else>
          <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, _row: scope.row}">
            <template v-if="editRender.name === 'ElSelect'">{{ getSelectLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElCascader'">{{ getCascaderLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElTimePicker'">{{ getTimePickerLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElDatePicker'">{{ getDatePickerLabel(scope) }}</template>
            <template v-else>{{ formatter ? formatter(scope.row.data, scope.column, scope.row.data[scope.column.property], scope.$index) : scope.row.data[scope.column.property] }}</template>
          </slot>
        </template>
      </template>
      <template v-if="scope.row.validActive && scope.row.validActive === scope.column.property">
        <slot name="valid" v-bind="{rule: scope.row.validRule || {}, $index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, _row: scope.row}">
          <div class="editable-valid_error">{{ scope.row.validRule ? scope.row.validRule.message : '' }}</div>
        </slot>
      </template>
    </template>
  </el-table-column>
  <el-table-column v-else v-bind="attrs">
    <template slot-scope="scope">
      <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column, store: scope.store, _row: scope.row}">{{ formatter ? formatter(scope.row.data, scope.column, scope.row.data[scope.column.property], scope.$index) : scope.row.data[scope.column.property] }}</slot>
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
  computed: {
    attrs () {
      let sortBy
      let isDefaultFocus = this.editRender ? ['ElInput', 'ElInputNumber'].includes(this.editRender.name) : false
      let className = this.className ? ` ${this.className}` : ''
      let editTypeClass = this.editRender ? ' editable-col_edit' : ' editable-col_readonly'
      let autofocusClass = this.editRender ? (this.editRender.autofocus === true || isDefaultFocus ? ' autofocus' : '') : (isDefaultFocus ? ' autofocus' : '')
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
    getRendAttrs ({ row }) {
      let size = row.config.size
      return Object.assign({ size }, this.editRender.attrs)
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
      return labels.join(attrs.separator || '/')
    },
    getTimePickerLabel ({ row, column }) {
      let value = row.data[column.property]
      let attrs = this.editRender.attrs || {}
      return XEUtils.toDateString(value, attrs.format || 'hh:mm:ss')
    },
    getDatePickerLabel ({ row, column }) {
      let value = row.data[column.property]
      let attrs = this.editRender.attrs || {}
      if (attrs.type === 'datetimerange') {
        return XEUtils.toArray(value).map(date => XEUtils.toDateString(date, attrs.format)).join(attrs.rangeSeparator)
      }
      return XEUtils.toDateString(value, attrs.format, 'yyyy-MM-dd')
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
    },
    changeEvent ({ $index, row, column, store }) {
      if (this.$editable) {
        this.$editable.updateStatus({$index, row: row.data, column, store, _row: row})
      }
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
.editable .editable-column .editable-valid_error {
  display: none;
}
.editable .editable-column.valid-error .el-input__inner,
.editable .editable-column.valid-error .el-input__inner:focus,
.editable .editable-column.valid-error .el-textarea__inner,
.editable .editable-column.valid-error .el-textarea__inner:focus {
  border-color: #f56c6c;
}
.editable .el-table__row:last-child .editable-column.valid-error .editable-valid_error {
  top: auto;
  bottom: calc(100% + 10px);
}
.editable .el-table__row:last-child .editable-column.valid-error .editable-valid_error:before {
  top: auto;
  bottom: -8px;
  border-color: #f56c6c transparent transparent transparent;
}
.editable .editable-column.valid-error .editable-valid_error,
.editable .el-table__row:first-child .editable-column.valid-error .editable-valid_error {
  display: block;
  color: #fff;
  background-color: #f56c6c;
  border-radius: 2px;
  font-size: 12px;
  line-height: 1;
  padding: 4px 10px;
  position: absolute;
  top: calc(100% + 10px);
  left: 10px;
  z-index: 9;
  font-size: 12px;
  min-width: 10px;
  word-wrap: break-word;
}
.editable .editable-column .editable-valid_error:before,
.editable .el-table__row:first-child .editable-column.valid-error .editable-valid_error:before {
  content: "";
  position: absolute;
  top: -8px;
  left: 20%;
  bottom: auto;
  border: 4px solid;
  border-color: transparent transparent #f56c6c transparent;
}
</style>
