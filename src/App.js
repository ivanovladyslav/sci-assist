import React, {Component} from 'react';
import File from './components/file';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      files: []
    }
    this.getFiles = () => {
      axios.get('http://127.0.0.1:4000/api')
      .then((res, err) => {     
        this.setState({
          files: res.data
        })   
      })
      .then(() => console.log(this.state))
    }

    this.onChangeHandler = (e) => {
      const app = this;
      const data = new FormData()
      data.append('file', e.target.files[0])
      console.log(data);
      axios.post('http://127.0.0.1:4000/api/upload',
        data
      ).then(function(){
        console.log('SUCCESS!!');
        app.getFiles();
      })
      .catch(function(){
        console.log('FAILURE!!');
      });
    }
  }

  componentDidMount() {
    this.getFiles();
  }


  render() {
    const { files } = this.state;
    const filesToShow = files.map((item) => {
      return (
        <File name={item.name} thumbnail={item.thumbnailLink}/>
      )
    })

    return (
      <div className="App">
        <form id="uploadForm" enctype="multipart/form-data">
          <div className="btn-upload">
            <img className="vector1" src="https://i.ibb.co/whWv1B8/Vector.png"></img>
            <img className="vector2" src="https://i.ibb.co/2yg1z0M/Vector2.png"></img>
            <p>Загрузить</p>
            <input className="btn-input-hide" type="file" onChange={this.onChangeHandler}/>
          </div>
        </form>
        {/* <ScrollContainer 
          className="scroll-container scrollable" 
          hideScrollbars={false}
          >
          <div className="inner" >
            <div className="workspace">
              {filesToShow}
            </div>
          </div>
        </ScrollContainer> */}

        <div className="workspace">
              {filesToShow}
        </div>
        {/* <ScrollBox style={{height: '1000px; width: 1000px'}} axes={ScrollAxes.XY} fastTrack={FastTrack.PAGING}>
          {filesToShow}
        </ScrollBox> */}
      </div>
    );
  }
}

export default App;
