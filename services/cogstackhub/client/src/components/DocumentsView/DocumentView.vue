<template>
<!-- eslint-disable  -->
<div>

  <header class="card-header">
    <div class="card-header-title">
      <div class="" :id="'notification_' + id" >
        <p><strong>document id: </strong> {{result._id}}</p>
        <div v-for="(meta_field,meta_idx) in document_meta_data"> 
          <strong>{{ meta_idx }}: </strong> {{ meta_field }}
        </div>
        <div><strong>document level annotations:</strong></div>
        <!-- <span v-for="(doc_annotation, doc_annotation_idx) in documentlevelannotations[id]" style="padding-right:5px"> 
            <span :id="document_index + '_' + doc_annotation_idx"  class="tag is-info chosen is-medium" @click="displayEntity(doc_annotation, id)">
                {{ doc_annotation['nlp_pretty_names'] }}
            </span>
        </span> -->
      </div>
    </div>
    <a class="card-header-icon card-toggle" @click="showDocument(result._id, id)">
      <i class="fa fa-angle-down"></i>
    </a>
  </header>

  <div class="card-content is-hidden" :id="'cardcontent_' + id">
    <div class="content">
        <span v-for="(token,token_idx) in span_annotations">
          <span v-if="token['annotated']">
            <b-tooltip position="is-top" multilined>
              <span v-html="result._source['note'].slice(token['start'],token['end'])" v-if="token['annotated']" :id="index + '_' + token_idx"  class="tag is-info chosen is-medium" />
            <template v-slot:content>
                <div><b>Pretty_name</b>: {{token['nlp_pretty_names']}}</div> 
                <div><b>Concept_id</b>: {{token['nlp_concept_ids']}}</div>
            </template>
            </b-tooltip>
          </span>
          <span v-html="result._source['note'].slice(token['start'],token['end'])" v-else />{{ ' ' }}
        </span>
    </div>
  </div>

</div>

</template>

<script>
/*eslint-disable*/
import axios from 'axios';

export default {
  name: 'DocumentView',

  components: {
  },

  props: {
    id: '',
    result: '',
    document_meta_data: [],
    index: '',
  },

  data() {
    return {
      root_api: process.env.VUE_APP_URL,
      span_annotations: [],
    };
  },

  methods: {

      showDocument(document_idx, id) {
        document.getElementById('cardcontent_' + id).classList.toggle("is-hidden");

        // Retrieve the annotations for this particular document

        let path = 'http://' + this.root_api + ':5001/retrieveAnnotations'
        axios.post(path, {document_idx:document_idx, index: this.index},
                  {headers: {'Authorization': localStorage.getItem('jwt')}})
        .then((res) => {
            this.span_annotations = res.data.span_annotations;
            // Vue.set(this.span_annotations, id, res.data.span_annotations)
            console.log(this.span_annotations)
            console.log('test')
        })
        .catch((error) => {
            console.error(error);
        }); 
      }

  },

  created() {
  },

};
</script>

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
</style>

