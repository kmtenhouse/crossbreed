# Pet Test Plan
The following document lists out things that we know must be true about pets.

## Pet Objects
*Name*: Pets may have an alphanumeric string w/spaces. Length: 50 characters. No special characters. Pet name can be "", in which case it should display as 'Unnamed Pet' on the front end.
*isWild*: Boolean, indicating if the pet is wild or not
*Base Color*: Object, containing four keys - red, green, blue, transparency. RGB are integers 0-255; transparency is decimal 0-1
*Outline Color*: Object, containing four keys - red, green, blue, transparency. RGB are integers 0-255; transparency is decimal 0-1
*Game color*: Object, containing two keys - primary and secondary. Values are strings, ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'black', 'white']
*isFavorite*: Boolean, can only be true/false
*Parents:* Pets either have two parents, or no parents at all. Parents are an array with two mongo ObjectIDs.
*DNA:* An object of objects (see separate file of test cases to follow). NOTE: the pets API will never have access to set or get DNA directly. 

## Pet API Route Test Cases
### Get One (GET)
* When getting a pet using an obj _id, will return a pet object with all attributes except DNA
* Fails if the pet's obj _id is invalid ("")
* Fails if the pet's obj _id is not found (-1)

### Get All (GET) 
* When getting all pets for a user using a user _id, will return an array of pet objects
** Pet objects do not contain the field DNA
* If the user is valid and exists, but has no pets, returns an empty array
* Fails if the user id is invalid (-1) 
* Fails if the user id is not found

### Create (POST)
* When creating a pet and receiving an object that includes isStarter: true, will return a pet that matches one of the eight starter templates
** Starter pets have parents field set to an empty array
* When creating a pet and receiving an object that includes parents: [_id, _id], will return a pet generated from the DNA of the two parents
** Fails if one or both of the parent ids is invalid ("")
** Fails if one or both of the parents are not found (-1)
** Fails if only one parent is provided
** Fails if more than two parents are provided
* Fails if both isStarter and parents keys are provided 
* Fails if the user id is invalid (-1) 
* Fails if the user id is not found

### Updates (PUT)
Updating Pet Name:
* When updating the pet name with a valid string ("Mister Bigglesworth"), receive a success
* Pet name should be trimmed - no preceeding or trailing spaces
* Pet name update fails if the new name contains special characters ("JoJo!")
* Pet name update fails if the new name is 51+ characters ("AbcdefghijklmnopqrstuvwxyzAbcdefghijklmnopqrstuvwxy")
* Update fails if no user ID is provided (user is not logged in)
* Update fails if pet is not associated with the provided user ID
* Fails if the pet's obj _id is invalid ("")
* Fails if the pet's obj _id is not found (-1)
* Fails if the user id is invalid (-1)

Updating isFavorite:
* When updating isFavorite with a boolean (true or false), return a success
* Update fails if the value provided is anything other than boolean ("string123")
* Update fails if no user ID is provided (user is not logged in)
* Update fails if pet is not associated with the provided user ID
* Fails if the pet's pet _id is invalid ("")
* Fails if the pet's pet _id is not found (-1)
* Fails if the user id is invalid (-1)

Updating Other Attributes:
* Cannot PUT base image, base color, outline color, game color, parents, or dna via API

### Delete (DELETE)
* When deleting via a valid obj _id and user id, return a success
* Delete fails if the pet _id is invalid ("")
* Delete fails if the pet _id is not found (-1)
* Delete fails if no user ID is provided (user is not logged in)
* Fails if the user id is invalid (-1)
* Fails if pet is not associated with the provided user ID