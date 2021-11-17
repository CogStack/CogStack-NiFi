<template>
<!-- eslint-disable  -->
  <div>
    <Header/>

    <div class="container">
      <div class="field has-addons">
        <div class="control is-expanded">
          <input class="input is-medium" @keyup.enter="search()" v-model.lazy="searchtext" type="text" placeholder="Type your query here">
        </div>
        <div class="control">
        <span class="select is-medium" @change="warnbetamode()">
          <select>
            <option>kibana query language</option>
            <option>free text search</option>
          </select>
        </span>
        </div>
      </div>

      <div class="block">
            <div class="columns">
              <div class="column is-one-quarter">
              <div class="block has-text-left">
                  <b-switch @input="changetopatientview()">Patient View </b-switch>
              </div>


              <div class="box">
                    <div class="content has-text-left">
                      <h3><strong>Index Name: </strong>{{ index }}</h3>
                      <h3 v-if="patientviewmode">No of patients: {{ hits }}</h3>
                      <h3 v-else>No of documents: {{ hits }}</h3>
                    </div>
              </div>
              <div class="box">
                <div class="content has-text-left">
                    <h3>Filter by:</h3>
                  </div>
                <b-field label="Date Range">
                  <b-datepicker
                      placeholder="Click to select dates..."
                      v-model="dates"
                      range>
                  </b-datepicker>
                  <b-button @click="clearDate">X</b-button>
                </b-field>
                <b-field label="Notetype">
                    <b-select v-model="notetype" placeholder="Choose..." expanded>
                        <option v-for="nt in notetypes" :selected="nt == notetype" :value="nt">{{nt}}</option>
                    </b-select>
                    <b-button @click="clearNotetype">X</b-button>
                </b-field>
                <b-field label="Document ID">
                    <b-input v-model="documentId"></b-input>
                    <b-button @click="clearDocumentId">X</b-button>
                </b-field>
                <b-field label="Patient">
                    <b-input v-model="patientId"></b-input>
                    <b-button @click="clearPatientId">X</b-button>
                </b-field>
                <b-field label="Model">
                    <b-input v-model="model"></b-input>
                    <b-button @click="clearModel">X</b-button>
                </b-field>
                <b-button id="apply_filtering_btn" @click="applyFiltering">Apply</b-button>
              </div>
              </div>
              <div class="column">
                <div class="block">
                  <div class="card" v-if="freetextmessage!= ''">
                    <div class="card-content">
                      <p class="title" id='freetextmessage'>
                        {{ freetextmessage }}
                      </p>
                    </div>
                  </div>
                  <div>
                    <PatientView v-if="patientviewmode" :patient="patient" :searchresults="searchresults"/>  
                    <DocumentsView :test="test" :searchresults="searchresults" :meta_data="meta_data" :documentlevelannotations="documentlevelannotations" :index="index"/>  
                  </div>
                </div>
                
                <div class="block">
                  <nav class="pagination is-centered" role="navigation" aria-label="pagination">
                    <a class="pagination-previous" @click="paginate(pagination.currentPage - 1)">Previous</a>
                    <a class="pagination-next" @click="paginate(pagination.currentPage + 1)">Next</a>
                    <ul class="pagination-list">
                        <li><a class="pagination-link" @click="paginate(1)" :class = "(pagination.currentPage === 1) ? 'is-current':'' ">1</a></li>
                        <span v-if="!pagination.visiblePages.includes(1)" class="pagination-ellipsis">&hellip;</span>
                        
                        <li v-for="pageNo in pagination.visiblePages">
                          <a v-if="pageNo != 1 && pageNo != pagination.noOfPages" class="pagination-link" :class = "(pageNo === pagination.currentPage) ? 'is-current':'' " @click="paginate(pageNo)" >{{pageNo}}</a>
                        </li>

                        <span v-if="!pagination.visiblePages.includes(pagination.noOfPages)" class="pagination-ellipsis">&hellip;</span>
                        <li><a class="pagination-link" @click="paginate(pagination.noOfPages)" :class = "(pagination.noOfPages === pagination.currentPage) ? 'is-current':'' ">{{ pagination.noOfPages }}</a></li>
                      </li>
                    </ul>
                  </nav>
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
import DocumentsView from '@/components/DocumentsView/DocumentsView.vue'
import PatientView from './PatientView/PatientView'
import 'bulma-extensions/bulma-checkradio/dist/css/bulma-checkradio.min.css'

