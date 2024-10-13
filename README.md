# Simple Pantry

# Description
The simple pantry is a HTML only file that uses the HA API via LongLiveAccess Tokens and can allow you to record products in your pantry. 

This tool generates the required YAML structure for you and creates a webpage where all of your inventory can be stored (utilising input_numbers as the products/categories).

**Features**
- Responsive
- Product Management
- Stock Management
- Sort by category (products are associated to their respective categories and will allow you to open/close)
- Generate all YAML for products
- Edit existing YAML configurations to remove/add products/categories

  


**Requirements**
- Long Live Access Token
- Remotely Accessible HA instance
- Access to WWW folder


FAQ: [Read Here](FAQ.md).

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
  
![App Screenshot](https://github.com/mintcreg/simple_pantry/blob/main/screenshots/Main.png?raw=true)

![App Screenshot](https://github.com/mintcreg/simple_pantry/blob/main/screenshots/generate.png?raw=true)

![App Screenshot](https://github.com/mintcreg/simple_pantry/blob/main/screenshots/edit.png?raw=true)
<br><br>
