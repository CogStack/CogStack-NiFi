<template>
<!-- eslint-disable  -->
<div>
    <!-- this is for a view of all of the patients labels (set) -->
    <div class="card" id="patient-summary">
        <header class="card-header">
            <p class="card-header-title">
            Patient Summary 
            </p>
        </header> 
        <div class="card-content" >
            <div class="columns">
                <div class="column is-one-quarter">
                    <div class="has-text-left"><strong>primarypatientmrn</strong></div>
                </div>
                <div class="column has-text-left"> {{ patient }}</div>
            </div>
            <!-- <div class="columns">
                <div class="column is-one-quarter">
                    <div class="has-text-left"><strong>nlp labels</strong></div>
                </div>
                <div class="column has-text-left">

                    <b-field grouped group-multiline>
                        <div class="control">
                            <b-switch v-model="groupConcepts">Show unique concepts</b-switch>
                        </div>
                    </b-field>

                    <b-tabs>
                        <b-tab-item v-if="!groupConcepts" label="All Concepts">
                                        <b-table
                                            :data="patientLevelAnnotations.span_annotations"
                                            :columns="columnsConcepts"
                                            :sticky-header="stickyHeaders"
                                            :selected.sync="selectedMeta"
                                            focusable>
                                        </b-table>
                        </b-tab-item>
                        <b-tab-item v-if="groupConcepts" label="Grouped Concepts">
                                        <b-table
                                            :data="patientLevelAnnotations.grouped_span_annotations"
                                            :columns="columnsGroupedConcepts"
                                            :sticky-header="stickyHeaders"
                                            :selected.sync="selected"
                                            focusable>
                                        </b-table>
                        </b-tab-item>
                        <b-tab-item v-if="selected.length != 0 && groupConcepts" label="Selected">
                                        <b-table
                                            :data="selected.meta_data"
                                            :columns="columnsmetadata"
                                            :sticky-header="stickyHeaders"
                                            :selected.sync="selectedMeta"
                                            focusable>
                                        </b-table>
                        </b-tab-item>
                        <b-tab-item v-if="selectedMeta.length != 0"  label="Document">
                            <div class="card-content">
                            <div class="content">
                                <span v-for="(token,token_idx) in tokens[selectedMeta.document_idx] ">
                                    <span v-html="searchresults[selectedMeta.document_idx]._source['note'].slice(token['start'],token['end'])" v-if="selectedMeta.start == token['start'] && selectedMeta.end == token['end']"  class="tag is-warning chosen is-medium" />
                                    <span v-html="searchresults[selectedMeta.document_idx]._source['note'].slice(token['start'],token['end'])" v-else />{{ ' ' }}
                                </span>
                            </div>
                            </div>
                        </b-tab-item>
                    </b-tabs>
                </div>
            </div> -->
        </div>
    </div>

</div>

   

</template>

<script>
/*eslint-disable*/
import DocumentsView from '@/components/DocumentsView/DocumentsView.vue'

export default {
  name: 'PatientView',

  components: {
    DocumentsView,
  },

  props: {
      patient: String,
      searchresults: [],
  },

  data() {

    return {
                columnsConcepts: [
                    {
                        field: 'nlp_concept_ids',
                        label: 'concept_id',
                        searchable: true,
                    },
                    {
                        field: 'nlp_pretty_names',
                        label: 'name',
                        searchable: true,
                    },
                    {
                        field: 'date',
                        label: 'date',
                        searchable: true,
                        sortable: true,
                    },
                    {
                        field: 'priority',
                        label: 'priority',
                        searchable: true,
                        sortable: true,
                    }
                ],
                columnsGroupedConcepts: [
                    {
                        field: 'nlp_concept_ids',
                        label: 'concept_id',
                        searchable: true,
                    },
                    {
                        field: 'nlp_pretty_names',
                        label: 'name',
                        searchable: true,
                    },
                    {
                        field: 'priority',
                        label: 'priority',
                        searchable: true,
                        sortable: true,
                    }
                ],
                columnsmetadata: [
                    {
                        field: 'document_idx',
                        label: 'doc no',
                        searchable: true,
                    },                   
                    {
                        field: 'date',
                        label: 'date',
                        searchable: true,
                        sortable: true,
                    },
                    {
                        field: 'document_type',
                        label: 'document_type',
                        searchable: true,
                    },
                    {
                        field: 'nlp_pretty_names',
                        label: 'nlp_pretty_name',
                        searchable: true,
                    },
                    {
                        field: 'nlp_concept_ids',
                        label: 'nlp_concept_id',
                        searchable: true,
                    },
                ],
                stickyHeaders: true,
                selectMode: 'multi',
                selected: [],
                selectedMeta: [],
                groupConcepts: false,
    };
  },

  methods: {

      displayEntity(token, index) {
        document.getElementById('displayedprettyname_' + index).innerHTML = token['nlp_pretty_names'];
        document.getElementById('displayedconceptid_' + index).innerHTML = token['nlp_concept_ids'];
        document.getElementById('displayedmodelid_' + index).innerHTML = token['nlp_modelids'];
        document.getElementById('notification_' + index).classList.remove("is-hidden");
      },

      hideDisplayEntity(index) {
        document.getElementById('notification_' + index).classList.add("is-hidden");
      },

      onRowSelected(items) {
        alert('hello')
      },

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped > 

</style>

