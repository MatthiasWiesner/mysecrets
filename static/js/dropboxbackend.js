
function Backend(){
    this.client;
    this.datastore;

    this.generateUUID = function() {
        var s = [], itoh = '0123456789ABCDEF';
        // Make array of random hex digits. The UUID only has 32 digits in it, but we
        // allocate an extra items to make room for the '-'s we'll be inserting.
        for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random()*0x10);
        // Conform to RFC-4122, section 4.4
        s[14] = 4;  // Set 4 high bits of time_high field to version
        s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
        // Convert to hex chars
        for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];
        // Insert '-'s
        s[8] = s[13] = s[18] = s[23] = '-';
        return s.join('');
    }

    this.init = function(APP_KEY, APP_TOKEN, callback){
        var client = new Dropbox.Client({key: APP_KEY, token: APP_TOKEN});
        client.authenticate({interactive: false}, $.proxy(function (error) {
            if (error) {
                alert('Authentication error: ' + error);
            }
            if (client.isAuthenticated()) {
                this.client = client;

                var datastoreManager = this.client.getDatastoreManager();
                datastoreManager.openDefaultDatastore($.proxy(function (error, datastore) {
                    if (error) {
                        alert('Error opening default datastore: ' + error);
                    }
                    this.datastore = datastore;
                    callback();
                }, this));
            }
        }, this));
    };

    this.getSecrets = function(callback){
        var secretsTable = this.datastore.getTable('secrets');
        var result = secretsTable.query();
        callback(result);
    };

    this.saveSecret = function(secretData, callback){
        var secretsTable = this.datastore.getTable('secrets');
        var defaultValues = {
          "category": "New",
          "data": "",
          "tags": "",
          "date": String(new Date())
        }

        var recordId = secretData.id || this.generateUUID();
        var secret = secretsTable.getOrInsert(recordId, defaultValues);

        secret.update({
          "category": secretData.category,
          "data": secretData.data,
          "tags": secretData.tags,
          "date": String(new Date())
        });
        callback();
    };

    this.deleteSecret = function(recordId, callback){
        var secretsTable = this.datastore.getTable('secrets');
        var s = secretsTable.get(recordId)
        if (s) {
            s.deleteRecord();
        }
        callback();
    };
}
