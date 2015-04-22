# MySecrets

The website *mysecrets* is supposed to be a distributed storage for account 
credentials. The data are client side [encrypted](#encryption) and stored in the 
dropbox datastore. The data format is:

~~~json
{
  "category": "string",
  "username": "string",
  "password": "string",
  "url": "string",
  "freeText": "string",
  "tags": "comma seperated string"
}
~~~
Whereby `username`, `password`, `url` and `freeText` are combined and 
transmitted encrypted to the server.

On loading data, `username`, `password`, `url` and `freeText` are decrypted and 
displayed ordered by the `category`.


## Encryption

The encryption is done by using the [CryptoJS] library. The data are encrypted 
by [Triple DES] algorithm. Triple DES applies DES three times to each block to 
increase the key size. The algorithm is believed to be secure in this form.

The encryption uses a passphrase string, which is requested during the initial 
setup and stored in the browsers local storage.


## Setup

You can run this website locally. Download the zip version from github by clicking or:

~~~
wget https://github.com/MatthiasWiesner/mysecrets/archive/dropbox.zip
~~~

Now you only need to open the `index.html` file with the browser.
Alternatively, you can store the website on a storage of your choice (dropbox, AWS, google cloud).


### Configuration

To store your secrets on dropbox, you need to do some configuration steps.

You have to create a dropbox account, if missing. Next, create a "Dropbox API 
app" to get a datastore in which your secrets are stored:

1. Login to your dropbox account and change to: [Dropbox Developer - App Console]
2. Create a "Dropbox API app", choose "Datastores only" and set a name for the app.
3. In the apps settings, generate an access token (under OAuth 2)

To get *mysecrets* authorized to dropbox, you need the "App key" and the 
"Generated access token", both from the dropbox apps settings.
Create a `credentials.js` file next to `index.html` and fill the corresponding
values:

~~~javascript
var credentials = {
    "key": "<APP_KEY>",
    "token": "<ACCESS_TOKEN>"
};
~~~

### Store website on dropbox

Since you already have a dropbox account, you can store the website on dropbox as well.
Move the folder (including `credentials.js`) to the dropbox's public folder. Get the public link of the `index.html` file (right-click on the file in the dropbox's web ui) and bookmark it.

[CryptoJS]: https://code.google.com/p/crypto-js/
[Triple DES]: http://en.wikipedia.org/wiki/Triple_DES
[Dropbox Developer - App Console]: https://www.dropbox.com/developers/apps
