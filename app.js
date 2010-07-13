var t = require('./vendor/tnode/t');
var ws = require('./vendor/node-websocket-server/lib/ws');
var sys = require('sys');

var httpServer = t.app({
  debug: true,
  routes: {
    '^/$': function(req, res) {
      res.template('index');
    },
    '^/(web/.*)$': t.serve
  }
});

var server = ws.createServer({}, httpServer);

server.addListener('listening', function() {
  sys.puts('Websocketserver listening!');  
});                                    

var clients = {};
server.addListener('close', function(conn) {
  conn.broadcast(JSON.stringify( { d: { id: conn.id } } ));
  delete clients[conn.id];
});
server.addListener('connection', function(conn) {
                 
  server.send(conn.id, JSON.stringify({
    m: 'connected as ' + conn.id
  }));

  clients[conn.id] = 1;
  for(var id in clients) {
    if(id != conn.id) {             
      server.send(conn.id, JSON.stringify( { u: { id: id } } ));
    }
  }

  conn.broadcast(JSON.stringify({
    u: {
      id: conn.id
    }
  }));
  
  conn.addListener('message', function(message) {
    try {
      var json = JSON.parse(message);
      
      for(var key in json) {
        var data = json[key];
      
        switch(key) {
          case 'm':
            sys.puts(conn.id + ': ' + data);
            break;
            
          case 'pos':
            conn.broadcast(JSON.stringify({ 
              c: {
                id: conn.id,
                pos: {
                  x: data.x,
                  y: data.y
                }
              }
            }));
          
            break;
            
          default:
            sys.puts('uh, i dont understand: ' + key + '( ' + data + ' )');
            break;
        }
      }
    } catch(e) {
      sys.puts('ah, this caused an error, i dont understand: ' + message);
    }
  });
  
});

server.listen(8888);