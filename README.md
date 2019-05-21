# crossbreed-backend

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