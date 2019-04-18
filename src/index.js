import Table from '../packages/table'
import TableColumn from '../packages/table-column'
import Editable from '../packages/editable'
import EditableColumn from '../packages/editable-column'

const components = [
  Table,
  TableColumn,
  Editable,
  EditableColumn
]

const install = function (Vue) {
  if (!install.installed) {
    components.map(component => Vue.component(component.name, component))
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export * from '../packages/table'
export * from '../packages/table-column'
export * from '../packages/editable'
export * from '../packages/editable-column'
export default {
  install,
  Table,
  TableColumn,
  Editable,
  EditableColumn
}