export default {
  name: 'DataSearch',

  components: {
    Header,
    DocumentsView,
    PatientView,
  },


  data() {
    return {
        searchtext: '',
        index: '',
        searchresults: [],
        meta_data: [],
        documentlevelannotations: [],
        hits: 0,
        freetextmode: false,
        patientviewmode: false,
        freetextmessage: '',
        pagination: {
          currentPage: 1,
          visiblePages: [],
          noOfPages: 1,
          resultsperpage: 10,
          noOfVisiblebuttons: 3,
        },
        currentPatentIdx: 0,
        patientLevelAnnotations: {},
        patient: String,
        root_api: process.env.VUE_APP_URL,
        dates: [],
        notetype: '',
        documentId: '',
        patientId: '',
        model: '',
        notetypes: []
    };
  },

  methods: {

      search() {
        let path = 'http://' + this.root_api + ':5001/searchindex';

        if (this.patientviewmode){
          this.searchpatientindex();

        } else{
          this.searchindex();
        }
      },

      searchpatientindex(callback){
        let path = 'http://' + this.root_api + ':5001/searchindexforpatients';

        this.getNoteTypes();

        axios.post(path, {'searchstring': this.searchtext, 'index': this.index, 'pageNo': this.pagination.currentPage, 
                          'resultsperpage': this.pagination.resultsperpage, 'patient_idx': this.pagination.currentPage - 1,
                          'start_date': this.getStartDate(), 'end_date': this.getEndDate(), 'notetype': this.notetype,
                          'document_id': this.documentId, 'patient_id': this.patientId, 'model': this.model},
                  {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            this.searchresults = res.data.results['hits']
            this.hits = res.data.no_patients
            this.meta_data = res.data.meta_data
            this.documentlevelannotations = res.data.document_level_annotations
            this.freetextmessage = res.data.resultmessage
            this.no_patients = res.data.no_patients
            this.patient = res.data.patient
            this.patientLevelAnnotations = res.data.patientLevelAnnotations
            // set pagination variables
            this.initialisepagination()
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
          if (callback != null) {
            callback();
          }
        });
      },

      searchindex(callback) {
        let path = 'http://' + this.root_api + ':5001/searchindex';

        if (this.freetextmode){
          path = 'http://' + this.root_api + ':5001/searchindexfreetext';

        }

        this.getNoteTypes();

        axios.post(path,
                  {
                    'searchstring': this.searchtext,
                    'index': this.index,
                    'pageNo': this.pagination.currentPage,
                    'resultsperpage': this.pagination.resultsperpage,
                    'start_date': this.getStartDate(),
                    'end_date': this.getEndDate(),
                    'notetype': this.notetype,
                    'document_id': this.documentId,
                    'patient_id': this.patientId,
                    'model': this.model
                  },
                  {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            this.searchresults = res.data.results['hits']
            this.hits = res.data.hits
            this.meta_data = res.data.meta_data
            this.freetextmessage = res.data.resultmessage
            
            // set pagination variables
            this.initialisepagination()
        })
        .catch((error) => {
            console.error(error);
        })
        .finally(() => {
          if (callback != null) {
            callback();
          }
        });
      },

      changetopatientview() {
        this.patientviewmode = !this.patientviewmode
        this.search()
      },

      warnbetamode() {
        this.freetextmode = !this.freetextmode
        alert('experimental feature')
      },

      initialisepagination() {

            if (this.patientviewmode){
              this.pagination.noOfPages = this.hits
            } else{
              this.pagination.noOfPages = Math.ceil(this.hits / this.pagination.resultsperpage)
            }
            this.pagination.visiblePages = []

            for (let i = -1 ; i < Math.min(this.pagination.noOfVisiblebuttons, this.pagination.noOfPages) - 1; i++){
              if (this.pagination.currentPage === 1){
                if (i === -1){
                  continue
                }
                else{
                  this.pagination.visiblePages.push(this.pagination.currentPage + i);
                }
              } 
              else if (this.pagination.currentPage === this.pagination.noOfPages) {
                if (i === -1){
                  continue
                }
                else{
                  this.pagination.visiblePages.unshift(this.pagination.currentPage - i);
                }
              }
              else {
                this.pagination.visiblePages.push(this.pagination.currentPage + i)
              }
              console.log(this.pagination.visiblePages, i)
            }
      },

      paginate(newpageNo) {
        if (newpageNo < 1 || newpageNo > this.pagination.noOfPages){
          return
        }
        this.pagination.currentPage = newpageNo
        if (this.patientviewmode){
          this.searchpatientindex();
        } else{
          this.searchindex();
        }
      },

      applyFiltering() {
        let apply_filtering_btn = document.querySelector("#apply_filtering_btn");
        apply_filtering_btn.disabled = true;
        if (this.patientviewmode) {
          this.searchpatientindex(() => {
            apply_filtering_btn.disabled = false;
          });
        } else{
          this.searchindex(() => {
            apply_filtering_btn.disabled = false;
          });
        }
      },

      clearDate() {
        this.dates = [];
      },

      clearNotetype() {
        this.notetype = '';
      },

      clearDocumentId() {
        this.documentId = '';
      },

      clearPatientId() {
        this.patientId = '';
      },

      clearModel() {
        this.model = '';
      },

      getStartDate() {
        let start_date = '01/01/1970';
        if (this.dates !== undefined && this.dates.length > 0) {
          start_date = ('0' + this.dates[0].getDate()).slice(-2) + '/' + ('0' + (this.dates[0].getMonth() + 1)).slice(-2) + '/' + this.dates[0].getFullYear();
        }

        return start_date;
      },

      getEndDate() {
        let end_date = '31/12/2999';
        if (this.dates !== undefined && this.dates.length > 1) {
          end_date = ('0' + this.dates[1].getDate()).slice(-2) + '/' + ('0' + (this.dates[1].getMonth() + 1)).slice(-2) + '/' + this.dates[1].getFullYear();
        }

        return end_date;
      },

      getNoteTypes() {
        let path = 'http://' + this.root_api + ':5001/fetchnotetypes?index=' + this.index;

        axios.get(path,
                  {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            this.notetypes = res.data;
        })
        .catch((error) => {
            console.error(error);
        });
      }
  },

  created() {
    this.index = this.$route.params.index;
    this.searchindex();
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped > 
div.container {
      margin-top: 30px;
    }
div.card {
  margin-bottom: 15px;
}

span.chosen:hover {
  text-decoration: none;
  cursor: pointer;
}

label.unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>

<style lang="sass" scoped>

</style>
