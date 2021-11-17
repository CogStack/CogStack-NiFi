

import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import store from '../store/index';
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy)
Vue.config.productionTip = false;


// apply interceptor on response
axios.interceptors.response.use(function (response) {
  if (response.status === 200 && response.data.message) {
    response.data.message
  }
  if (response.status === 201 && response.data.message) {
    response.data.message
  }
  return response
}, function (error) {
  // if has response show the error
  if (error.response) {
    if (error.response.status === 400 || error.response.status === 404) {
      // if one of these calls happens need to log the error somewhere (popup message perhaps?)
      console.log('unsuccessful')
      store.dispatch('auth/logout')  
    }
    if (error.response.status === 401) {
      // if we get a 401 request a new token if possible
      console.log('token expired. requesting new one')
      store.dispatch('auth/refreshtoken')
    }
  }
  return error 
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
