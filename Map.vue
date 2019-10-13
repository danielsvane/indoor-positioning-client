<template>
  <div id="map"></div>
</template>

<script>
import mapbox from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode'
import { subArrayToGeoJson, arrayToGeoJson, arrayToGeoJsonPolygon } from './imports/geo.js'

export default {
  props: {
    gates: Array,
    polygon: Array,
    trackers: Array,
    points: Array,
    testPoints: Array,
    predictedPoints: Array
  },
  data () {
    return {
      map: null,
      draw: null
    }
  },
  watch: {
    trackers (trackers) {
      this.map.getSource('trackers').setData(arrayToGeoJson(trackers))
    },
    predictedPoints (points) {
      this.map.getSource('predictedPoints').setData(subArrayToGeoJson(points))
    }
  },
  mounted () {
    // this.gates.map(gate => {
    //   const from = turf.point([gate.lng, gate.lat])
    //   const to = turf.point([this.trackers[0].lng, this.trackers[0].lat])
    //   const distance = turf.distance(from, to, { units: 'meters' })
    //   const rssi = distanceToRssi(distance)
    //   gate.distance = -Math.round(rssi)
    // })

    const modes = MapboxDraw.modes
    modes.static = StaticMode

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      defaultMode: 'static',
      controls: {
        polygon: true,
        trash: true
      }
    })

    mapbox.accessToken = 'pk.eyJ1IjoiZGFuaWVsc3ZhbmUiLCJhIjoiY2plNzZzb3RiMDkwdjJ3bXpyNTA4ZGc4dyJ9.m8wVa-i4jVuNxmLiu6uWrA'

    const map = new mapbox.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [9.672069837579699, 55.794113413176035],
      zoom: 20
    })

    this.map = map

    map.addControl(this.draw)

    map.on('click', e => {
      // console.log(e.lngLat)
      this.$emit('onClick', [e.lngLat.lng, e.lngLat.lat])
      // this.predict([e.lngLat.lng, e.lngLat.lat])
    })

    map.on('load', () => {
      map.addSource('trackers', {
        type: 'geojson',
        data: arrayToGeoJson(this.trackers)
      })
      map.addSource('gates', {
        type: 'geojson',
        data: arrayToGeoJson(this.gates)
      })
      map.addSource('points', {
        type: 'geojson',
        data: subArrayToGeoJson(this.points)
      })
      map.addSource('testPoints', {
        type: 'geojson',
        data: subArrayToGeoJson(this.testPoints)
      })
      map.addSource('predictedPoints', {
        type: 'geojson',
        data: subArrayToGeoJson(this.predictedPoints)
      })

      map.addLayer({
        id: 'points',
        source: 'points',
        type: 'circle',
        paint: {
          'circle-radius': 2,
          'circle-color': '#ffd817',
          'circle-opacity': 0.1
        }
      })
      map.addLayer({
        id: 'trackers',
        source: 'trackers',
        type: 'circle',
        paint: {
          'circle-radius': 10,
          'circle-color': '#1fc91c'
        }
      })
      map.addLayer({
        id: 'gates',
        source: 'gates',
        type: 'circle',
        paint: {
          'circle-radius': 20,
          'circle-color': '#4287f5'
        }
      })
      // map.addLayer({
      //   id: 'testPoints',
      //   source: 'testPoints',
      //   type: 'circle',
      //   paint: {
      //     'circle-radius': 5,
      //     'circle-color': '#ffffff',
      //     'circle-opacity': 0.5
      //   }
      // })
      map.addLayer({
        id: 'predictedPoints',
        source: 'predictedPoints',
        type: 'circle',
        paint: {
          'circle-radius': 3,
          'circle-color': '#32c20a'
        }
      })

      // map.addLayer({
      //   id: 'distance',
      //   type: 'symbol',
      //   source: 'gates',
      //   layout: {
      //     'text-field': '{distance}',
      //     'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      //     'text-size': 12
      //   }
      // })

      this.draw.add(arrayToGeoJsonPolygon(this.polygon))
    })
  }
}
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
