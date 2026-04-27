// this is the object we'll be mucking around with and proxying
const getCharacter = () => {
  return {
    _id: '9RKDLS02580GHCXNZLA0',
    password: 'isolemnlysweariamuptonogood',
    name: {first: 'Ron', last: 'Weasly'},
    classes: [
      {name: 'Divination', teacher: 'Sybill Trelawney'},
      {name: 'Defence Against the Dark Arts', teacher: 'Dolores Umbridge'},
    ],
    greet(greeting = 'Hi') {
      const {first, last} = this.name
      return `${greeting}! My name is ${first} ${last} and my ID is ${this._id} and my password is ${this.password}!`
    },
    getTeachers() {
      return this.classes.map(({teacher}) => teacher)
    },
  }
}

test('22_proxies-1: can wrap an existing object', () => {
  const character = getCharacter()
  const proxy = new Proxy(character, {})

  // Comprova que el proxy no és igual referencialment però sí igual profundament a l'objecte original
  expect(proxy).not.toBe(character) // referencialment diferent
  expect(proxy).toEqual(character) // profundament igual
})

test('22_proxies-2: handler can intercept gets, sets, and deletes', () => {
  const character = getCharacter()

  const handler = {
    get(target, prop, receiver) {
      if (prop === '_id' || prop === 'password') {
        return '[PROTECTED]'
      }
      return Reflect.get(target, prop, receiver)
    },

    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver)
    },

    deleteProperty(target, prop) {
      if (prop === '_id' || prop === 'password') {
        return false
      }
      return Reflect.deleteProperty(target, prop)
    },
  }

  const proxy = new Proxy(character, handler)

  // Interactua amb el proxy
  proxy.awesome = 10 // assignació superficial
  delete proxy._id // elimina una propietat "protegida"

  // Fes algunes comprovacions
  expect(proxy.awesome).toBe(10) // obtenció superficial
  expect(proxy._id).toEqual('[PROTECTED]') // propietat protegida en lectura
  expect(proxy.password).toEqual('[PROTECTED]') // propietat protegida en lectura

  // Comprovem que la propietat real continua existint
  expect(character._id).toEqual('9RKDLS02580GHCXNZLA0')

  // Neteja
  delete proxy.awesome // elimina una propietat no protegida
  expect(proxy.awesome).toBe(undefined) // propietat eliminada correctament
})

//////// EXTRA CREDIT ////////

test.skip('22_proxies-3: can intercept function calls', () => {
  const character = getCharacter()

  const handler = {
    apply(target, thisArg, args) {
      const result = Reflect.apply(target, thisArg, args)
      return result
        .replace(thisArg.password, '[PROTECTED]')
        .replace(thisArg._id, '[PROTECTED]')
    },
  }

  // Tingues en compte que `apply` només funciona per a proxies en funcions!
  character.greet = new Proxy(character.greet, handler)
  const result = character.greet('Hey there')

  // Comprova que el resultat no conté informació sensible
  expect(result).not.toContain(character.password)
  expect(result).not.toContain(character._id)
})

test.skip('22_proxies-4: can be used to do some fancy stuff with arrays', () => {
  const characters = [
    'Harry Potter',
    'Ron Weasly',
    'Hermione Granger',
    'Nevel Longbottom',
    'Lavender Brown',
    'Scabbers',
    'Pigwidgeon',
  ]

  const handler = {
    get(target, prop, receiver) {
      const index = Number(prop)
      if (!Number.isNaN(index) && index < 0) {
        return target[target.length + index]
      }
      return Reflect.get(target, prop, receiver)
    },
  }

  const proxy = new Proxy(characters, handler)

  // Comprova que el proxy permet accedir a elements de l'array amb índexs positius i negatius
  expect(proxy[0]).toBe('Harry Potter')
  expect(proxy[-1]).toBe('Pigwidgeon')
  expect(proxy[-4]).toBe('Nevel Longbottom')
})