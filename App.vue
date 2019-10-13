<template>
  <div id="container">
    <Map :gates="gates" :polygon="polygon" :trackers="trackers" :points="points" @onClick="predict" :testPoints="testPoints" :predictedPoints="predictedPoints"></Map>
    <div id="controls">
      <div class="button" @click="getPolygon">
        Get polygon
      </div>
      <div id="generate-points" class="button" @click="generateTestData">
        Generate test data
      </div>
      <div id="train" class="button" @click="trainAndPredict">
        Train and predict
      </div>
      <div id="train" class="button" @click="train">
        Train
      </div>
    </div>
  </div>
</template>

<script>
import Map from './Map.vue'
import { arrayToArrayRssi, generateRandomPointsInPolygon, generateEvenPointsInPolygon } from './imports/geo.js'
import { calcNormalizedRssi, calcNormalizedCoordinates, normalizeRssi, denormalizeCoordinate, denormalizeCoordinates } from './imports/normalization.js'
import { train, predict, trainAndPredict } from './imports/brain.js'
import axios from 'axios'

export default {
  components: { Map },
  data () {
    return {
      gates: [
        { lng: 9.67201223170602, lat: 55.794008336135875, distance: 0 },
        { lng: 9.672182634240414, lat: 55.794092091385664, distance: 0 },
        { lng: 9.671960086667497, lat: 55.794135539350435, distance: 0 },
        { lng: 9.672126764556538, lat: 55.7942177239226, distance: 0 }
      ],
      trackers: [],
      polygon: [
        [9.671893635130147, 55.794024237520176],
        [9.672126597174923, 55.79398571862197],
        [9.672245362139535, 55.79420655978657],
        [9.672010116153302, 55.794238658688585],
        [9.671893635130147, 55.794024237520176]
      ],
      points: [],
      testPoints: [],
      predictedPoints: [
        [9.671893635130147, 55.794024237520176],
        [9.672126597174923, 55.79398571862197],
        [9.672245362139535, 55.79420655978657],
        [9.672010116153302, 55.794238658688585],
        [9.671893635130147, 55.794024237520176]
      ]
    }
  },
  methods: {
    async trainAndPredict () {
      const rssi = arrayToArrayRssi(this.points, this.gates.map(gate => [gate.lng, gate.lat]))
      const normalizedRssi = calcNormalizedRssi(rssi)
      const normalizedPoints = calcNormalizedCoordinates(this.points)

      const testRssi = arrayToArrayRssi(this.testPoints, this.gates.map(gate => [gate.lng, gate.lat]))
      const normalizedTestRssi = calcNormalizedRssi(testRssi)

      let found = false

      while (!found) {
        const {
          predictions: predictedPoints,
          loss
        } = await trainAndPredict(normalizedRssi, normalizedPoints, normalizedTestRssi)

        if (loss < 0.00001) found = true

        this.predictedPoints = denormalizeCoordinates(predictedPoints)

        // console.log(this.predictedPoints)
        console.log(loss)
      }

      // const predictedPoints = await trainAndPredict(normalizedRssi, normalizedPoints, normalizedTestRssi)
      // this.predictedPoints = denormalizeCoordinates(predictedPoints)

      console.log('done')
    },
    async train () {
      const rssi = arrayToArrayRssi(this.points, this.gates.map(gate => [gate.lng, gate.lat]))
      const normalizedRssi = calcNormalizedRssi(rssi)
      const normalizedPoints = calcNormalizedCoordinates(this.points)

      // const res = await train(normalizedRssi, normalizedPoints)

      const testRssi = arrayToArrayRssi(this.testPoints, this.gates.map(gate => [gate.lng, gate.lat]))
      const normalizedTestRssi = calcNormalizedRssi(testRssi)

      const predictedPoints = await train(normalizedRssi, normalizedPoints, normalizedTestRssi)

      this.predictedPoints = denormalizeCoordinates(predictedPoints)

      console.log(this.predictedPoints)

      // console.log('done', res)

      // await axios.post('http://localhost:3000', {
      //   x: normalizedRssi,
      //   y: normalizedPoints
      // })
    },
    async predict (point) {
      console.log(point)
      const rssi = arrayToArrayRssi([point], this.gates.map(gate => [gate.lng, gate.lat]))
      const normalizedRssi = normalizeRssi(rssi)
      // const res = await axios.post('http://localhost:3000/predict', {
      //   x: normalizedRssi
      // })

      const prediction = predict(normalizedRssi)

      console.log(prediction[0], prediction[1])

      const coordinate = denormalizeCoordinate(prediction)

      // console.log('prediction', coordinate)

      this.trackers = [{
        lng: coordinate[0],
        lat: coordinate[1]
      }]
    },
    async check (point) {
      const res = await axios.post('http://localhost:3000/check', {
        y: point
      })

      console.log(res.data)
    },
    getPolygon () {
      console.log('Getting polygon...')
      const features = this.draw.getAll()
      console.log(features)
    },
    generateTestData () {
      console.log('Generating test data...')
      // generatePointsInPolygon(2, this.polygon)
    }
  },
  mounted () {
    this.points = generateEvenPointsInPolygon(20, this.polygon)
    this.testPoints = generateEvenPointsInPolygon(20, this.polygon)
  }
}
</script>

<style>
body, html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#controls {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.button {
  display: inline-block;
  padding: 10px;
  margin: 5px;
  color: #222;
  border: 1px solid #aaa;
  cursor: pointer;
  background: #fccc0d;
}
</style>
