const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body)
    blog.likes = blog.likes || 0
    await blog.save()
    response.status(201).json(blog)
  } catch (error) {
    response.status(400).json({statusCode: "400 Bad Request"})
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ statusCode: "Blog not found" })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  try {
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