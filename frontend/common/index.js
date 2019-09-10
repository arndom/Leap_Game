/** 
 * common/index.js
 * 
 * What it Does:
 *   This file sets up our react app to render inside of the root html
 *   file. The global css file is included here as well as our service
 *   worker is registered.
 * 
 * Things to Change:
 *   Anything outside of react that needs to be included in your project
 *   can go here. If you want additional CSS files you can include them
 *   here.
 */
import Koji from 'koji-tools';
import './index.css';

Koji.pageLoad();
window.Koji = Koji;

//Here go all your scripts
//Recommended to have the index.js loaded last
require('script-loader!app/helpers/asset-loader.min.js');
require('script-loader!app/helpers/three-ui.min.js');
require('script-loader!app/button.js');
require('script-loader!app/entities.js');
require('script-loader!app/utilities.js');
require('script-loader!app/index.js');



if (module.hot) {
    module.hot.accept('script-loader!app/index.js', () => {
        let oldCanvas = document.getElementsByTagName('canvas')[0];
        oldCanvas.parentNode.removeChild(oldCanvas);

        require('script-loader!app/index.js');
       
    });
}
