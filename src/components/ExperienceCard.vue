<template>
  <v-layout row wrap id='experience' class='anchor-content experience-content'>
    <v-flex offset-md3 offset-xs1 xs10>
      <span class='anchor-header'>EXPERIENCE</span>
      <div class='header-underline'></div>
    </v-flex>
    <v-flex offset-md3 offset-xs1 md6 xs10>
      <v-timeline align-top dense>
        <div v-for='job in experiences' :key='job.timeRange'>
          <v-timeline-item class='pt-3' color="pink" small>
            <div>
              <div class='timeline-range'>
                <strong>{{ job.timeRange }}</strong>
                <div class='timeline-underline'></div>
              </div>
              <div class='timeline-description'>
                <strong>{{ job.position }}</strong>
                <div class="caption" v-html='job.description'></div>
              </div>
            </div>
          </v-timeline-item>
        </div>
      </v-timeline>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'ExperienceCard',
  data: () => ({
    experiences: [
      {
        timeRange: 'Jan 2019 - Present',
        position: 'Uber Software Engineer',
        description: 'Working on the Storage Platform team in Uber Infrastructure. \
                Built workflows to streamline datastore provisioning for various storage engines and use cases. \
                Created a backend gateway and portal UI to interface with datastores.'
      },
      {
        timeRange: 'Summer 2017, Summer 2018',
        position: 'Uber Software Engineering Intern',
        description: 'Working in Uber Infrastructure. \
                Built a metrics aggregation workflow and dashboard to track the storage usage, trends, and query patterns for various teams and Cassandra datastores. \
                Integrated an incremental monitoring and auditing system for Uber’s Kafka pipeline which handles up to 13 million messages/sec.'
        
      },
      {
        timeRange: 'Summer 2016',
        position: 'Symantec Software Engineering Intern',
        description: 'Worked on the Symantec STAR team. \
                Generated features from big data telemetry logs to train a classifier using machine learning to distinguish between targeted and \
                non-targetted threats with 65% recall and 97% precision using technologies like Hadoop, Hive, Python (pandas and scikit).'
      },
      {
        timeRange: '2015 - 2018',
        position: 'University of California, Los Angeles',
        description: 'Graduated with 3.97 GPA in a B.S. in Computer Science. \
                Worked as a learning assistant for an Intro to C++ Programming class. Help the professor with creating problem sets and holding office hours and discussions.\
                Worked as a grader for Computer Networks: Physical Layer.'
      },
    ]
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

.timeline-range {
  width: 150px;
  margin-right: 50px;
  float: left;
}
.timeline-description {
  float: left;
  width: 66%;
}
.timeline-underline {
  height: 3px;
  width: 100px;
  background-color: rgba(255, 255, 255, 0.87);
  right: 5px;
  margin-bottom: 16px;
}
</style>
