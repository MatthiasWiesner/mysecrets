# MySecrets

The website *mysecrets* is supposed to be a distributed storage for a single users account credentials. 
There is a git branch for [GitHub: multiple users], which isn't under development.

The data are client side [encrypted](#encryption) and stored in a remote datastore or alternatively in the browsers local storage. The data format is:

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
by the AES-CBC-256 algorithm. The key derivation uses PBKDF2. 
This methods are similar to "1passwords" encryption.

The encryption uses a passphrase string, which is requested on every browser request and optionally stored in the browsers local storage (but *not recommended*).

## Setup

You can run this website locally. Download the zip version from github by clicking or:

~~~
wget https://github.com/MatthiasWiesner/mysecrets/archive/master.zip
~~~

Now you only need to open the `index.html` file with the browser.
Alternatively, you can store the website on a storage of your choice (dropbox, AWS, google cloud, firebase, ppp.).

### Local Storage

To store your secrets locally, you only have to open the `index.html` file with the GET parameter be=local:

`file:///path/to/index.html?be=local`

### Remote backend

The advantage in remote data store is located in the central access to data, regardless of the device. So you can access your secrets on the laptop at home, the workstation at your workplace or on your mobile.

Dropbox offered for some time a datastore service which was used in an earlier version. But dropbox set this datastore as deprecated (how sad, it was very fast).

The current version uses [Firebase] app & database as backend and host. The authentification at firebase uses currently google oauth2 (so you need a google account as well).

### Store website on firebase

After one has created an account on [Firebase], you must still perform some steps that are explained in detail in the firebase documentation. These steps have mostly to do with the authorization. For this website is currently google oauth implemented, but firebase provides also facebook, twitter and github oauth.

## Editing

The website uses many third party JS libraries, which are not part of the repository. The libraries have to be fetched with [bower]. 

The files you want to edit are `public/js/mysecrets.js`, `public/js/mysecrets.css` and the `public/index.html` (especially the templates at the bottom). For better debugging you should comment/uncomment the accordingly js files in `public/index.html`. By default only the compressed files are loaded.

The compression of all js and css files is done by [Grunt].

[GitHub: multiple users]: https://github.com/MatthiasWiesner/mysecrets/tree/multiuser
[CryptoJS]: https://code.google.com/p/crypto-js/
[Firebase]: https://www.firebase.com/
[bower]: http://bower.io/
[Grunt]: http://gruntjs.com/
