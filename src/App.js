import React, {Component, useCallback} from 'react';
import {EditorState, convertToRaw, convertFromRaw} from 'draft-js';
import LineTo from 'react-lineto';
import axios from 'axios';

import File from './components/file';
import TextEditor from './components/editor';
import './App.css';


class App extends Component {
  constructor() {
    super();

    const url = process.env.REACT_APP_HEROKU_URL;
    this.state = {
      files: [],
      connectionEdit: false,
      connectionFirst: "",
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
            onClick: () => this.onEdit(item.id),
            conns: item.conns
          });
        });

        this.setState({
          loading: false,
          files: filesData
        });
        this.forceUpdate();
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
          text: textToSend,
          conns: item.conns
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
      if(!this.state.connectionEdit) {
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
      } else {
        this.connectionEdit(id);
      }
    }

    this.connectionEdit = (currentFileId) => {
      this.setState((prevState) => {
        if(prevState.connectionFirst == "") {
          return {
            connectionFirst: currentFileId
          }
        } else {
          const conn = currentFileId;
          const fileIdToUpdate = this.getFileById(this.state.connectionFirst);
          const prevConns = this.state.files[fileIdToUpdate].conns;            
          const newConns = [
             ...prevConns,
             conn
          ];
          const newFiles = this.updateArray(this.state.files, fileIdToUpdate, "conns", newConns);
          return {
            files: newFiles,
            connectionFirst: "",
            connectionEdit: false
          }
        }
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
        const fileIdToUpdate = this.getFileById(this.state.fileEditId);
        const newFilesToShow = this.updateArray(this.state.files, fileIdToUpdate, "text", this.editorRef.current.getData());
        return {
          fileEditCurrentText: this.editorRef.current.getData(),
          files: newFilesToShow,
        };
      });
    }

    // add connection
    this.connAdd = () => {
      this.setState({
        connectionEdit: true
      })
    }

    // misc methods

    // get actual index of file in files array by it's id
    this.getFileById = (id) => {
      const file = this.state.files.filter((obj) => {
        return obj.id === id
      });

      return this.state.files.indexOf(file[0]);
    }

    // get updated array
    this.updateArray = (array, index, attr, value) => {
      const elementToUpdate = {
        ...array[index],
        [attr]: value
      };

      return [
        ...array.slice(0, index),
        elementToUpdate,
        ...array.slice(index + 1)
      ];
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
    const fileConnectionEdit = this.state.connectionEdit ? 'file-connection-edit' : '';
    const connectionEdit = this.state.connectionEdit ? 'notify-connection-edit-enabled' : 'notify-connection-edit-disabled';

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
              class={ fileConnectionEdit }
              editState={ this.state.connectionEdit }
          />
      ) 
    })
    const lines = this.state.files.map((item) => {
      if(item.conns != []) {
          return item.conns.map((conn) => {
            return (
              <LineTo from={`${item.id}`} to={`${conn}`} className="connection"/>
            )
          });
      }        
    });

    return (
      <div  className="App" onClick={ this.setEditorStateToFalse }>

        <div className={ `notify-connection-edit ${ connectionEdit }` }>Выберите 2 элемента, которые необходимо соединить</div>

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
          { lines }
        </div>

        <div onClick={(e) => e.stopPropagation()} className={ `editor-container ${ editorState }` }>
          <TextEditor ref={ this.editorRef } content={ this.state.fileEditCurrentText }/>
          <button className="btn btn-save-note" onClick={ this.textSave }>Сохранить заметку</button>
          <button className="btn btn-delete-file" onClick={ this.delete }>Удалить элемент</button>
        </div>

        <button className="btn btn-save" onClick={ this.workspaceSave }>Сохранить рабочее пространство</button>
        <button className="btn btn-add-note" onClick={ this.noteAdd }>Добавить заметку</button>
        <button className="btn btn-add-conn" onClick={ this.connAdd }>Добавить связь</button>

      </div>
    );
  }
}

export default App;
