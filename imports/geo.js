import * as turf from '@turf/turf'

function distance (p1, p2) {
  return turf.distance(turf.point(p1), turf.point(p2), {
    units: 'meters'
  })
}

export function distanceToRssi (dist) {
  return -(-40 - Math.log10(dist) * 20)
}

export function arrayToArrayRssi (a1, a2) {
  // Loop through test data points
  return a1.map(p1 => {
    return a2.map(p2 => {
      const dist = distance(p1, p2)
      const rssi = distanceToRssi(dist)
      return rssi
    })
  })
}

export function generateEvenPointsInPolygon (size, _polygon) {
  const polygon = turf.polygon([_polygon])
  const bbox = turf.bbox(polygon)

  const minX = bbox[0]
  const minY = bbox[1]
  const maxX = bbox[2]
  const maxY = bbox[3]
  const deltaX = maxX - minX
  const deltaY = maxY - minY
  const scaleX = deltaX / size
  const scaleY = deltaY / size

  let points = []

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const _x = minX + x * scaleX
      const _y = minY + y * scaleY
      const isWithin = turf.booleanPointInPolygon(turf.point([_x, _y]), polygon)
      if (isWithin) points.push([_x, _y])
    }
  }

  return points
}

export function generateRandomPointsInPolygon (numPoints, _polygon) {
  const polygon = turf.polygon([_polygon])
  const bbox = turf.bbox(polygon)

  const minX = bbox[0]
  const minY = bbox[1]
  const maxX = bbox[2]
  const maxY = bbox[3]
  const deltaX = maxX - minX
  const deltaY = maxY - minY

  const points = []
  while (points.length < numPoints) {
    const x = minX + Math.random() * deltaX
    const y = minY + Math.random() * deltaY
    const isWithin = turf.booleanPointInPolygon(turf.point([x, y]), polygon)
    if (isWithin) points.push([x, y])
  }
  return points
}

export function subArrayToGeoJson (arr) {
  return {
    type: 'FeatureCollection',
    features: arr.map(item => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: item
        }
      }
    })
  }
}

export function arrayToGeoJson (arr) {
  return {
    type: 'FeatureCollection',
    features: arr.map(item => {
      return {
        type: 'Feature',
        properties: {
          distance: item.distance
        },
        geometry: {
          type: 'Point',
          coordinates: [item.lng, item.lat]
        }
      }
    })
  }
}

export function arrayToGeoJsonPolygon (arr) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [arr]
      }
    }]
  }
}