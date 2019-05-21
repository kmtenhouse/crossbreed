# Pet Class Test Plan

## Breeding
* When breeding two pets, the resulting pet will be a blend of the two parents
** Pet will have their default name as 'unnamed pet'
** Pet will have baseColorRed, baseColorGreen, baseColorBlue as keys => two alleles

* When passing the pet class a single 'parent' pet, the resulting pet will be a direct clone of that parent.
** DNA will be identical
** baseColor, outlineColor will be identical
** Only 'parent' listed will be the original parent
** Pet will have their default name as 'unnamed pet'
** Pet will have baseColorRed, baseColorGreen, baseColorBlue as keys => two alleles

* If passed 0 parents -> will error
* If passed more than 2 parents -> will error
* If parent DNA is missing genes or alleles -> will error



