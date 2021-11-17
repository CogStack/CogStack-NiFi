<template>
<!-- eslint-disable  -->
  <div>
    <Header/>
    <section class="hero is-info is-fullheight">
      <div class="hero-body">
        <div class="">
          <p class="title">
            Welcome to Cogstack Hub 
          </p>
          <p class="subtitle">
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
/*eslint-disable*/
import Header from '@/components/Header.vue';
import router from '../router'

export default {
  name: 'Home',
  components: {
    Header,
  },

  props: {
    msg: 'Hi',
  },

  methods: {

    data: function () {
      router.push('/data');
    },
    modelzoo: function () {
      router.push('/modelzoo');
    },
    trainmodels: function () {
      router.push('/trainmodels');
    },

  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, 20rem);
  grid-gap: 1.5rem;
  justify-content: space-between;
  align-content: flex-start;
}

</style>
