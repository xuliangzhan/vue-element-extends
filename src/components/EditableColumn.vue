<template>
  <el-table-column
    v-if="isDefaultRender"
    className="editable-column col-readonly"
    :type="type"
    :label="label"
    :columnKey="columnKey"
    :prop="prop"
    :width="width"
    :minWidth="minWidth">
    <slot></slot>
  </el-table-column>
  <el-table-column
    v-else-if="editRender"
    className="editable-column col-edit"
    :type="type"
    :label="label"
    :columnKey="columnKey"
    :prop="prop"
    :width="width"
    :minWidth="minWidth">
    <template slot="header" slot-scope="scope">
      <i class="el-icon-edit-outline"></i>{{ scope.column.label }}
    </template>
    <template slot-scope="scope">
      <template v-if="editRender.visible === true || editRender.name === 'ElSwitch'">
        <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
          <el-switch v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-switch>
        </slot>
      </template>
      <template v-else>
        <template v-if="scope.row.editable.active === scope.column.property">
          <slot name="edit" v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">
            <template v-if="editRender.name === 'ElSelect'">
              <el-select v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs">
                <el-option v-for="(item, index) in editRender.options" :key="index" :value="item.value" :label="item.label" v-bind="editRender.optionAttrs"></el-option>
              </el-select>
            </template>
            <template v-else-if="editRender.name === 'ElCascader'">
              <el-cascader v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-cascader>
            </template>
            <template v-else-if="editRender.name === 'ElDatePicker'">
              <el-date-picker v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-date-picker>
            </template>
            <template v-else-if="editRender.name === 'ElInputNumber'">
              <el-input-number v-model="scope.row.data[scope.column.property]" v-bind="editRender.attrs"></el-input-number>
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
            <template v-else>{{ scope.row.data[scope.column.property] }}</template>
          </slot>
        </template>
      </template>
    </template>
  </el-table-column>
  <el-table-column
    v-else
    className="editable-column col-readonly"
    :type="type"
    :label="label"
    :columnKey="columnKey"
    :prop="prop"
    :width="width"
    :minWidth="minWidth">
    <template slot-scope="scope">
      <slot v-bind="{$index: scope.$index, row: scope.row.data, column: scope.column}">{{ scope.row.data[scope.column.property] }}</slot>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'ElEditableColumn',
  props: {
    editRender: Object,
    type: String,
    label: String,
    columnKey: String,
    prop: String,
    width: String,
    minWidth: String
  },
  computed: {
    isDefaultRender () {
      return ['selection', 'index', 'expand'].includes(this.type)
    }
  },
  methods: {
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
      this.matchCascaderData(values, 0, this.editRender.attrs.options, labels)
      return labels.join(this.editRender.attrs ? this.editRender.attrs.separator || '/' : '/')
    },
    getDatePickerLabel (scope) {
      let value = scope.row.data[scope.column.property]
      return this.$utils.toDateString(value, this.editRender.attrs ? this.editRender.attrs.format : null)
    }
  }
}
</script>

<style lang="scss">
.editable {
  .editable-column {
    &.active {
      padding: 0;
    }
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
