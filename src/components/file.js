import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';

export default class File extends Component {
    constructor(props) {
        super(props);
        this.x = this.props.x;
        this.y = this.props.y;
        this.text = this.props.text;
        this.id = this.props.id;

        this.getOffset = () => {
            return {x: this.x, y: this.y};
        }

        this.handleStop = (e, data) => {
            this.x = data.x;
            this.y = data.y;
        }
    }

    componentDidMount() {
        console.log(this.props.x + " "  +this.props.y);
        this.node = ReactDOM.findDOMNode(this).getBoundingClientRect()
        
    }

    onDoubleClick = (e) => {
        window.open(this.props.link, '_blank');
    }

    onMove = (e) => {
        console.log(e.target);
    }

    onClick = (e) => {
        e.stopPropagation();
        this.props.onClick();
    }
    render() {
        return (
            <Draggable defaultPosition={{x: this.x, y: this.y}} positionOffset={{x: 0, y: 0}} onStop={this.handleStop}>
                <div onClick={this.onClick} onDoubleClick={this.onDoubleClick} onMouseUp={this.onMove} className="box box-1" style={{top: 100, left: 50}}>
                    <img src={this.props.thumbnail} draggable="false"></img>
                    <p>{this.props.name}</p>
                </div>
            </Draggable>
        )
    }
}