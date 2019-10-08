import React, {Component} from 'react';
import Draggable from 'react-draggable';

export default class File extends Component {

    onClick = (e) => {
        window.open(this.props.link, '_blank');
    }

    onMove = (e) => {
        console.log(e.target);
    }

    render() {

        return (
            <Draggable>
                <div onDoubleClick={this.onClick} onMouseUp={this.onMove} className="box box-1">
                    <img src={this.props.thumbnail} draggable="false"></img>
                    {this.props.name}
                </div>
            </Draggable>
        )
    }
}