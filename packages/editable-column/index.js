import ElxEditableColumn from '../editable/src/editable-column'

ElxEditableColumn.install = function (Vue) {
  Vue.component(ElxEditableColumn.name, ElxEditableColumn)
}

export const EditableColumn = ElxEditableColumn
export default ElxEditableColumn
