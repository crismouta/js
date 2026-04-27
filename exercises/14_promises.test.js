const pickApple = (ripeness) => {
  // Retorna immediatament una promesa que eventualment serà resolta
  // o rebutjada cridant la funció corresponent.
  return new Promise((resolve, reject) => {
    // Fes alguna cosa asíncrona. Podria ser AJAX, utilitzant un timeout aquí.
    setTimeout(() => {
      if (ripeness === 'ripe') {
        resolve('ripe apple')
      } else if (ripeness === 'unripe') {
        reject('unripe apple')
      } else {
        reject(new Error('out of apples'))
      }
    })
  })
}

test('14_promises-1: should resolve', () => {
  return pickApple('ripe')
    .then(
      result => {
        expect(result).toBe('ripe apple')
      },
      error => {
        throw new Error("això no s'hauria d'executar")
      },
    )
    .catch(error => {
      throw new Error("això no s'hauria d'executar")
    })
})

test('14_promises-2: should reject', () => {
  return pickApple('unripe')
    .then(
      result => {
        throw new Error("això no s'hauria d'executar")
      },
      error => {
        expect(error).toBe('unripe apple')
      },
    )
    .catch(error => {
      throw new Error("això no s'hauria d'executar")
    })
})

test('14_promises-3: errors can be caught', () => {
  return pickApple()
    .then(result => {
      throw new Error("això no s'hauria d'executar")
    })
    .catch(error => {
      expect(error.message).toBe('out of apples')
    })
})