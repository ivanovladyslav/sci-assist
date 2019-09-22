import React, {Component} from 'react';
import ScrollContainer from 'react-indiana-drag-scroll'
import File from './components/file';
import './app.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      files: []
    }
  }

  onChangeHandler = (e) => {
    console.log(e.target.files[0])
    const newFiles = [...this.state.files, e.target.files[0]];
    this.setState({
      files: newFiles
    })
    console.log(this.state);
  }

  render() {
    const { files } = this.state;
    const filesToShow = files.map((item) => {
      return (
        <File name={item.name} />
      )
    })

    return (
      <div className="App">
        <input className="btn-upload" type="file" onChange={this.onChangeHandler}/>
        <ScrollContainer 
          className="scroll-container scrollable" 
          hideScrollbars={false}
          >
          <div className="inner" >
            <div className="workspace">
              {filesToShow}
            </div>
          </div>
        </ScrollContainer>
      </div>
    );
  }
}

export default App;
