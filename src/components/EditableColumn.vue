<template>
  <el-table-column v-if="['selection', 'index'].includes(this.type)" v-bind="attrs">
    <slot></slot>
  </el-table-column>
  <el-table-column v-else-if="['expand'].includes(this.type)" v-bind="attrs">
    <template slot-scope="scope">
      <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}"></slot>
    </template>
  </el-table-column>
  <el-table-column v-else-if="editRender" v-bind="attrs">
    <template slot="header" slot-scope="scope">
      <slot name="head" v-bind="{$index: scope.$index, column: scope.column}">
        <i class="el-icon-edit-outline"></i>{{ scope.column.label }}
      </slot>
    </template>
    <template slot-scope="scope">
      <template v-if="editRender.type === 'visible' || editRender.name === 'ElSwitch'">
        <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
          <el-switch v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)"></el-switch>
        </slot>
      </template>
      <template v-else>
        <template v-if="scope.row.editable.mode === 'row' ? scope.row.editable.active : scope.row.editable.active === scope.column.property">
          <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
            <template v-if="editRender.name === 'ElSelect'">
              <el-select v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)">
                <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="editRender.optionAttrs"></el-option>
              </el-select>
            </template>
            <template v-else-if="editRender.name === 'ElCascader'">
              <el-cascader v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)"></el-cascader>
            </template>
            <template v-else-if="editRender.name === 'ElDatePicker'">
              <el-date-picker v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)"></el-date-picker>
            </template>
            <template v-else-if="editRender.name === 'ElInputNumber'">
              <el-input-number v-model="scope.row.data[scope.column.property]" v-bind="getRendAttrs(scope)"></el-input-number>
            </template>
            <template v-else>
              <el-input v-model="scope.row.data[scope.column.property]"></el-input>
            </template>
          </slot>
        </template>
        <template v-else>
          <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
            <template v-if="editRender.name === 'ElSelect'">{{ getSelectLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElCascader'">{{ getCascaderLabel(scope) }}</template>
            <template v-else-if="editRender.name === 'ElDatePicker'">{{ getDatePickerLabel(scope) }}</template>
            <template v-else>{{ formatter ? formatter(scope.row.data, scope.column, scope.row.data[scope.column.property], scope.$index) : scope.row.data[scope.column.property] }}</template>
          </slot>
        </template>
      </template>
    </template>
  </el-table-column>
  <el-table-column v-else v-bind="attrs">
    <template slot-scope="scope">
      <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">{{ formatter ? formatter(scope.row.data, scope.column, scope.row.data[scope.column.property], scope.$index) : scope.row.data[scope.column.property] }}</slot>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'ElEditableColumn',
  props: {
    editRender: Object,
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
  computed: {
    attrs () {
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
        sortBy: this.$utils.isFunction(this.sortBy) ? this.sortByEvent : this.sortBy,
        sortOrders: this.sortOrders,
        resizable: this.resizable,
        showOverflowTooltip: this.showOverflowTooltip,
        align: this.align,
        headerAlign: this.headerAlign,
        className: `editable-column ${this.editRender ? 'col-edit' : 'col-readonly'}${this.className ? ' ' + this.className : ''}`,
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
      let size = row.editable.size
      return Object.assign({ size }, this.editRender.attrs)
    },
    getSelectLabel (scope) {
      let value = scope.row.data[scope.column.property]
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
    getCascaderLabel (scope) {
      let values = scope.row.data[scope.column.property] || []
      let labels = []
      let attrs = this.editRender.attrs || {}
      this.matchCascaderData(values, 0, attrs.options || [], labels)
      return labels.join(attrs.separator || '/')
    },
    getDatePickerLabel (scope) {
      let value = scope.row.data[scope.column.property]
      let attrs = this.editRender.attrs || {}
      return this.$utils.toDateString(value, attrs.format)
    },
    sortByEvent (row, index) {
      return this.sortBy(row.data, index)
    },
    sortMethodEvent (a, b) {
      return this.sortMethod(a.data, b.data)
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

<style lang="scss">
.editable {
  &.el-table--mini {
    .editable-column {
      height: 42px;
    }
  }
  &.el-table--small {
    .editable-column {
      height: 48px;
    }
  }
  &.el-table--medium {
    .editable-column {
      height: 62px;
    }
  }
  .editable-column {
    height: 62px;
    padding: 0;
    .cell {
      >.edit-input,
      >.el-autocomplete,
      >.el-input-number,
      >.el-date-editor,
      >.el-select {
        width: 100%;
      }
    }
  }
}
</style>
