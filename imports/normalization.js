let rssiMin, rssiMax, lngMin, lngMax, latMin, latMax

export function normalize (val, min, max) {
  return (val - min) / (max - min)
}

function denormalize (val, min, max) {
  return val * (max - min) + min
}

export function normalizeRssi (rssi) {
  return rssi.map(list => {
    return list.map(val => {
      return normalize(val, rssiMin, rssiMax)
    })
  })
}

export function denormalizeCoordinate (coordinate) {
  return [
    denormalize(coordinate[0], lngMin, lngMax),
    denormalize(coordinate[1], latMin, latMax)
  ]
}

export function denormalizeCoordinates (coordinates) {
  return coordinates.map(coord => {
    return denormalizeCoordinate(coord)
  })
}

// Normalizes array of RSSI values
export function calcNormalizedRssi (data) {
  rssiMin = data[0][0]
  rssiMax = data[0][0]
  // Loop data and find min / max
  data.map(list => {
    list.map(rssi => {
      rssiMin = Math.min(rssi, rssiMin)
      rssiMax = Math.max(rssi, rssiMax)
    })
  })
  // Scale the data to be between 0 and 1
  const normalizedData = data.map(list => {
    return list.map(rssi => {
      return normalize(rssi, rssiMin, rssiMax)
    })
  })

  return normalizedData
}

// Normalizes array of coordinates so that longitude is between 0 and 1, and latitude is between 0 and 1
export function calcNormalizedCoordinates (data) {
  // Initialize min and max to known values
  lngMin = data[0][0]
  lngMax = data[0][0]
  latMin = data[0][1]
  latMax = data[0][1]

  // Run through the data and find the min and max
  data.map(point => {
    lngMin = Math.min(point[0], lngMin)
    lngMax = Math.max(point[0], lngMax)
    latMin = Math.min(point[1], latMin)
    latMax = Math.max(point[1], latMax)
  })

  // Scale the data to be between 0 and 1
  const normalizedData = data.map(point => {
    return [
      normalize(point[0], lngMin, lngMax),
      normalize(point[1], latMin, latMax)
    ]
  })

  return normalizedData
}
