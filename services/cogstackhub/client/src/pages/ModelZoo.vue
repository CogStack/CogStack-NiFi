<template>
<!-- eslint-disable  -->
  <div>
    <Header/>
    <div class="container">

      <div class="block">
            <div class="columns">
                <div class="column">
                    <div class="container is-fluid">
                        <div class="cards"> 
                            <button class="button is-large is-fullwidth" v-model="models" v-for="model in models" :key="model.model_name" @click="openmodelviewer(model.model_id, model.online)">
                                <div class="content">
                                  <p class="title is-6">{{ model.model_name}} 
                                    <span class="tag is-primary">{{ model.model_type}}</span>
                                    <span v-if="model.online" class="tag is-success">online</span> 
                                    <span v-else class="tag">offline</span> 
                                  </p> 
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
      </div>

    </div>
 
  </div>
</template>

<script>
/*eslint-disable*/
import axios from 'axios';
import Header from '@/components/Header.vue';
import router from '../router'

export default {
  name: 'ModelZoo',

  components: {
    Header,
  },


  data() {
    return {
        searchtext: '',
        models: [],
        root_api: process.env.VUE_APP_URL,
    };
  },

  methods: {

      fetchmodels() {
        const path = 'http://' + this.root_api  +  ':5001/fetchmodelnames';
        axios.get(path, {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            this.models = res.data.modelnames
            console.log(this.models)
        })
        .catch((error) => {
            console.error(error);
        });
      },

      openmodelviewer(modelid, modelonline) {
        router.push({ name: 'ModelViewer', params: {modelid: modelid, modelonline:modelonline}});
      },
    
  },

  created() {
      this.fetchmodels();
  },

};
</script>

<style scoped>
div.container {
      margin-top: 30px;
    }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, 25rem);
  grid-gap: 1.5rem;
  justify-content: space-between;
  align-content: flex-start;
}
</style>
