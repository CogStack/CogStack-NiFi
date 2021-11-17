<template>
<!-- eslint-disable  -->
  <div>
    <Header/>
    <div class="container">

    <div class="columns is-centered"> 
      <div class="column is-two-thirds is-centered"> 
        <article class="panel is-primary">
        <p class="panel-heading">
            Data Sources
        </p>
        <p class="panel-tabs">
            <a class="is-active">Indexed Data</a>
            <!-- <a>Annotations</a> -->
        </p>
        <div class="panel-block">
            <p class="control has-icons-left">
            <input class="input is-primary" @input="searchindices()" v-model="searchtext" type="text" placeholder="Search for dataset, e.g. mimic">
            <span class="icon is-left">
                <i class="fa fa-search" aria-hidden="true"></i>
            </span>
            </p>
        </div>

        <div v-for="index in elasticindices" :key="index">
            <a class="panel-block" @click="datasearch(index)">
            <span class="panel-icon">
            <i class="fa fa-book" aria-hidden="true"></i>
            </span>
                {{index}}
            </a>
        </div>
        </article>
      </div> 

      <div class="column is-one-fith is-centered"> 

        <div class="block">
        Upload your own data to Cogstack 
        </div>
        <div class="block"> 
          <input class="input" type="text" placeholder="dataset name" style="width: 40%;" @input="searchindices(name)" v-model="newindexname" >
        </div>

        <div class="block">
          <div class="file is-info is-centered is-light">
            <label class="file-label">
              <input id="file" ref="file" type="file" class="file-input" name="resume" v-on:change="handleFileUpload()">
              <span class="file-cta">
                <span class="file-icon">
                    <i class="fa fa-upload"></i>
                </span>
                <span class="file-label">
                  Upload csv…
                </span>
              </span>
              <span class="file-name" v-if="file != ''" >
                {{ file.name }}
              </span>
            </label>
          </div>
        </div>
        <div class="block">
          <button class="button is-danger is-light" v-if="file != ''" @click="submitFile()">
            submit
          </button>
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
  name: 'Data',
  components: {
    Header,
  },

  data() {
    return {
        elasticindices: [],
        searchtext: "",
        file: "",
        newindexname: "",
        root_api: process.env.VUE_APP_URL,
    };
  },

  methods: {
      searchindices() {

        const path = 'http://' + this.root_api + ':5001/getelasticindices';

        axios.post(path, {'searchstring': this.searchtext}, {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            console.log(res.data)
            this.elasticindices = res.data.indices
        })
        .catch((error) => {
            console.error(error);
        });
      },

      datasearch(index) {
        router.push({ name: 'DataSearch', params: { index: index }})
      },

      handleFileUpload(){
        this.file = this.$refs.file.files[0];
        console.log(this.file)
      },

      submitFile() {
        console.log('uploading file..')
        let formData = new FormData();
        formData.append('file', this.file);
        formData.append('index_name', this.newindexname)

        const path = 'http://' + this.root_api  + ':5001/uploaddataset';

        axios.post(path, formData, {headers: {'Content-Type': 'multipart/form-data', 'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
          console.log('SUCCESS!!');
          this.searchtext= ''
          this.searchindices()
          this.file = ''
        })
        .catch(function(){
          console.log('FAILURE!!');
        });

      },

  },

  created() {
      this.searchindices();
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div.container {
      margin-top: 30px;
    }
</style>
