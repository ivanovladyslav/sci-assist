import React, {Component} from 'react';
import Draggable from 'react-draggable';

export default class File extends Component {

    onClick = (e) => {
        console.log("click");
    }

    render() {

        return (
            <Draggable>
                <div onDoubleClick={this.onClick} className="box box-1">
                    <img src={this.props.thumbnail} draggable="false"></img>
                    {this.props.name}
                </div>
            </Draggable>
        )
    }
}