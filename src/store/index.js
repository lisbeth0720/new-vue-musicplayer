import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    listLength: 0,
    itemname: '',
    itemid: '',
    playStatus: false
  },
  mutations: {
    changeListLength(state,val){
      state.listLength = val
    },
    changeitemname(state,val){
      state.itemname = val
    },
    changeitemid(state,val){
      state.itemid = val
    },
    changeplayStatus(state,val){
      state.playStatus = val
    }
  },
  actions: {
  },
  modules: {
  }
})
