const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash)
    
    if (!(user && passwordCorrect)) {
      return res.status(401).json({ error: 'invalid username or password' })
    }

    const userToken = {
      username: user.username,
      id: user._id 
    }

    const token = jwt.sign(userToken, process.env.SECRET, { expiresIn: 180 })

    res.status(200).send({ token, username: user.username, name: user.name })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = loginRouter