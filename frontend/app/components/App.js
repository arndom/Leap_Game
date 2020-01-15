import { h, Component } from 'preact';
import GameContainer from './GameContainer';
import Leaderboard from './Leaderboard';
import SetScore from './SetScore';
// import WebFont from 'webfontloader';

export default class App extends Component {
	state = {
		score: 0,
		view: 'game'
	};

	componentDidMount() {
		window.setAppView = view => { this.setState({ view }); }
		window.setScore = score => { this.setState({ score }); }

    // this.loadFont();
	}

  // loadFont = () => {
  //   WebFont.load({ google: { families: [Koji.config.general.fontFamily] } });
  //   document.body.style.fontFamily = Koji.config.general.fontFamily;
  // };

	render() {
        
		if (this.state.view === 'game') {
           
			return (
				<div>
					<GameContainer />
				</div>
			)
		}
		if (this.state.view === 'setScore') {
			return (
				<div>
					<SetScore score={this.state.score} />
				</div>
			)
		}
		if (this.state.view === 'leaderboard') {
            
			return (
				<div>
					<Leaderboard />
				</div>
			)
		}

        
		return null;
	}
}
