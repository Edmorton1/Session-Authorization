import express, { json, Request, Response } from 'express'
import session from 'express-session'
import crypto from "crypto"

declare module 'express-session' {
  interface SessionData {
    userid?: string
  }
}

interface UserInterface {
  login: string,
  password: string
}

const db: UserInterface[] = [{login: "vasya", password: "123123"}, {login: "asd", password: "123"}]

function generateRandomString() {
  return crypto.randomBytes(123).toString("hex")
}

const psevdoRedis = new Map()

const app = express()

app.use(json())

// СОЗДАНИЕ СЕССИИ
app.use(session({
  secret: "secret",
  name: "sessionId",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60
  },
  rolling: true
}))
// СОЗДАНИЕ СЕССИИ

app.get('/users', (req, res) => {
  console.log(req.session)
  if (!req.session.userid) {
    res.sendStatus(401)
    return;
  }
  console.log(psevdoRedis, psevdoRedis.get(req.session.userid))
  res.json(db)
})

app.post('/users', (req, res) => {
  console.log(req.body)
  const body: UserInterface = req.body
  const user = db.find(e => e.login === body.login)
  if (!user) {
    res.sendStatus(400)
  } else if (user.password !== body.password) {
    res.sendStatus(401)
  } else if (user.password === body.password) {
    const session = generateRandomString()
    psevdoRedis.set(session, user)
    console.log(session)
    req.session.userid = session
    res.sendStatus(200)
  }
})

app.delete("/users", (req, res) => {
  req.session.destroy(err => console.log(err))

  res.clearCookie("sessionId")
})

app.post("/ua", (req, res) => {res.sendStatus(200)})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))