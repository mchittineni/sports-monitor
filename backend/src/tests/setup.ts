// set environment early so index.ts doesn't start the server
process.env.NODE_ENV = 'test'

import request from 'supertest'
import app from '../index'

// no-op beforeAll
beforeAll(() => {})

// export a helper for tests to use
export const api = () => request(app)
