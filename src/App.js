import React, {Component, useCallback} from 'react';
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import {useDropzone} from 'react-dropzone'
import Dropzone from 'react-dropzone'

import File from './components/file';
import TextEditor from './components/editor';
import axios from 'axios';
import './App.css';
import URL from './environment/env';

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
      files: [],
      filesToShow: [],
      edit: false,
      fileEditId: "",
      fileEditCurrentText: EditorState.createEmpty(),
      token: "",
      loading: false
    }

    this.getFiles = () => {
      this.setState({ filesToShow: "", loading: true });
      axios.get(URL+'/api', { params: { userId: this.state.userId} })
      .then((res, err) => { 
        console.log(res.data);
        this.setState({
          loading: false,
          files: res.data,
          filesToShow: res.data.map((item) => {
            this.myRef = React.createRef();
            let textToInsert;
            if(!item.text || item.text === "") {
              textToInsert = EditorState.createEmpty();
            } else {
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
          )})
        });
      });
    }

    this.authenticate = () => {
      this.setState({ loading: true });
      axios.get(URL+'/api/authenticate', { params: {token: this.state.token} } ).then((res) => {
        const app = this;
        const child = window.open(res.data,'','toolbar=0,status=0,width=626,height=436');
        const timer = setInterval(checkChild, 500);
        function checkChild() {
          if (child.closed) {
              axios.get(URL+'/api/isAuthenticated').then((res) => {
                if(res) {                    
                  app.setState({ userId: res.data.userId, loading: false })
                  app.getFiles();
                }
              }); 
              clearInterval(timer);
            }
          }
      });
    }

    this.onChangeHandler = (e) => {
      this.uploadFile(e.target.files[0]);
    }

    this.uploadFile = (file) => {
      this.setState({ loading: true });
      const app = this;
      const data = new FormData()
      data.append('file', file)
      data.append('userId', this.state.userId)
      axios.post(URL+'/api/upload',
        data
      ).then(function(){
        console.log("Uploaded!!");    
        app.setState({ loading: false });
        setTimeout(app.getFiles(), 3000);        
      })
      .catch(function(e){
        console.log(e);
      });
    }

    this.workspaceSave = (e) => {
      const app = this;
      this.setState({ loading: true });
      e.stopPropagation();
      let filesPositions = [];
      this.state.filesToShow.map((item) => {
        let textToSend = convertToRaw(item.props.text.getCurrentContent());
        filesPositions.push({name: item.props.name, x: item.ref.current.x, y: item.ref.current.y, text: textToSend});
      });
      axios.post(URL+'/api/save',
        { filesPositions: filesPositions, userId: this.state.userId }
      ).then(function(){
        app.setState({ loading: false });
      })
      .catch((e) => {
        console.log(e);
      });
    }

    this.onEdit = (id) => {
      const file = this.state.filesToShow.filter((obj) => {
        return obj.props.id === id
      })
      const index = this.state.filesToShow.indexOf(file[0]);
      this.setState({
        edit: true,
        fileEditId: id,
        fileEditCurrentText: this.state.filesToShow[index].props.text
      });
    }

    this.textAdd = () => {
      this.setState({ loading: true });
      const app = this;
      axios.post(URL+'/api/upload-text', { userId: this.state.userId })
      .then(() => {
        this.setState({ loading: false });
        app.getFiles();
      })
      .catch(() => {
        console.log('Upload error');
      });
    }

    this.delete = () => {
      this.setState({ loading: true });
      const app = this;
      axios.post(URL+'/api/delete', { fileId: this.state.fileEditId, userId: this.state.userId }).then(() => {
        this.setState({ loading: false });
        app.getFiles();
      }).catch(() => {
        console.log("Delete error");
      });
    }
    
    this.setEditorStateToFalse = () => {
      this.setState({ edit: false });
    }

    this.textSave = () => {
      this.setState(() => {
        const data = this.state.filesToShow;
        const file = data.filter((obj) => {
          return obj.props.id === this.state.fileEditId
        })
        console.log("THIS.STATE.FILES_TO_SHOW:")
        console.log(this.state.filesToShow);
        const index = data.indexOf(file[0]);

        console.log("id "+index);
        console.log(data[index]);
        const fileToUpdate = {
          ...data[index],
          props: {
            ...data[index].props,
            text: this.editorRef.current.getData()
          }
        };

        const newFilesToShow = [
          ...data.slice(0,index),
          fileToUpdate,
          ...data.slice(index+1)
        ];
        return {
          fileEditCurrentText: this.editorRef.current.getData(),
          filesToShow: newFilesToShow,
        };
      });        
    }
  }

  componentDidMount() {
    if(!this.state.loggedIn) 
      this.authenticate();
  }

  render() {  
    this.editorRef = React.createRef();
    const editorState = this.state.edit ? 'active' : 'inactive';
    const loadingState = this.state.loading ? 'loader-show' : 'loader-hide';

    return (
      // <Dropzone onDrop={acceptedFiles => this.uploadFile(acceptedFiles[0])}>
      // {({getRootProps, getInputProps}) => (
      //   <section> 
      //     {...getRootProps()}
            <div  className="App" onClick={this.setEditorStateToFalse}>
              <div className={ `loader ${loadingState}` }></div>
              <form id="uploadForm" enctype="multipart/form-data">
                <div className="btn btn-upload">
                  <img className="vector1" src="https://i.ibb.co/whWv1B8/Vector.png"></img>
                  <img className="vector2" src="https://i.ibb.co/2yg1z0M/Vector2.png"></img>
                  <p>Загрузить</p>
                  <input className="btn-input-hide" type="file" onChange={this.onChangeHandler}/>
                </div>
              </form>
              <button className="btn btn-save" onClick={this.workspaceSave}>Сохранить рабочее пространство</button>
              <button className="btn btn-add" onClick={this.textAdd}>Добавить заметку</button>

              <div className="workspace">
                {this.state.filesToShow}
              </div>
              <div onClick={(e) => e.stopPropagation()} className={`editor-container ${editorState}`}>
                <TextEditor ref={this.editorRef} content={this.state.fileEditCurrentText}/>
                <button className="btn btn-save-note" onClick={this.textSave}>Сохранить заметку</button>
                <button className="btn btn-delete-file" onClick={this.delete}>Удалить элемент</button>
              </div>
            </div>
      //   </section>
      //   )}
      // </Dropzone> 
    );
  }
}

export default App;
