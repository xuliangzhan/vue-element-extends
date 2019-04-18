import ElxEditable from './src/editable'

ElxEditable.install = function (Vue) {
  Vue.component(ElxEditable.name, ElxEditable)
}

export const Editable = ElxEditable
export default ElxEditable
