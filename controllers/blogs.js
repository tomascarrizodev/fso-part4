const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  let decodedToken
  try {
    try {
      decodedToken = jwt.verify(request.token, process.env.SECRET)
    } catch (error) {
      return response.status(401).json({ error: 'Unauthorized' })
    }
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    const body = request.body
    const blog = new Blog({
      author: body.author,
      title: body.title,
      url: body.url,
      likes: body.likes,
      user: user.id
    })
    blog.likes = blog.likes || 0
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(blog)
  } catch (error) {
    response.status(400).json({statusCode: "400 Bad Request"})
  }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  try {
    let decodedToken 
    try {
      decodedToken = jwt.verify(request.token, process.env.SECRET)
    } catch (error) {
      return response.status(401).json({ error: 'invalid token' })
    }

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'invalid token' })
    }
    const blog = await Blog.findById(request.params.id)
    const userId = blog.user

    const user = request.user

    if (userId.toString() === user.id.toString()) {
      const userBlogs = user.blogs.filter(b => b.toString() !== request.params.id)
      await User.findByIdAndUpdate(user.id.toString(), { blogs: userBlogs })
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    }

  } catch (error) {
    response.status(400).json({ statusCode: "Blog not found" })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  let decodedToken
  try {
    try {
      decodedToken = jwt.verify(request.token, process.env.SECRET)
    } catch (error) {
      response.status(401).json({ error: 'invalid token' })
    }
    
    if (!decodedToken.id) {
      response.status(401).json({ error: 'invalid token' })
    }

    let { id, author, url, title, likes } = request.body
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { id, author, url, title, likes: likes++ }, { new: true, runValidators: true, context: 'query' })
    
    if (!updatedBlog) {
      return response.status(404).json({ error: "Blog don't found" })
    }

    response.json(updatedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message})
  }
})

module.exports = blogsRouter