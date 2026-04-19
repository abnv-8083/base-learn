const helmet = require('helmet');
const express = require('express');
const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'frame-ancestors': ["'self'", "https://baselearn.in", "http://localhost:3000"]
    }
  },
  xFrameOptions: false
}));
app.get('/', (req,res)=>res.send('ok'));
const server = app.listen(0, () => {
    require('http').get('http://127.0.0.1:'+server.address().port, (res) => {
        console.log(res.headers);
        process.exit(0);
    });
});
