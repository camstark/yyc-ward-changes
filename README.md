### Calgary Municipal Ward Boundary Changes

The 2017 Calgary Municipal Election will be held under new ward boundaries.  

This map is based off of: https://bl.ocks.org/veltman/949ce9c1b6f3e54c6e18  

The ward boundary data comes from data.calgary.ca:
[old-raw.geo-json](https://github.com/camstark/yyc-ward-changes/blob/gh-pages/old-raw.geo.json) - https://data.calgary.ca/d/r9vx-mhnf
[new-raw.geo-json](https://github.com/camstark/yyc-ward-changes/blob/gh-pages/new-raw.geo.json) - https://data.calgary.ca/d/4f6r-atgm  

But the GeoJSON data needs to be cleaned up a la: https://gist.github.com/veltman/a541770c843f59e7657d

#### To do this
1. Download the source GeoJSON as above
2. `npm install` to get NPM to install the required packages from package.json (underscore, fs, and turf)
3. `node premorph.js` runs the node file to prepare the 2 datasets as in the example. A few changes were needed to make this file work with current packages, etc. so it is slightly different than the source.
4. Wait, like, 12 minutes for this file to run. Or at least thats how long I had to wait for preprocessing.
5. See your results in the browser at [index.html](https://camstark.github.io/yyc-ward-changes)
