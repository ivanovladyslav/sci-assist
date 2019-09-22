import React, {Component} from 'react';
import ScrollContainer from 'react-indiana-drag-scroll'
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
    return (
      <div className="App">
        <input className="btn-upload" type="file" onChange={this.onChangeHandler}/>
        <ScrollContainer 
          className="scroll-container scrollable" 
          hideScrollbars={false}
          >
          <div className="inner" >
            <div className="workspace">
              asdafsafsdfsdsgdfg
            </div>
          </div>
        </ScrollContainer>
      </div>
    );
  }
}

export default App;
