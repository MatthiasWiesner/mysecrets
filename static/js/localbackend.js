

function BackendEntry(){
    this.init = function(elem){
        if (elem != undefined){
            this.category = elem.category;
            this.data = elem.data;
            this.tags = elem.tags,
            this.date = elem.date;
        } else {
            this.category = "New";
            this.data = "";
            this.tags = "",
            this.date = String(new Date());
        }
    };

    this.get = function(_key){
        return this[_key];
    };

    this.getId = function(){
        return this.id;
    };
}

function LocalBackend(){
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
    };

    this._getSecrets = function(){
        return this.datastore.get('secrets').map(function(el){
            var elem = new BackendEntry();
            elem.init(el);
            return elem;
        });
    };

    this.init = function(_app_key, _app_token, callback){
        this.datastore = $.localStorage;
        if (this.datastore.get('secrets') == undefined){
            this.datastore.set('secrets', new Array());
        }
        callback();
    };

    this.getSecrets = function(callback){
        secretsTable = this._getSecrets();
        callback(secretsTable);
    };

    this.saveSecret = function(secretData, callback){
        var secretsTable = this._getSecrets();
        var defaultSecret = new BackendEntry();

        var recordId = secretData.id || this.generateUUID();

        var secret = secretsTable.filter(function(el){
            return el.id == recordId;
        })[0];

        if(secret == undefined){
            secret = new BackendEntry();
            secret.init();
            secret.id = recordId;
            secretsTable.push(secret);
        }

        secret.category = secretData.category;
        secret.data = secretData.data;
        secret.tags = secretData.tags;
        secret.date = String(new Date());

        this.datastore.set('secrets', secretsTable);

        callback();
    };

    this.deleteSecret = function(recordId, callback){
        var secretsTable = this.datastore.get('secrets');
        var idx = secretsTable.findIndex(function(el){
            return el.id == recordId;
        })
        if (idx >= 0) {
            secretsTable.splice(idx, 1);
        }
        this.datastore.set('secrets', secretsTable);
        callback();
    };
}