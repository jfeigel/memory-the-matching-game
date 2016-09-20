# :white_large_square: :diamonds: Memory the Matching Game
A memory game using images from Instagram.

## Prerequisites
* [Node.js](https://nodejs.org/en/) (Version 5 and up recommended)
* [MongoDB](https://www.mongodb.com/)
* [Instagram Client ID and Secret](https://instagram.com/developer) (for OAuth)

### Installation

* Clone down the repository.
```
git clone https://github.com/jfeigel/memory-the-matching-game.git
```

* Install packages (from inside the `memory-the-matching-game` folder).
```
npm install
```

* Create your config.  There's a `config.js.example` file in the root.  Edit it to include all your values for the site and your OAuth information.  Save it as `config.js` and leave it in the root.

* Start Mongo
```
npm run mongo
```

* Start it up.
```
npm start
```

* Compile the front-end assets
```
gulp
```

* Enjoy!
