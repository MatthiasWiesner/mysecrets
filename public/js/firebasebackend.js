
function FirebaseBackend(){
    this.datastore;
    // eveil hack, but works!
    var self = this;

    this.getUrl = function(callback){
        var url = $.localStorage.get('firebaseUrl');
        if (url == undefined) {
            bootbox.prompt("Set the url to your firebase app?", function(url) {
              if (url === null) {
                alert('You f***ing need the firebase url, dude!');
              } else {
                $.localStorage.set('firebaseUrl', url);
                self.setDatastore(url, callback);
              }
            });
        } else {
            self.setDatastore(url, callback);
        }
    }

    this.setDatastore = function(url, callback){
        var secrets_url = url + '/' + 'mysecrets';
        self.datastore = new Firebase(secrets_url);
        self.datastore.onAuth(function(authData) {
          if (authData !== null) {
            console.log("Authenticated successfully");
            callback();
          } else {
            // Try to authenticate with Google via OAuth redirection
            self.datastore.authWithOAuthRedirect("google", function(error, authData) {
              if (error) {
                console.log("Login Failed!", error);
              } else {
                callback();
              }
            });
          }
        });
    }

    this.init = function(callback){
        self.getUrl(callback);
    };

    this.getSecrets = function(callback){
        var mysecrets = new Array();
        self.datastore.on("value", function(snapshot) {
            snapshot.forEach(function(item){
                var elem = item.val();
                elem.id = item.key();
                elem.get = function(_key){
                    return this[_key];
                };
                elem.getId = function(){
                    return this.id;
                };
                mysecrets.push(elem);
            });
            callback(mysecrets);
        }, function (errorObject) {
          alert("The read failed: " + errorObject.code);
        });
    };

    this.saveSecret = function(secretData, callback){
        secretData.date = String(new Date());
        if(secretData.id){
            self.datastore.child(secretData.id).set(secretData);
        } else {
            self.datastore.push(secretData);
        }
        callback();
    };

    this.deleteSecret = function(recordId, callback){
        self.datastore.child(recordId).remove();
        callback();
    };
}