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

var clients = {};
var server = ws.createServer({}, httpServer);
server.addListener('connection', function(conn) {
         
  server.send(conn.id, JSON.stringify({ m: 'You connected as ' + conn.id }));

  for(var id in clients) {
    server.send(conn.id, JSON.stringify( { u: { id: id } } ));
  }                   
  
  clients[conn.id] = {
    lastSeen: new Date(),
    conn: conn
  };

  conn.broadcast(JSON.stringify( { u: { id: conn.id } } ));
  
  conn.addListener('message', function(message) {
      var json = JSON.parse(message);
      
      for(var key in json) {
        var data = json[key];
        
        switch(key) {          
          
          case 'pos':
            conn.broadcast(JSON.stringify({ 
              c: { id: conn.id, pos: data }
            }));         
            clients[conn.id].lastSeen = new Date();
            break;            
            
          case 'm':
            sys.puts(conn.id + ': ' + data);
            break;
            
          default:      
            break;
        }
      }
  });  
});                 

server.addListener('close', function(conn) {
  conn.broadcast(JSON.stringify( { m: 'User disconnected ' + conn.id } ));        
  conn.broadcast(JSON.stringify( { d: { id: conn.id } } ));
  delete clients[conn.id];
});
                    
setInterval(function() {
  for(var id in clients) {
    var client = clients[id];
    if(new Date() - client.lastSeen > 20000) { 
      server.send(id, JSON.stringify({ m : 'You timed out..' }));
      client.conn.close();
      delete clients[id];
    }
  }
}, 2000);

server.listen(8888);