
## Setup

In order to setup the input_numbers/products you need to follow the below structure

**Step 1: Create Product Categories**

```bash
  > Navigate to your url e.g. https://homeassistant.website.com/local/pantry.html

  > Select 'Generate'

  > Enter category name e.g. Fanta (note: this will still say product name)

```
**Step 2: Create Products**
```bash
  > Navigate to your url e.g. https://homeassistant.website.com/local/pantry.html
  > Select 'Generate'

  > Enter product name e.g. Fanta

  > Enter ImageURL of the product e.g. http://website.com/image.jpg

  > Click "Select Category" and apply this to the required category

  > Hit 'Generate YAML'

```
 *Note; All products must have an associated category or it will not display!*    

**Step 3: Import input_numbers**
```bash
  > Create the below structure
  
  /config/stock/inventory.YAML

  > Paste the output of 'Generated Input Number YAML' into inventory.YAML

  > Paste the output of 'Generated Customize YAML' into configuration.YAML

```
An example of these are located in the project files!

**Step 4: Reboot Home Assistant and navigate back to the URL**
