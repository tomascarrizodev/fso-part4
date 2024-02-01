const bcrypt = require('bcrypt')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)
const helper = require('../utils/list_helper')

let user
let passwordHash

describe('when there is initially only one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    passwordHash = await bcrypt.hash('sekret', 10)
    user = new User({ username: 'root', passwordHash })

    await user.save()
  }, 100000)

  test('creation succeeds with a new username', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'willyrex',
      name: 'Guillermo Diaz',
      password: 'trotuman'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  }, 100000)

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'root',
      name: 'Roberto De Luque',
      password: 'vaquipandi'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain("expected `username` to be unique")

    const usersAtEnd = await helper.usersInDB()
    expect(usersAtEnd).toEqual(usersAtStart)
  }, 100000)

  test('POST a new blog with a proper token authentication', async () => {
    const user = {
      username: 'root',
      password: 'sekret'
    }

    const newBlog = {
      title: "NodeJS is crazy",
      author: "Tomas Carrizo",
      url: "link to the blog",
      likes: 121
    }

    const result = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = result.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
  }, 100000)

  test('POST a new blog failed for not providing a valid token', async () => {
    const user = {
      username: 'root',
      password: 'sekret'
    }

    const newBlog = {
      title: "NodeJS is crazy",
      author: "Tomas Carrizo",
      url: "link to the blog",
      likes: 121
    }

    const result = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = result.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `${token + 'invalidSignature'}`)
      .send(newBlog)
      .expect(401)
  }, 100000)
})