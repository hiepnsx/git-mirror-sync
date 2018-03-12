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

// Disable all console.log in production
if(process.env.NODE_ENV === "production")
{
  console.log = function(){};
}

http.createServer(function (req, res) {
  handler(req, res, function () {
    res.statusCode = 404
    res.end('No such location!')
  })
}).listen(PORT)

handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)

  const folderPath = REPO_PATH + event.payload.repository.name + '.git'

  // Check repo folder is exist
  fs.access(folderPath, function (err) {
    if (err && err.code === 'ENOENT') {
      console.log('Folder: ' + folderPath + ' not exist!')
      return
    }
    const command = 'cd ' + folderPath +
      ' && git fetch -p && chown -R sysv-dev-release:sysv-dev-release' + folderPath
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