import * as types from '../mutation-types'

const state = {
  click: null
}

const getters = {
  globalClick: state => state.click
}

const actions = {
  triggerEvent ({ commit }, evnt) {
    commit(types.SET_EVENT, evnt)
  }
}

const mutations = {
  [types.SET_EVENT] (state, evnt) {
    state[evnt.type] = evnt
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
