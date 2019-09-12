import { h, Component } from 'preact';
import PropTypes from 'prop-types';


class GameContainer extends Component {

    state = {
        requestID: ""
    }


    componentDidMount() {
        require('script-loader!app/helpers/asset-loader.min.js');
        require('script-loader!app/helpers/three-ui.min.js');
        require('script-loader!app/button.js');
        require('script-loader!app/utilities.js');
        require('script-loader!app/entities.js');
        require('script-loader!app/func.js');
        require('script-loader!app/index.js');

        window.stop = requestID => { this.setState({ requestID }); }

        inGame = true;

    }

    componentWillUnmount() {

        inGame = false;

/*
        cancelAnimationFrame(this.state.requestID);

        if (ui) {
            
            ui.gameCanvas.parentNode.removeChild(ui.canvas);
            ui = null;
        }

        document.body.removeChild(renderer.domElement);
        //renderer.forceContextLoss();
        //renderer.context = null;
        //renderer.domElement = null;
        //renderer = null;
        //scene.dispose();
        //camera = null;

*/
    }

    render() {
        return (
            <div id={'game-container'} />
        );
    }
}

export default GameContainer;
