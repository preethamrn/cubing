<template>
  <v-layout row wrap id='title' :style="{ 'background':'url(\'intro-bg2.jpg\') center' }" class='title-card'>
    <v-flex offset-md2 offset-xs0 md3 xs12 text-xs-center>
      <v-avatar
        :size='300'
        style='margin-top: 33%'
        color='grey lighten-4'
      >
        <img src='../assets/profile-pic.jpg' alt='avatar'>
      </v-avatar>
    </v-flex>
    <v-flex md6 xs12 text-xs-center text-md-left>
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
  width: 100vw;
  min-height: 100vh;
}

.title-name {
  color: rgba(255, 255, 255, 1);
  margin-top: 15%;
  font-size: 7em;
  font-weight: 700;
  letter-spacing: 2px;
  font-family: "Monument", sans-serif !important;
}
.title-text {
  color: rgba(255, 255, 255, 1);
  font-size: 3em;
  padding-bottom: 15%;
  font-family: "Lucida Console", Monaco, monospace !important;
}

.red-code {
  color: rgb(255, 70, 70);
}
.green-code {
  color: rgb(64, 255, 64);
}
.link {
  text-decoration: underline;
}
.blue-code {
  color: rgb(94, 94, 255);
}
</style>
