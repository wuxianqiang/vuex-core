let Vue;

class ModuleCollection {
  constructor (options) {
    this.register([], options)
  }
  register (path, rawModule) {
    let newModule = {
      _raw: rawModule,
      _children: {},
      state: rawModule.state
    }
    if (path.length === 0) {
      // 跟模块
      this.root = newModule
    } else {
      // 子模块
      let parent = path.slice(0, -1).reduce((prev, cur) => {
        return prev._children[cur]
      }, this.root)
      parent._children[path[path.length - 1]] = newModule
    }
    if (rawModule.modules) {
      // 递归
      forEach(rawModule.modules, (childName, module) => {
        this.register(path.concat(childName), module)
      })
    }
  }
}

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
    // 计算模块之间的依赖关系
    this.modules = new ModuleCollection(options)

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
