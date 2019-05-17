<template>
  <v-layout row wrap id='about-me' class='anchor-content aboutme-content'>
    <v-flex offset-md3 offset-xs1 xs10>
      <span class='anchor-header'>ABOUT ME</span>
      <div class='header-underline'></div>
    </v-flex>
    <v-flex offset-md3 offset-xs1 md6 xs10>
      <span class='anchor-text'>
         PAST: I started programming sometime between 5th and 10th grade depending on what you call programming, gaining various levels of experience in VB6, C++, Java, Python, HTML, Javascript, and PHP. After a bout in competitive programming, a few internship, and some web and app development, I graduated from UCLA with a GPA of 3.97.<br>
         PRESENT: I currently work on Uber's Storage Platform Infrastructure using Go, Java, Javascript and technology like Cassandra, Schemaless, Hive, and Kafka. Outside of work I enjoy cubing, swing dancing, bouldering, and video making.<br>
         FUTURE: I'd like to explore new fields and learn more about Machine Learning and App Development. I also want to teach others more about programming and inspire people to get excited and start coding just like I was when I was young.<br>
      </span>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'AboutMeCard',
  data: () => ({

  })
}
</script>

<style scoped>
.aboutme-content {
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
</style>
