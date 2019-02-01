#!/usr/bin/env node

const globby = require('globby');
const fs = require('fs');
const path = require('path');

// colors taken from: https://stackoverflow.com/questions/5947742/how-to-change-the-output-color-of-echo-in-linux#5947802
Color_Off='\033[0m'       // Text Reset

// Regular Colors
Black='\033[0;30m'        // Black
Red='\033[0;31m'          // Red
Green='\033[0;32m'        // Green
Yellow='\033[0;33m'       // Yellow
Blue='\033[0;34m'         // Blue
Purple='\033[0;35m'       // Purple
Cyan='\033[0;36m'         // Cyan
White='\033[0;37m'        // White

// Bold
BBlack='\033[1;30m'       // Black
BRed='\033[1;31m'         // Red
BGreen='\033[1;32m'       // Green
BYellow='\033[1;33m'      // Yellow
BBlue='\033[1;34m'        // Blue
BPurple='\033[1;35m'      // Purple
BCyan='\033[1;36m'        // Cyan
BWhite='\033[1;37m'       // White

// Underline
UBlack='\033[4;30m'       // Black
URed='\033[4;31m'         // Red
UGreen='\033[4;32m'       // Green
UYellow='\033[4;33m'      // Yellow
UBlue='\033[4;34m'        // Blue
UPurple='\033[4;35m'      // Purple
UCyan='\033[4;36m'        // Cyan
UWhite='\033[4;37m'       // White

// Background
On_Black='\033[40m'       // Black
On_Red='\033[41m'         // Red
On_Green='\033[42m'       // Green
On_Yellow='\033[43m'      // Yellow

const fixImport = (src, fp) => {

    const defineRx = /define\s*\(\s*\[((?:\s*\n*,?\s*\n*\s*["'](?:https?:\/\/)?[a-zA-Z0-9_/.\-]+["'])*\s*)\]\s*,\s*\n*\s*function\s*\((\s*(?:\s*\n*,?\s*\n*\s*[a-zA-Z0-9_$/'"]+)*\s*)\)\s*\n*{/gim;

    const defineRes = defineRx.exec(src);

    let dirname = path.dirname(fp).replace('src/script/', ''); // relative root is inside `script folder`

    if(defineRes===null) {
        return(null);
    }

    let defineSrc = defineRes[0],
        definePaths = defineRes[1],
        defineParams = defineRes[2];

    let importSrc = '';

    if(definePaths!='')
    {
        let pathMatches = definePaths.match(/['"](?:https?:\/\/)?[a-zA-Z0-9_/$.\-]+["']/gm);
        let paramsMatches = defineParams.match(/([a-zA-Z0-9_/$]+)/gm);

        pathMatches = pathMatches.map(onePath => {
            onePath = onePath.replace(/['"]/gm, '');
            return(onePath);
        });

        importSrc = paramsMatches.map((paramName, ix) => `import ${paramName} from '${pathMatches[ix]}';`).join('\n')+'\n';
    }
    
    return(src.replace(defineSrc, importSrc));
}

const fixEOF = (src, fp) => {
    const returnRx = /\s*return\s*\(?\s*([a-zA-Z0-9_\-]+)\s*\)?;?\s*\}\s*\);?\s*$/gi;

    if(returnRx.test(src)) {
    // IF a return statement was found
    // > convet it to export
        return(src.replace(returnRx, `\n\nexport default $1;`));
    } else {
    // ELSE just remove the closing braces
        console.log(`${Black}${On_Yellow} WARNING: ${Color_Off} export not fixed in ${Green}${fp}${Color_Off}`);
        return(src.replace(/\}\s*\);?\s*$/, ''));
    }
}

const fixUseStrict = (src) => {
    return(src.replace(/\s*["']use strict["'];?\s*\n/, '\n\n'));
}

const processPath = (path) => {

    const files = globby.sync(path);

    if(files.length==0) {
        console.log(`${On_Red}${White} ERROR: ${Color_Off} no files found in ${Purple}${path}${Color_Off}`);
        return;
    }

    files.forEach(function (p) {
        if (!fs.statSync(p).isDirectory()) {
            fixFile(p)
        }
    });
}

const fixFile = (fp) => {

    let inputSrc = fs.readFileSync(fp, 'utf-8');

    inputSrc = fixImport(inputSrc, fp);

    if(inputSrc===null) {
        console.log(`${Black}${On_Yellow} WARNING: ${Color_Off} ${Green}define${Color_Off} not found in ${fp} ... ${Green}skipping${Color_Off}`);
        return;
    }

    inputSrc = fixUseStrict(inputSrc, fp);
    inputSrc = fixEOF(inputSrc, fp);

    fs.writeFileSync(fp, inputSrc);

    console.log(`${Blue}Fixed:${Color_Off}  ${fp}`);
}

const args = process.argv.slice(2)

if (!args.length) {
  console.error('Pathname param missing!\nUsage:\nrequire2import.js some-file.js')
  process.exit(1)
}

processPath(args);