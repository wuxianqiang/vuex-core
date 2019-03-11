<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div>
      {{ $store.state.count }}
      {{ $store.state.a.a }}
      {{ $store.state.a.b.b }}
    </div>
    <button @click="handleClick">
      +
    </button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  created () {
    console.log(this)
  },
  methods: {
    handleClick () {
      // this.$store.commit('setCount')
      this.$store.dispatch('updateCount')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
