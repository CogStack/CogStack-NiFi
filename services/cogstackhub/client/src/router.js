/* eslint-disable */ 
import Vue from 'vue';
import Router from 'vue-router';
import Home from './pages/Home.vue';
import Login from './pages/Login.vue';
import Data from './pages/Data.vue';
import DataSearch from '@/pages/DataSearch';
import ModelZoo from './pages/ModelZoo.vue';
import TrainModels from './pages/TrainModels.vue';
import ModelViewer from './pages/ModelViewer.vue'

Vue.use(Router);

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      alias: '/',
      name: 'Login',
      component: Login,
      meta: {
          requiresAuth: false
      }
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
          requiresAuth: true
      }
    },
    {
      path: '/data',
      name: 'Data',
      component: Data,
      meta: {
          requiresAuth: true
      }
    },
    {
      path: '/datasearch/:index',
      name: 'DataSearch',
      component: DataSearch,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/modelzoo',
      name: 'ModelZoo',
      component: ModelZoo,
      meta: {
        requiresAuth: true
      }      
    },
    {
      path: '/modelzoo/:modelid',
      name: 'ModelViewer',
      component: ModelViewer,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/trainmodels',
      name: 'TrainModels',
      component: TrainModels,
      meta: {
        requiresAuth: true
      }      
    },
  ],
});

router.beforeEach((to , from, next) => {
  console.log('checking route')
  if (to.matched.some(route => route.meta.forceRefresh)) {
      localStorage.setItem('forceRefresh', 'refresh')
  }

  if (to.matched.some(route => route.meta.requiresAuth)) {
      if (localStorage.getItem('jwt') == null || localStorage.getItem('jwt') == 'undefined' || localStorage.getItem('jwt') == ''){
          next({
              name:'Login',
  params: { nextUrl: to.fullPath}
    })
} else{
          next()
}
  } else{
      console.log('rejected going to login');
next()
  }
})

export default router
