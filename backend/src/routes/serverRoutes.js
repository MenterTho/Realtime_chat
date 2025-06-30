const userRouter = require('./userRoutes')
const authRouter = require('./authRoutes')
const messageRouter = require('./messageRoutes')
function route(app) {
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/user', userRouter)
  app.use('/api/v1/message',messageRouter)
}
module.exports = route;