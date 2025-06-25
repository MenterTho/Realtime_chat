const userRouter = require('./userRoutes')
const authRouter = require('./authRoutes')
function route(app) {
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/user', userRouter)
}
module.exports = route;