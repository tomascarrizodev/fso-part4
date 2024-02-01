const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  try {
    const users = await User.find({}).populate('blogs')
    res.json(users)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

usersRouter.post('/', async (req, res) => {
  try {
    const { username, name, password } = req.body
  
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
  
    const user = new User({
      username,
      name,
      passwordHash
    })
  
    const savedUser = await user.save()
  
    res.status(201).json(savedUser)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = usersRouter