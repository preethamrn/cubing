<template>
  <v-container class='median'>
    <input type='file' @change='onChooseFile' />
    <v-card>
      <v-card-title>
        RESULTS (note: these aren't official results. make sure to double check before submitting)
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="[
          {text: '#', value: 'num'},
          {text: 'Name', value: 'name'},
          {text: 'Median', value: 'value'},
        ]"
        :options='options'
        :items='tableItems'
        :search='search'
        hide-default-footer
      >
        <template v-slot:item="props">
          <tr>
            <td>{{ props.item.num }}</td>
            <td class="text-xs-left">{{ props.item.name }}</td>
            <td class="text-xs-left">{{ props.item.value.toFixed(2) }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'median',
  data () {
    return {
      solveCount: 25,
      results: {},
      search: '',
      options: {
          descending: true,
          sortBy: 'num',
          itemsPerPage: -1,
        },
    }
  },
  methods: {
    onChooseFile (event) {
      if (typeof window.FileReader !== 'function')
        throw ("The file API isn't supported on this browser.")
      let input = event.target
      if (!input)
        throw ("The browser does not properly implement the event object")
      if (!input.files)
        throw ("This browser does not support the `files` property of the file input.")
      if (!input.files[0])
        return undefined
      let file = input.files[0]
      let fr = new FileReader()
      fr.onload = (event) => {
        this.parseResult(event.target.result)
      }
      fr.readAsText(file)
    },
    parseResult (result) {
      try {
        let res = JSON.parse(result)

        if (res.properties === undefined || res.properties.sessionData === undefined) throw {name: 'FormatError', message: 'missing properties'}
        let sessionData = JSON.parse(res.properties.sessionData)
        let sessionNames = Object.entries(sessionData).reduce((acc, [key, value]) => {
          acc[parseInt(key)] = value.name
          return acc
        }, [])

        Object.entries(res).forEach(([key, value]) => {
          if (key === 'properties') return
          let matches = key.match(/session(\d+)/)
          if (!matches) throw {name: 'FormatError', message: 'invalid key ' + key}
          let sessionName = sessionNames[parseInt(matches[1])]

          value = value.slice(value.length - this.solveCount).map((v, i) => {
            if (!(v instanceof Array)) throw {name: 'FormatError', message: `not Array (${v} ${i} ${key})`}
            if (!(v[0] instanceof Array)) throw {name: 'FormatError', message: `no sub-Array (${v[0]} ${i} ${key})`}

            if (v[0][0] === -1) return Infinity // DNF
            return Math.floor((v[0][1] + v[0][0])/10) // time + penalties
          })
          value.sort((a,b) => a - b)
          this.$set(this.results, matches[1], {
            name: sessionName,
            median: value[Math.floor(Math.min(this.solveCount, value.length)/2)],
          })
        })
      } catch (e) {
        // eslint-disable-next-line
        console.error(e)
        if (e instanceof SyntaxError) alert('The inputed file has invalid syntax.')
        if (e.name === 'FormatError') alert('The inputed file has invalid format: ' + e.message)
      }
    },
  },
  computed: {
    tableItems () {
      return Object.entries(this.results).map(([key, value]) => ({num: key, name: value.name, value: value.median/100}))
    }
  }
}
</script>

<style>
</style>
