# crossbreed API
Don't just 'catch 'em all' -- _evolve_ them! [Crossbreed](https://github.com/kimkablitz/crossbreed-frontend) is a mobile app for iOS and Android allowing users to breed digital pets and evolve new traits over generations. Players discover their new pets' traits by playing minigames to test their might and determine which ones they may want to selectively breed.

This backend server provides APIs for all data needed to run crossbreed. To preserve the fun of discovering pet traits through game play, all breeding and DNA interpretation is handled here on the server -- the user can only access their pet's phenotype!  

This repository is a public version of the original backend by Katherine Tenhouse, Jover Lee,  Kimmy Kablitz, and Theresa Benkman.

# Current Features
* Sign up as a new user and receive two 'starter' pets automatically
* Breed two parent pets to generate an egg with its own unique dna -- and possibly genetic illnesses!
* Hatch an egg and interpret the phenotype of the brand new pet from its unique dna
* Custom DNA algorithm that encodes for phenotype traits like color, ear type, etc -- AND the method in which these traits should be expressed!

# Future Features
* Password reset route for local strategy users
* More robust error handling and logging
* Alternate oauth login methods 
* Refactored color generation algorithm
* New mutation algorithm to allow for mock 'natural' gene changes

# User Routes
## For new users 
| Route | Request Type | Expects | Returns |
|-------|--------------|---------|---------|
| /auth/signup | POST | In the body: username, password, displayName | User object populated with pets and eggs |

** Note: we expect only two pets will exist; both starter pets without parents

## For returning users
| Route | Request Type | Expects | Returns |
|-------|--------------|---------|---------|
| /auth/login | POST | In the body: username, password | User object populated with pets and eggs |
| /auth/logout | POST | N/A | Returns an object with msg: "Logged out" |

## Other User Routes
| Route | Request Type | Expects | Returns |
|-------|--------------|---------|---------|
| /api/users/:userId | GET | In the PARAMS: _id of user | User obj populated with pets and eggs | 
| /api/users/:userId | PUT | In the PARAMS: _id of user, in the BODY: fields to update | Updated user obj ONLY |
| /api/users/:userId | DELETE | In the PARAMS: _id of user | 200 ok |

# Pet Routes
| Route | Request Type | Expects | Returns |
|-------|--------------|---------|---------|
| /api/pets | POST | In the body: _id of the egg to hatch | A new pet object (from the hatched egg) |
| /api/pets/:petId | GET | In the params: _id of the pet to get | A single pet object |
| /api/pets/:petId | PUT | In the params: _id of the pet to update, attributes to update (name, level, experiencePoints, isFavorite) | A single (updated) pet object | 
| /api/pets/:petId | DELETE | In the params: _id of the pet to delete | A 200 / success |

# Egg Routes
| Route | Request Type | Expects | Returns |
|-------|--------------|---------|---------| 
| /api/eggs | POST | In the body: firstParent (_id of a pet the user owns) and secondParent (_id of a pet the user owns) | A new egg object (from breeding the two parents) |
| /api/eggs/:eggId | GET | In the params: _id of the egg to get | A single egg object |
| /api/eggs/:eggId | PUT | In the params: _id of the egg to update, attributes to update (lifeStage) | A single (updated) egg object | 
| /api/eggs/:eggId | DELETE | In the params: _id of the egg to delete | A 200 / success |