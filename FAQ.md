
## FAQ

#### Can I use a barcode scanner?
*No, this purely uses the HA API via HTML as we're limited to JS/HTML from the WWW directory*

#### Is this secure?

As per https://pagecrypt.maxlaumeister.com/ 

*"How can this be secure if it's client-side? Can't people just bypass the password?*

*The HTML gets encrypted using the password, so it is unreadable without the password. An attacker could extract the encrypted document, but it would be an unusable mess until they decrypt it, which can only be done with the original password."*

#### Something is broken?

*It's my first ever project, bear with me!*

#### I have removed an entity from my product list/config.yaml but it's showing in HA

*You need to manually remove the entries from within the GUI of HA itself, removing from the YAML doesn't remove the entities previously created*
