import EditableColumn from '../editable/src/editable-column'

EditableColumn.install = function (Vue) {
  Vue.component(EditableColumn.name, EditableColumn)
}

export default EditableColumn
