self.addEventListener('message', function(e) {
  switch (e.type) {
    case 'start':
      
        $('#loading').modal('show');
        $.ajax({
          url: e.msg           
        }).done(function ( data ) {
          readFile(self, data);
        });

        break;
      //self.postMessage('Unknown command: ' + data.msg);
  };
}, false);
