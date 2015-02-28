# MySecrets

The website is supposed to be a distributed storage for account credentials. The data are client side [encrypted](#encryption) and stored in a mongodb database.

The data format is:
~~~
{
  'category': 'string',
  'username': 'string',
  'password': 'string',
  'url': 'string',
  'freeText': 'string',
  'tags': 'comma seperated string'
}
~~~
Whereby `username`, `password`, `url` and `freeText` are combined and transmitted encrypted to the server.

On loading data, `username`, `password`, `url` and `freeText` are decrypted and displayed ordered by the `category`.

Example for a mongo database entry:
~~~
{ "_id" : ObjectId("54f1ef17f764f8b17d70deda"), "category" : "Test2", "data" : "U2FsdGVkX19NYjJxEFCfPPF/uQP1Ly3AxF6AqGNMVtobfazEqK1AtBgRi+l6NWg9w5od1oOWGpS75w+kTCd0xk5TEn6P9bHCGuC4EWorYM4bLKyRQS9fGEmrYGhH6tUeI9VXBwl27smclSYhprTUBh2azl8wLz+r", "tags" : [ "asas", "asas" ], "date" : ISODate("2015-02-28T16:39:57.939Z") }
~~~


## Encryption

The encryption is done by using the [CryptoJS] library. The data are encrypted by [Triple DES] algorithm. Triple DES applies DES three times to each block to increase the key size. The algorithm is believed to be secure in this form.

The encryption uses a passphrase string, which is requested during the initial setup and stored in the browsers local storage.


## Setup

On the first entering the website one have to register as a new user with name and password.
In the next step one have to set the passphrase which is used for the encryption.

For every new user a mongodb collection will be created.


## [mysecrets.cloudcontrolled.com]

Currently the website is hosted on [cloudControl]. Feel free to test and use the website.


## Local

To get running the website locally, it's recommended to install it in a virtual machine using [VirtualBox] and [Vagrant]. You need only some steps

  - Git clone the project
  - in the new directory run the command `vagrant up` (this will need some time on the first time)
  - change into the virtual machine by `vagrant ssh`
  - run in the `/vagrant/` folder the command `python manager.py runserver`

[CryptoJS]: https://code.google.com/p/crypto-js/
[Triple DES]: http://en.wikipedia.org/wiki/Triple_DES
[mysecrets.cloudcontrolled.com]: http://mysecrets.cloudcontrolled.com/
[cloudControl]: https://www.cloudcontrol.com/
[VirtualBox]: https://www.virtualbox.org/
[Vagrant]: https://www.vagrantup.com/
