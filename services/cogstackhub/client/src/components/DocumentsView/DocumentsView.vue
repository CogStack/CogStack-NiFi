<template>
<!-- eslint-disable  -->
<div>
    <div class="card has-text-left" v-for="(result, id) in searchresults" :key="result._id">
        <DocumentView :id="id" :result="result" :document_meta_data="meta_data[id]" :index="index"/>
    </div>
</div>
</template>

<script>
/*eslint-disable*/
import DocumentView from '@/components/DocumentsView/DocumentView.vue'

export default {
  name: 'DocumentsView',

  components: {
    DocumentView,
  },

  props: {
      searchresults: [],
      meta_data: [],
      documentlevelannotations: [],
      index: '',
      test: String,
  },

  data() {
    return {
      root_api: process.env.VUE_APP_URL,
    };
  },

  methods: {

  },

  created() {
    console.log(this.tokens)
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


