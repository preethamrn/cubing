<template>
  <v-layout row wrap id='title' class='title-card'>
    <v-flex offset-md2 offset-xs0 md3 xs12 text-xs-center>
      <v-avatar
        :size='300'
        style='margin-top: 33%'
        color='grey lighten-4'
      >
        <img src='../../assets/profile-pic.jpg' alt='avatar'>
      </v-avatar>
    </v-flex>
    <v-flex class='title-all' md7 xs12 text-xs-center text-md-left>
      <div class='title-name'>
        Preetham Narayanareddy
      </div>
      <div class='title-text'>
        <span class='red-code'>printf</span>(<span class='green-code'>"I am a <span class='blue-code'>%s</span>"</span>, <br>
        &nbsp; user.recruiter<br>
        &nbsp; ? <a href='#about-me'><span class='green-code link'>"Software Engineer"</span></a><br>
        &nbsp; : <a href='https://www.youtube.com/channel/UC7tKYiFtH_6HCBD4hh7hTWw' target='_blank'><span class='green-code link'>"Video Maker"</span></a><br>
        )
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'TitleCard',
  data: () => ({

  })
}
</script>

<style scoped>
.layout.title-card {
  background-image: url('../../assets/intro-bg2.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  min-height: 100vh;
  width: 100vw;
}
.title-all {
  background-color: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 1);
  margin-top: 8%;
  margin-bottom: 8%;
  padding-left: 1%;
}
.title-name {
  font-size: 5vw;
  font-weight: 700;
  letter-spacing: 2px;
  font-family: "Monument", sans-serif !important;
}
.title-text {
  font-size: 3em;
  font-family: "Lucida Console", Monaco, monospace !important;
}

@media only screen and (max-width: 1080px) {
  .title-name {
    font-size: 2.8em;
    margin-top: 0%;
    width: 100%;
    font-weight: 700;
    letter-spacing: 2px;
    font-family: "Monument", sans-serif !important;
  }
  .title-text {
    color: rgba(255, 255, 255, 1);
    text-align: left !important;
    margin-left: 10%;
    font-size: 2em;
    padding-bottom: 15%;
    font-family: "Lucida Console", Monaco, monospace !important;
  }
}

.link {
  text-decoration: underline;
}
.red-code {
  color: rgb(255, 70, 70);
}
.green-code {
  color: rgb(142, 255, 142);
}
.blue-code {
  color: rgb(255, 217, 0);
}
</style>
