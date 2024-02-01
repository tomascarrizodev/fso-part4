const User = require('../models/user')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let total = 0
  
  blogs.forEach(blog => {
    total = total + blog.likes
  })

  return total
}

const favoriteBlog = (blogs) => {
  let higherNumber = 0
  let blogPosition

  blogs.forEach((blog, i) => {
    if (blog.likes > higherNumber) {
      higherNumber = blog.likes
      blogPosition = i
    } else if (blog.likes === higherNumber) {
      blogPosition = i
    }
  })

  return blogs[blogPosition]
}

const mostBlogs = (blogs) => {
  let most = { author: '', blogs: 0 }
  let authorsRepeat = []
  let authorsUnique = []
  let authorMost
  let blogMost = 0

  blogs.forEach(blog => {
    authorsRepeat.push(blog.author)
  })

  authorsRepeat.forEach((author, i) => {
    if (authorsUnique.length === 0) {
      authorsUnique.push(author)
    } else {
      authorsUnique.forEach((unique, j) => {
        if (unique !== author) {
          authorsUnique.push(author)
        }
      })
    }
  })
  authorsUnique = new Set([...authorsRepeat])

  authorsUnique.forEach((unique, i) => {
    let count = 0
    authorsRepeat.forEach((repeat, i) => {
      if (repeat === unique) {
        count++
      }
    })
    if (count > blogMost) {
      blogMost = count
      authorMost = unique
    }
  })

  most.author = authorMost
  most.blogs = blogMost

  return most
}

const mostLikes = (blogs) => {
  let most = { author: '', likes: 0 }
  let authorsRepeat = []
  let authorsUnique = []
  let authorMost
  let likesMost = 0

  blogs.forEach(blog => {
    authorsRepeat.push(blog.author)
  })

  authorsRepeat.forEach((author, i) => {
    if (authorsUnique.length === 0) {
      authorsUnique.push(author)
    } else {
      authorsUnique.forEach((unique, j) => {
        if (unique !== author) {
          authorsUnique.push(author)
        }
      })
    }
  })
  authorsUnique = new Set([...authorsRepeat])

  authorsUnique.forEach((unique, i) => {
    let count = 0
    blogs.forEach((blog, i) => {
      if (blog.author === unique) {
        count = count + blog.likes
      }
    })
    if (count > likesMost) {
      likesMost = count
      authorMost = unique
    }
  })

  most.author = authorMost
  most.likes = likesMost

  return most
}

const usersInDB = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  usersInDB
}