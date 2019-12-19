import React from 'react';

const nightCss = () => import('../night.css');

class NightButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            night: JSON.parse(localStorage['night-mode'] ? localStorage['night-mode'] : 'false')
        };
        this.changeStyle(this.state.night);
    }

    changeStyle = (nextState) => {
        if (nextState) {
            document.body.classList.add('night');
            nightCss();
        } else {
            document.body.classList.remove('night');
        }
    };

    changeButton = () => {
        let night = !this.state.night;
        this.changeStyle(night);
        localStorage['night-mode'] = night;
        this.setState({night});
    };

    render() {
        return (
            <button
                className={`btn btn-night ${this.props.hide}`}
                onClick={this.changeButton}
            >
                {this.props.children || this.state.night ? 'Дневной режим' : 'Ночной режим'}
            </button>
        );
    }
}

export default NightButton;
