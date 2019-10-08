import React, {Component} from 'react';
import File from './components/file';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
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

    this.authenticate = () => {
      axios.get('http://127.0.0.1:4000/api/authenticate').then((res) =>{
          // window.open(res.data, '_blank');
          console.log(res.data.loggedIn);
          if(!res.data.loggedIn) {
            const app = this;
            const child = window.open(res.data,'','toolbar=0,status=0,width=626,height=436');
            const timer = setInterval(checkChild, 500);
            function checkChild() {
              console.log(child.closed);
              if (child.closed) {
                  axios.get('http://127.0.0.1:4000/api/isAuthenticated').then((res) => {
                    if(res.data.loggedIn) {
                      app.setState({
                        loggedIn: true
                      })
                      app.getFiles();
                    }
                  }); 
                  clearInterval(timer);
                }
              }
          } else {
            this.getFiles();
          }
        }
      );
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
    if(!this.state.loggedIn) {
      this.authenticate();
    } 
  }


  render() {
    const { files } = this.state;
    const filesToShow = files.map((item) => {
      return (
        <File name={item.name} thumbnail={item.thumbnailLink} link={item.link}/>
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

        <div className="workspace">
              {filesToShow}
        </div>
      </div>
    );
  }
}

export default App;
