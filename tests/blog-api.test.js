const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: "NodeJS is crazy",
    author: "Tomas Carrizo",
    url: "link to the blog",
    likes: 121
  },
  {
    title: "MongoDB is a great tool",
    author: "Mariano Molina",
    url: "link to the blog",
    likes: 173
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
}, 100000)

describe("correct data format", () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)
  
  test('there is an unique identifier named "id"', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body[0].id).toBeDefined()
  }, 100000)
})

describe("POST to /api/blogs", () => {
  test('POST method creates a new blog post', async () => {
    const beforePost = (await api.get('/api/blogs')).body.length
  
    const newBlog = {
      title: "Tests are useful",
      author: "Alex Giovine",
      url: "link to the blog",
      likes: 203
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
  
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(beforePost + 1)
    expect(response.body[2]).toMatchObject(newBlog)
  }, 100000)
  
  test('if "likes" property is missing, then it be zero', async () => {
    const newBlog = {
      title: "Tests are useful",
      author: "Alex Giovine",
      url: "link to the blog"
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
  
    const response = await api.get('/api/blogs')
  
    expect(response.body[2].likes).toBe(0)
  }, 100000)
  
  test("can't POST blogs without 'title' property", async () => {
    const newBlog = {
      author: "Alex Giovine",
      url: "link to the blog",
      likes: 203
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
  
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('statusCode')
    expect(response.body.statusCode).toMatch("400 Bad Request")
  }, 100000)
  
  test("can't POST blogs without 'url' property", async () => {
    const newBlog = {
      title: "Tests are useful",
      author: "Alex Giovine",
      likes: 203
    }
  
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
  
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('statusCode')
      expect(response.body.statusCode).toMatch("400 Bad Request")
  }, 100000)
})

describe("DELETE to /api/blogs/:id", () => {
  test('deleting a blog', async () => {
    let request = await api.get('/api/blogs').expect(200)
  
    await api.delete(`/api/blogs/${request.body[0].id}`).expect(204)
  
    const response = await api.get('/api/blogs').expect(200)
    
    expect(response.body).toHaveLength(1)
  }, 100000)
})

describe("PUT to /api/blogs/:id", () => {
  test('updating likes of a blog', async () => {
    const request = await api.get('/api/blogs').expect(200)
    const id = request.body[0].id
  
    const blog = await Blog.findById(id)
    const { likes } = blog
    
    const updatedData = {
      likes: likes + 1
    }
  
    await api
      .put(`/api/blogs/:id`)
      .send(updatedData)
  
    expect(updatedData.likes).toBe(likes + 1)
  }, 100000)
})

afterAll(async () => {
  await mongoose.connection.close()
})