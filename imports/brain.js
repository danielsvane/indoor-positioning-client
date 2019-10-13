import * as tf from '@tensorflow/tfjs'
import { inferFromImplicitShape } from '@tensorflow/tfjs-core/dist/util'

// best 1.47e-5
// target ~ 5e-5

const activationFunction = 'relu'
const numHiddenLayers = 2
const numHiddenLayersUnits = 200
const learningRate = 0.0001
const epochs = 200

const model = tf.sequential()
model.add(tf.layers.dense({ units: numHiddenLayersUnits, inputShape: [4], activation: activationFunction }))
for (let i = 0; i < numHiddenLayers; i++) {
  model.add(tf.layers.dropout(0.2))
  model.add(tf.layers.dense({ units: numHiddenLayersUnits, activation: activationFunction }))
}
model.add(tf.layers.dense({ units: 2, activation: 'relu' }))

model.compile({
  loss: 'meanSquaredError',
  optimizer: tf.train.adam(learningRate)
})

console.log(model.optimizer)

export async function train (x, y, testData) {
  const inputs = tf.tensor2d(x)
  const outputs = tf.tensor2d(y)

  await model.fit(inputs, outputs, {
    shuffle: true,
    epochs: epochs,
    callbacks: {
      onEpochEnd (epoch, logs) {
        console.log(epoch, logs)
      }
    }
  })

  const predictions = testData.map(t => {
    return predict([t])
  })

  return predictions
}

export async function trainAndPredict (x, y, testData) {
  const inputs = tf.tensor2d(x)
  const outputs = tf.tensor2d(y)

  const res = await model.fit(inputs, outputs, {
    shuffle: true,
    epochs: 100
  })

  const predictions = testData.map(t => {
    return predict([t])
  })

  return {
    predictions,
    loss: res.history.loss.pop()
  }
}

export function predict (x) {
  const data = tf.tensor2d(x)
  const prediction = model.predict(data)
  return prediction.dataSync()
}
