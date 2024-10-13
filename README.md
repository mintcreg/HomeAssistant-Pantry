# Simple Pantry

This is a simple HTML file hosted in WWW of HomeAssistant which will allow you to create a simple pantry system to store products/categories and track amounts using input numbers. 

My use case meant that this wouldn't be something that's used heavily and therefore managing this via this GUI suits my needs, hopefully it does yours too if not then feel free to edit :)

**Requirements**
> Long Live Access Token

> Remotely Accessible HA instance

> Access to WWW folder

**Features**

> Product management
> Stock Management
> Sort by category (products are associated to their respective categories and will allow you to open/close)
> Generate all YAML for products
> Edit existing YAML configurations to remove/add products/categories


**Install Steps**
```bash
  1: Take the pantry.html and insert it into WWW (root or wherever you prefer)
  
  2: Create a Long Live Access Token (Profile > Security > Long Live Access Token)

  3: Update pantry.html (const homeAssistantToken & const baseUrl) to your own variables.

  4: Encode HTML file using https://pagecrypt.maxlaumeister.com/
 
  5: Place encrypted HTML file back in WWW and remove original pantry.html
``` 
 ** *Note, this is not guaranteed secure in anyway shape or form* **

## Screenshots

<details>
<summary>Open Screenshots</summary>
<br>
  
![App Screenshot](https://github.com/mintcreg/simple_pantry/blob/main/screenshots/main.png?raw=true)

![App Screenshot](https://github.com/mintcreg/simple_pantry/blob/main/screenshots/generate.png?raw=true)

![App Screenshot](https://github.com/mintcreg/simple_pantry/blob/main/screenshots/edit.png?raw=true)
<br><br>
