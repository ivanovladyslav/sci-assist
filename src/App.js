import React, {Component} from 'react';
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import File from './components/file';
import TextEditor from './components/editor';
import axios from 'axios';
import './App.css';
import URL from './env.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      files: [],
      filesToShow: [],
      edit: false,
      fileEditId: "",
      fileEditCurrentText: EditorState.createEmpty()
    }

    this.getFiles = () => {
      axios.get(URL+'/api')
      .then((res, err) => {     
        this.setState({
          files: res.data,
          filesToShow: res.data.map((item) => {
            this.myRef = React.createRef();
            let textToInsert;
            if(!item.text || item.text === "") {
              console.log("empty")
              console.log(item.text);
              textToInsert = EditorState.createEmpty();
            } else {
              console.log("FUCKAUEHAEURAHRAURHEU")
              console.log(item.text);
              textToInsert = EditorState.createWithContent(convertFromRaw(item.text));
            }
            return (
              <File ref={this.myRef} 
                    id={item.id}
                    onClick={() => this.onEdit(item.id)} 
                    name={item.name} 
                    thumbnail={item.thumbnailLink} 
                    link={item.link} 
                    x={item.x} 
                    y={item.y}
                    text={textToInsert}
               />
            )
        })
      });
    });
    }

    this.authenticate = async () => {
      axios.get(URL+'/api/authenticate').then((res) =>{
          // window.open(res.data, '_blank');
          console.log(res.data.loggedIn);
          if(!res.data.loggedIn) {
            const app = this;
            const child = await window.open(res.data,'','toolbar=0,status=0,width=626,height=436');
            const timer = setInterval(checkChild, 500);
            function checkChild() {
              if (child.closed) {
                  axios.get(URL+'/api/isAuthenticated').then((res) => {
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
      axios.post(URL+'/api/upload',
        data
      ).then(function(){
        console.log('SUCCESS!!');
        app.getFiles();
      })
      .catch(function(){
        console.log('FAILURE!!');
      });
    }

    this.workspaceSave = (e) => {
      e.stopPropagation();
      let filesPositions = [];
      this.state.filesToShow.map((item) => {
        let textToSend = convertToRaw(item.props.text.getCurrentContent());
        filesPositions.push({name: item.props.name, x: item.ref.current.x, y: item.ref.current.y, text: textToSend});
      });
      axios.post(URL+'/api/save',
        filesPositions
      ).then(function(){
        console.log('SUCCESS!!');
      })
      .catch(function(){
        console.log('FAILURE!!');
      });
    }

    this.onEdit = (id) => {
      console.log(this.state);
      this.setState({
        edit: true,
        fileEditId: id,
        fileEditCurrentText: this.state.filesToShow[id].props.text
      });
    }

    this.textAdd = () => {
      const app = this;
      axios.post(URL+'/api/upload-text',
          "please"
        ).then(function(){
          console.log('SUCCESS!!');
          app.getFiles();
        })
        .catch(function(){
          console.log('FAILURE!!');
        });
    }
    
    this.setEditorStateToFalse = () => {
      this.setState({
        edit:false
      });
      console.log(this.state);
    }

    this.textSave = () => {
      this.setState(() => {
        const data = this.state.filesToShow;
        const fileToUpdate = {
          ...data[this.state.fileEditId],
          props: {
            ...data[this.state.fileEditId].props,
            text: this.editorRef.current.getData()
          }
        };
        console.log(fileToUpdate);

        const newFilesToShow = [
          ...data.slice(0,this.state.fileEditId),
          fileToUpdate,
          ...data.slice(this.state.fileEditId+1)
        ];
        console.log(newFilesToShow);
        return {

          fileEditCurrentText: this.editorRef.current.getData(),
          filesToShow: newFilesToShow,
        };
      });        
    }
  }

  componentDidMount() {
    if(!this.state.loggedIn) {
      this.authenticate();
    } 
  }


  render() {
    this.editorRef = React.createRef();
    const editorState = this.state.edit ? 'active' : 'inactive';

    return (
      <div className="App" onClick={this.setEditorStateToFalse}>
        <form id="uploadForm" enctype="multipart/form-data">
          <div className="btn-upload">
            <img className="vector1" src="https://i.ibb.co/whWv1B8/Vector.png"></img>
            <img className="vector2" src="https://i.ibb.co/2yg1z0M/Vector2.png"></img>
            <p>Загрузить</p>
            <input className="btn-input-hide" type="file" onChange={this.onChangeHandler}/>
          </div>
        </form>
        <button className="btn-save" onClick={this.workspaceSave}>Сохранить</button>
        <button className="btn-add" onClick={this.textAdd}>Добавить заметку</button>

        <div className="workspace">
          {this.state.filesToShow}
        </div>
        <div onClick={(e) => e.stopPropagation()} className={`editor-container ${editorState}`}>
          <TextEditor ref={this.editorRef} content={this.state.fileEditCurrentText}/>
          <button className="btn-add" onClick={this.textSave}>Сохранить</button>
        </div>
      </div>
    );
  }
}

export default App;
