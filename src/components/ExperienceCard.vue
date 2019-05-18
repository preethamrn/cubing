<template>
  <v-layout row wrap id='experience' class='anchor-content experience-content'>
    <v-flex offset-md3 offset-xs1 xs10>
      <span class='anchor-header'>EXPERIENCE</span>
      <div class='header-underline'></div>
    </v-flex>
    <v-flex offset-md3 offset-xs1 md6 xs10>
      <v-timeline align-top dense>
        <v-timeline-item color="pink" small>
          <v-layout pt-3>
            <v-flex xs3>
              <strong>Jan 2019 - Present</strong>
            </v-flex>
            <v-flex>
              <strong>Uber Software Engineer</strong>
              <div class="caption">Working on the Storage Platform team in Uber Infrastructure. 
                Built workflows to streamline datastore provisioning for various storage engines and use cases. 
                Created a backend gateway and portal UI to interface with datastores.
              </div>
            </v-flex>
          </v-layout>
        </v-timeline-item>
        <v-timeline-item color="pink" small>
          <v-layout pt-3>
            <v-flex xs3>
              <strong>Summer 2017, Summer 2018</strong>
            </v-flex>
            <v-flex>
              <strong>Uber Software Engineer Intern</strong>
              <div class="caption">Working in Uber Infrastructure. 
                Built a metrics aggregation workflow and dashboard to track the storage usage, trends, and query patterns for various teams and Cassandra datastores. 
                Integrated an incremental monitoring and auditing system for Uber’s Kafka pipeline which handles up to 13 million messages/sec.
              </div>
            </v-flex>
          </v-layout>
        </v-timeline-item>
        <v-timeline-item color="pink" small>
          <v-layout pt-3>
            <v-flex xs3>
              <strong>Summer 2016</strong>
            </v-flex>
            <v-flex>
              <strong>Symantec Software Engineer Intern</strong>
              <div class="caption">Worked on the Symantec STAR team. 
                Generated features from big data telemetry logs to train a classifier using machine learning to distinguish between targeted and 
                non-targetted threats with 65% recall and 97% precision using technologies like Hadoop, Hive, Python (pandas and scikit).
              </div>
            </v-flex>
          </v-layout>
        </v-timeline-item>
        <v-timeline-item color="pink" small>
          <v-layout pt-3>
            <v-flex xs3>
              <strong>2015-2018</strong>
            </v-flex>
            <v-flex>
              <strong>University of California, Los Angeles</strong>
              <div class="caption"> 
                Graduated with 3.97 GPA in a B.S. in Computer Science. 
                Worked as a learning assistant for an Intro to C++ Programming class. Help the professor with creating problem sets and holding office hours and discussions.
                Worked as a grader for Computer Networks: Physical Layer.
              </div>
            </v-flex>
          </v-layout>
        </v-timeline-item>
      </v-timeline>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'ExperienceCard',
  data: () => ({

  })
}
</script>

<style scoped>
.experience-content {
  background-color: #1b1829
}
.anchor-header {
  font-size: 3em;
  font-family: "Muli", Arial, Verdana, sans-serif;
  font-weight: 900;
  font-style: italic;
  color: rgba(255, 255, 255, 1)
}
.anchor-content {
  font-size: 1.5em;
  font-weight: 650;
  font-family: "Muli", Arial, Verdana, sans-serif;
  color: rgba(255, 255, 255, 1)
}

.theme--light.v-timeline:before {
  background: rgba(255, 255, 255, 1);
  left: 17px;
  width: 4px;
}
</style>
