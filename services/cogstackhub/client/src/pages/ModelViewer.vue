<template>
<!-- eslint-disable  -->
  <div>
    <Header/>
    <div class="container">
        <div class="section">
            <p class="title is-2">{{ modelcard['model_name']}} 
                <span v-if="modelonline" class="tag is-success">online</span> 
                <span v-else="modelonline" class="tag">offline</span> 
            </p>
        </div>

        <div class="tabs is-centered">
        <ul>
            <li id='modeltab' class="is-active"><a @click="gotomodeltab()">Model Info</a></li>
            <li v-if="modelonline" id='usemodeltab'><a @click="gotousemodeltab()">Use Model</a></li>
        </ul>
        </div>

        <!-- this is for the model tab  -->
        <div class="tile is-ancestor" v-if="currentTab === 'modelinfo'">
            <div class="tile is-parent is-vertical has-text-left is-4">
                <div class="tile is-child box notification is-info">
                    <p class="title is-3 has-text-centered"> Model Card</p>
                    <p class="title is-5"><strong>model type: </strong></p> 
                    <p class="title is-6"><code>{{ }}</code></p>
                    <p class="title is-5"><strong>&#x1F474; parent model: </strong></p> 
                    <p class="title is-6" ><code>{{  }}</code></p>
                    <p class="title is-5"><strong>training datasets: </strong></p>
                    <table class="table is-bordered">
                        <thead>
                        <tr>
                            <th><strong>unsupervised</strong></th>
                            <th><strong>superivsed </strong></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td><p class="title is-6"><code>{{  }}</code></p></td>
                            <td><p class="title is-6"><code>{{  }}</code></p></td>
                        </tr>
                        </tbody>
                    </table>

                    <p class="title is-5"><strong> &#x1F3C6; performance: </strong></p>
                    <table class="table is-bordered">
                            <thead>
                            <tr>
                                <th><strong>f1</strong></th>
                                <th><strong>precision </strong></th>
                                <th><strong>recall </strong></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><p class="title is-6"><code>{{  }}</code></p></td>
                                <td><p class="title is-6"><code>{{  }}</code></p></td>
                                <td><p class="title is-6"><code>{{  }}</code></p></td>
                            </tr>
                            </tbody>
                        </table>

                    <p class="title is-5"><strong>ontology: </strong></p>
                    <table class="table is-bordered">
                            <thead>
                            <tr>
                                <th><strong>name</strong></th>
                                <th><strong>version </strong></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><p class="title is-6"><code>{{ }}</code></p></td>
                                <td><p class="title is-6"><code>{{  }}</code></p></td>
                            </tr>
                            </tbody>
                        </table>

                    <p><strong>meta-models: </strong> <code>{{  }}</code></p>
                </div>
            </div>

            <div class="tile is-parent is-vertical has-text-left is-8">
                <p class="title is-3 has-text-centered"> Try Out Model</p>
                <p>
                </p>                
                <section>
                    <b-field>
                        <b-input v-if="modelonline" maxlength="" type="textarea" v-model="texttosendtomodel" placeholder="paste your text here"></b-input>
                        <b-input v-else maxlength="" type="textarea" placeholder="paste your text here" disabled></b-input>
                    </b-field>
                    <div class="buttons">
                        <b-button v-if="modelonline" type="is-primary" expanded @click="trymodel()">Process with model</b-button>
                        <b-button v-else type="is-primary" expanded disabled>Process with model</b-button>

                    </div>
                </section>
                <section>
                    <pre>
                    <code>
                        {{ this.annotationfromodel }}
                    </code>
                    </pre>

                </section>
            </div>
        </div>

        <!-- this is for the data application tab -->
        <div v-else> 
            <div class="columns is-centered"> 
                <div class="column is-two-thirds is-centered"> 
                    <article class="panel is-primary">
                    <p class="panel-heading">
                        Apply Model to Dataset
                    </p>

                    <div class="panel-block">
                        <div class="select is-fullwidth">
                            <select id="selecteddataset">
                                <option>Select dataset</option>
                                <option v-for="index in elasticindices"> {{index}}</option>
                            </select>
                        </div>
                    </div>

                    <div class="panel-block">
                        <button id="applmodelbutton" class="button is-fullwidth" @click="applymodeltodataset()">
                        Apply {{ modelname}} to dataset
                        </button>
                    </div>
                    <div v-if="modelprocessing" class="panel-block">
                            <progress class="progress is-small is-primary" max="100">15%</progress>
                    </div>
                    <div v-if="modelruncompleted" class="notification is-success">
                        <button class="delete" @click="hidesuccessmessgage()"></button>
                            Your dataset has been annotated. Visit your data <a @click="gotodataset()">here</a>
                        </div>
                    </article>
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
  name: 'ModelViewer',

  components: {
    Header,
  },


  data() {
    return {
        modelcard: {},
        currentTab: 'modelinfo',
        datasearchtext: "",
        texttosendtomodel: "",
        annotationfromodel: "",
        elasticindices: [],
        modelruncompleted: false,
        modelprocessing: false,
        root_api: process.env.VUE_APP_URL,        
    };
  },

  methods: {

      fetchmodelcard() {
        let path = 'http://' + this.root_api  + ':5001/fetchmodelcard';
        axios.post(path, {'modelid': this.modelid, 'index': this.index}, {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            this.modelcard = res.data.modelcard
            console.log('model fetch result: ',this.modelname)
        })
        .catch((error) => {
            console.error(error);
        });
      },

      gotomodeltab() {
          this.currentTab = 'modelinfo';
          document.getElementById("usemodeltab").classList.remove('is-active');
          document.getElementById("modeltab").classList.add('is-active');
      },

      gotousemodeltab() {
          this.currentTab = 'modeluse';
          document.getElementById("modeltab").classList.remove('is-active');
          document.getElementById("usemodeltab").classList.add('is-active');
      },

      gotodataset() {
          var selecteddataset = document.getElementById("selecteddataset").value;

          router.push({ name: 'DataSearch', params: { index: selecteddataset }});
      },

      searchindices() {
        let path = 'http://' + this.root_api  + ':5001/getelasticindices';

        axios.post(path, {'searchstring': this.datasearchtext}, {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            console.log(res.data)
            this.elasticindices = res.data.indices
        })
        .catch((error) => {
            console.error(error);
        });
      },

      applymodeltodataset() {
        var selecteddataset = document.getElementById("selecteddataset").value;
        this.modelprocessing = true;
        let path = 'http://' + this.root_api  + ':5001/annotatenoteswithmodel';

        axios.post(path, {'selecteddataset': selecteddataset, 'modelid': this.modelid}, {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            console.log('finished')
                this.modelprocessing = false;
                this.modelruncompleted = true
        })
        .catch((error) => {
            console.error(error);
        });
      },

      hidesuccessmessgage() {
            this.modelruncompleted = false
      },

      trymodel() {
        let path = 'http://' + this.root_api  + ':5001/annotatesinglenotewithmodel';
        axios.post(path, {'modelid': this.modelid, 'text': this.texttosendtomodel}, {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            var results = res.data.results
            console.log('model fetch result: ', results)
            this.annotationfromodel = results
        })
        .catch((error) => {
            console.error(error);
        });          
      },
  },

  created() {
    this.modelid = this.$route.params.modelid;
    this.modelonline = this.$route.params.modelonline;
    this.fetchmodelcard();
    this.searchindices();
  },

};
</script>

<style scoped>
div.container {
      margin-top: 30px;
    }

</style>
