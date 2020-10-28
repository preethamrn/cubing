<template>
  <div class="algtrainer">
    <button @click='connect'>Connect</button>
    <div id='twisty'></div>
  </div>
</template>

<script>
import { Sequence } from "cubing/alg"
import {
  connect,
  debugKeyboardConnect,
} from "cubing/bluetooth"
import { TwistyPlayer } from "cubing/twisty"

async function asyncSetup(twistyPlayer) {
  console.log("asyncSetup");
  const keyboard = await debugKeyboardConnect(twistyPlayer); // TODO: attach to viewer only?
  console.log("keyboard", twistyPlayer, keyboard);
  keyboard.addMoveListener((e) => {
    console.log("listener", e);
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
}

export default {
  name: "algtrainer",
  data: () => ({
    twistyPlayer: null,
  }),
  methods: {
    async connect () {
      const acceptAllDevices = false
      window.puzzle = await connect({ acceptAllDevices });
      window.puzzle.addMoveListener((e) => {
        this.twistyPlayer.experimentalAddMove(e.latestMove);
      });
      window.puzzle.addOrientationListener(() => {
        // TODO
        // const { x, y, z, w } = e.quaternion;
        // this.twistyPlayer
        //   .experimentalGetPlayer()
        //   .cube3DView.experimentalGetCube3D()
        //   .experimentalGetCube()
        //   .quaternion.copy(new Quaternion(x, y, z, w));
        // this.twistyPlayer
        //   .experimentalGetAnim()
        //   .experimentalGetScheduler()
        //   .singleFrame();
      });
    }
  },
  mounted () {
    document.addEventListener('keydown', function(e) {
      console.log(e);
    })
    this.twistyPlayer = new TwistyPlayer({ alg: new Sequence([]) });
    document.querySelector('#twisty').appendChild(this.twistyPlayer);
    
    asyncSetup(this.twistyPlayer);
    window.puzzle = null;
  },
}
</script>

<style scoped>

</style>
