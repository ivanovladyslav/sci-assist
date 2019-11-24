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

        this.state = {
            connectionEditClass: ""
        }

        this.getOffset = () => {
            return {x: this.x, y: this.y};
        }

        this.handleStop = (e, data) => {
            this.x = data.x;
            this.y = data.y;
        }

        console.log(this.props);
    }

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this).getBoundingClientRect()        
    }

    onDoubleClick = (e) => {
        window.open(this.props.link, '_blank');
    }

    componentWillReceiveProps(props) {
        if(!props.editState) {
            this.setState({
                connectionEditClass: ""
            })
        }
    }

    onMove = (e) => {
        console.log(e.target);
    }

    onClick = (e) => {
        e.stopPropagation();
        if (this.props.editState) {    
            this.setState({
                connectionEditClass: "file-connection-chosen"
            })
        }
        this.props.onClick();
    }
    render() {
        const content = this.props.type === 'file' ? <img src={this.props.thumbnail} draggable="false"></img> : <div class="note-text">{this.props.text}</div>
        const name = this.props.type !== 'note' ? <p>{this.props.name}</p> : ''
        const elementType = () => {
            switch (this.props.type) {
                case 'file': 
                    return 'element-file';
                case 'note':
                    return 'element-note';
                default:
                    break;
            }
        }
        return (
            <Draggable defaultPosition={{x: this.x, y: this.y}} positionOffset={{x: 0, y: 0}} onDrag={this.handleStop}>
                <div onClick={this.onClick} onDoubleClick={this.onDoubleClick} onMouseUp={this.onMove} className={`box box-1 ${this.id} ${this.props.class} ${this.state.connectionEditClass} ${elementType()}`} style={{top: 100, left: 50}}>
                    {content}
                    {name}
                </div>
            </Draggable>
        )
    }
}