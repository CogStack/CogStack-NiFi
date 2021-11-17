<template>
    <nav class="navbar is-mobile is-primary text-center">
      <div class="navbar-brand">
        <a href="/home" style="heigh">
          <img src="../assets/cogstack.png" width="100" height="200">
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" href="/data">
            Data
          </a>
          <a class="navbar-item" href="/modelzoo">
            Models
          </a>
          <a class="navbar-item" href="/trainmodels">
            Model Trainer
          </a>
          <a class="navbar-item" href="href=/data">
            Model Benchmarker
          </a>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a class="button is-primary" @click="logout()">
               <strong> {{ username}} </strong>
            </a>
          </div>
        </div>
        <div class="navbar-item">
          <strong> beta version</strong>
        </div>
      </div>

    </nav>
</template>



<script>
/*eslint-disable*/
	import { mapGetters } from 'vuex'
	
	export default {
        
        data() {
            return {
            username: localStorage.getItem('user'),
            };
        },

		computed: {
			...mapGetters('auth', {
				isAuth: 'isAuthenticated',
			})
        },
        
        methods: {
            logout: function () {
            this.$store.dispatch('auth/logout');
            }
        },
	}
</script>

<style>

img {
  height: 5px;
  margin: 5px;
}
</style>