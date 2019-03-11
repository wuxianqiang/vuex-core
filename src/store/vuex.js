let Vue;

class Store {
  constructor (options) {
    this.getters = {}
    this.mutations = {}
    this.actions = {}
    let state = options.state
    this._vm = new Vue({
      data: {
        state
      }
    })

    let getters = options.getters
    forEach(getters, (getterName, getterFn) => {
      Object.defineProperty(this.getters, getterName, {
        get: () => {
          return getterFn(state)
        }
      })
    })

    let mutations = options.mutations
    forEach(mutations, (mutationName, mutationFn) => {
      this.mutations[mutationName] = () => {
        mutationFn.call(this, state)
      }
    })

    let actions = options.actions
    forEach(actions, (actionName, actionFn) => {
      this.actions[actionName] = () => {
        actionFn.call(this, this)
      }
    })
    let {commit, dispatch} = this
    this.commit = (type) => {
      commit.call(this, type)
    }
    this.dispatch = (type) => {
      dispatch.call(this, type)
    }
  }
  get state () {
    return this._vm.state
  }
  commit (type) {
    this.mutations[type]()
  }
  dispatch (type) {
    this.actions[type]()
  }
}

function forEach (obj, cb) {
  Object.keys(obj).forEach(item => {
    cb(item, obj[item])
  })
}

let install = (_Vue) => {
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      // 所有组件都共用一个store，通过混合注入
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store
      } else {
        this.$store = this.$parent && this.$parent.$store
      }
    }
  })
}

export default {
  install,
  Store
}
