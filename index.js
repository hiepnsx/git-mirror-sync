require('dotenv').config()

const HANDLER_URL   = process.env.HANDLER_URL,
      PORT          = process.env.PORT,
      SECRET        = process.env.SECRET,
      REPO_PATH     = process.env.REPO_PATH,
      http          = require('http'),
      fs            = require('fs'),
      exec          = require('child_process').exec,
      createHandler = require('github-webhook-handler'),
      handler       = createHandler({ path: HANDLER_URL, secret: SECRET })

http.createServer(function (req, res) {
  handler(req, res, function () {
    res.statusCode = 404
    res.end('No such location!')
  })
}).listen(PORT)

handler.on('push', function (event) {
  const folderPath = REPO_PATH + event.payload.repository.name + '.git'

  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)

  fs.access(folderPath, function (err) {
    if (err && err.code === 'ENOENT') {
      console.log('Folder: ' + folderPath + ' not exist!')
      return
    }
    console.log('Folder: ' + folderPath + ' exist!')
    const command = 'cd ' + folderPath + ' && git fetch -p'
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.log('Error when run: ' + command)
        return
      }
      console.log(`stdout: ${stdout}`)
      console.log(`stderr: ${stderr}`)
    })

  })
})