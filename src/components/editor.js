import React, {Component} from 'react';
import {Editor, convertFromRaw, convertToRaw, EditorState} from 'draft-js';

export default class TextEditor extends Component {
    constructor(props) {
        super(props);

        this.onChange = (editorState) => this.setState({editorState});
        this.state = {editorState: this.props.content};
      

        this.getData = () => {
          const state = this.state.editorState;
          console.log(state);
          return state;
        }
    }

    componentWillReceiveProps(newp) {
      this.setState({
        editorState: newp.content
      });
    }

    render() {

      return (
          <Editor editorState={this.state.editorState} onChange={this.onChange} />
      );
    }
}