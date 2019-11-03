import React, {Component, useCallback} from 'react';
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import axios from 'axios';

import File from './components/file';
import TextEditor from './components/editor';
import './App.css';


class App extends Component {
  constructor() {
    super();

    const url = process.env.REACT_APP_BACKEND_URL;
    this.state = {
      files: [],
      edit: false,
      fileEditId: "",
      fileEditCurrentText: EditorState.createEmpty(),
      token: "",
      loading: false
    }

    // Get files from backend
    this.getFiles = () => {
      this.setState({ filesToShow: "", loading: true });
      axios.get(url + '/api', { params: { userId: this.state.userId} })
      .then((res, err) => {    
        const filesData = res.data.map((item) => {
          this.myRef = React.createRef();
          const textToInsert = (!item.text || item.text === "") ? 
          EditorState.createEmpty() :            
          EditorState.createWithContent(convertFromRaw(item.text));

          return ({
            id: item.id,
            name: item.name,
            thumbnail: item.thumbnailLink,
            link: item.link,
            x: item.x,
            y: item.y,
            text: textToInsert,
            ref: this.myRef,
            onClick: () => this.onEdit(item.id)
          });
        });

        this.setState({
          loading: false,
          files: filesData
        });
      });
    }
    
    // Auth
    this.authenticate = () => {
      this.setState({ loading: true });
      axios.get(url + '/api/authenticate', { params: { token: this.state.token } }).then((res) => {
        const app = this;
        const child = window.open(res.data,'','toolbar=0,status=0,width=626,height=436');
        const timer = setInterval(checkChild, 500);
        function checkChild() {
          if (child.closed) {
              axios.get(url + '/api/isAuthenticated').then((res) => {
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
    
    // On file source change call upload method
    this.onChangeHandler = (e) => {
      this.uploadFile(e.target.files[0]);
    }

    // Upload file to the backend then call getFiles()
    this.uploadFile = (file) => {
      this.setState({ loading: true });
      const app = this;
      const data = new FormData()
      data.append('file', file)
      data.append('userId', this.state.userId)
      axios.post(url + '/api/upload', data)
      .then(() => {
        app.setState({ loading: false });
        setTimeout(app.getFiles(), 3000);        
      })
      .catch((e) => {
        console.log(e);
      });
    }

    // Save elements positions and text
    this.workspaceSave = (e) => {
      const app = this;
      let filesPositions = [];
      this.setState({ loading: true });
      e.stopPropagation();

      this.state.files.map((item) => {
        let textToSend = convertToRaw(item.text.getCurrentContent());
        filesPositions.push({
          name: item.name, 
          x: item.ref.current.x,
          y: item.ref.current.y,
          text: textToSend
        });
      });

      axios.post(url + '/api/save', { filesPositions, userId: this.state.userId })
      .then(() => {
        app.setState({ loading: false });
      })
      .catch((e) => {
        console.log(e);
      });
    }

    // Get current file text and id when edit file 
    this.onEdit = (id) => {
      const { files } = this.state;
      const file = files.filter((obj) => {
        return obj.id === id
      })
      const index = files.indexOf(file[0]);
      this.setState({
        edit: true,
        fileEditId: id,
        fileEditCurrentText: files[index].text
      });
    }

    // Create note and send it to backend then call getFiles()
    this.noteAdd = () => {
      this.setState({ loading: true });
      const app = this;
      axios.post(url + '/api/upload-text', { userId: this.state.userId })
      .then(() => {
        this.setState({ loading: false });
        app.getFiles();
      })
      .catch(() => {
        console.log('Upload error');
      });
    }

    // Delete element from the backend then call getFiles()
    this.delete = () => {
      this.setState({ loading: true });
      const app = this;
      axios.post(url + '/api/delete', { fileId: this.state.fileEditId, userId: this.state.userId })
      .then(() => {
        this.setState({ loading: false });
        app.getFiles();
      }).catch(() => {
        console.log("Delete error");
      });
    }
    
    // Hide editor method
    this.setEditorStateToFalse = () => {
      this.setState({ edit: false });
    }

    // Save current note text
    this.textSave = () => {
      this.setState(() => {
        const data = this.state.files;
        const file = data.filter((obj) => {
          return obj.id === this.state.fileEditId
        })

        const index = data.indexOf(file[0]);
        const fileToUpdate = {
          ...data[index],
          text: this.editorRef.current.getData()
        };

        const newFilesToShow = [
          ...data.slice(0, index),
          fileToUpdate,
          ...data.slice(index + 1)
        ];
        return {
          fileEditCurrentText: this.editorRef.current.getData(),
          files: newFilesToShow,
        };
      });        
    }
  }

  // Auth on load
  componentDidMount() {
    this.authenticate();
  }

  render() {  
    this.editorRef = React.createRef();
    const editorState = this.state.edit ? 'active' : 'inactive';
    const loadingState = this.state.loading ? 'loader-show' : 'loader-hide';

    const filesToShow = this.state.files.map((item) => {             
      return (
        <File 
              key={ item.id }
              id={ item.id }
              name={ item.name } 
              thumbnail={ item.thumbnail } 
              link={ item.link } 
              x={ item.x } 
              y={ item.y }
              text={ item.textToInsert }
              ref={ item.ref }               
              onClick={ item.onClick } 
          />
      ) 
    })

    return (
      <div  className="App" onClick={ this.setEditorStateToFalse }>

        <div className={ `loader ${ loadingState }` }></div>

        <form id="uploadForm" enctype="multipart/form-data">
          <div className="btn btn-upload">
            <img className="vector1" src="https://i.ibb.co/whWv1B8/Vector.png"></img>
            <img className="vector2" src="https://i.ibb.co/2yg1z0M/Vector2.png"></img>
            <p>Загрузить</p>
            <input className="btn-input-hide" type="file" onChange={ this.onChangeHandler }/>
          </div>
        </form>

        <div className="workspace">
          { filesToShow }
        </div>

        <div onClick={(e) => e.stopPropagation()} className={ `editor-container ${ editorState }` }>
          <TextEditor ref={ this.editorRef } content={ this.state.fileEditCurrentText }/>
          <button className="btn btn-save-note" onClick={ this.textSave }>Сохранить заметку</button>
          <button className="btn btn-delete-file" onClick={ this.delete }>Удалить элемент</button>
        </div>

        <button className="btn btn-save" onClick={ this.workspaceSave }>Сохранить рабочее пространство</button>
        <button className="btn btn-add" onClick={ this.noteAdd }>Добавить заметку</button>

      </div>
    );
  }
}

export default App;
