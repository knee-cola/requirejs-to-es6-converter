RequireJS-2-ES6 is a tool which helps with migration from RequireJS-style dependency managment to ES6-style.

It replaces all the `require` calls with `import` and `return` with `export`.

# Installation
* make sure to have NodeJS installed on your computer
* clone/copy this project to a local folder on your computer
* install the dependencies by running `npm i` from a console (be sure to be in the project's folder)

# How to use it
Run it via:

    node ./require2import.js <filter-pathname>

Replace `<filter-pathname>` with path to folder which you wish to convert.

**NOTES:**
* old files will be overwritten with their new version
* this command does not traverse subfolders of the given path


## Example
In the `sample-files` folder we can find a sample file, on which you can test the conversion.

The following snippet shows a JavaScript file before the conversion.

```javascript
define(['DependencyA', 'DependencyB'],
function(DependencyA, DependencyB)
{
    var MyModule = {
        fn: function() {
            console.log('this is a dummy method');
        }
    }

    return(MyModule);
});
```

Next let's run the program:

    node ./require2import.js ./sample-files/

The next snippet shows the same file after the conversion:
```javascript
import DependencyA from 'DependencyA';
import DependencyB from 'DependencyB';

    var MyModule = {
        fn: function() {
            console.log('this is a dummy method');
        }
    }

export default MyModule;
```