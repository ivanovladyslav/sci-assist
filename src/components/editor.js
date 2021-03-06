import React, {Component} from 'react';
import {Editor, convertFromRaw, EditorState} from 'draft-js';

export default class TextEditor extends Component {
    constructor(props) {
        super(props);

        this.onChange = (editorState) => {
          this.setState({editorState});
          console.log();
        }
        this.state = {editorState: this.props.content};
      

        this.getData = () => {
          const state = this.state.editorState;
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