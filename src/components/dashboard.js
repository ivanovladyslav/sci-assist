import React, { Component } from 'react';
import axios from 'axios';

const url = process.env.REACT_APP_LOCALHOST_URL;

class Dashboard extends Component {
    constructor(props) {
        super();
        this.state = {
            workspaceName: '',
            currentWorkspace: '',
            workspaces: []
        }
        this.onWorkspaceNameChange = (e) => {
            this.setState({
                workspaceName: e.target.value
            });
        }
        
        this.createWorkspace = () => {
            let app = this;
            if (this.state.workspaceName !== '') {
                axios.post(url + '/api/createWorkspace', { userId: this.props.userId, workspaceName: this.state.workspaceName})
                .then((res) => {
                    app.setState({
                        workspaces: res.data.workspaces
                    })
                })
            }
        }

        this.onOptionClick = (e) => {
            this.setState({
                currentWorkspace: e.target.value
            })
        }
    }

    componentDidMount() {
        this.setState({
            workspaces: this.props.workspaces,
            currentWorkspace: this.props.currentWorkspace
        })
    }

    render() {
        const workspaces = this.state.workspaces.map((workspace) => {
            return <option value={workspace.name}>{workspace.name}</option>
        });

        return (
            <div>
                <input className="input-workspace-name" type="text" placeholder="Введите название" onChange={this.onWorkspaceNameChange}/>
                <button className="btn-create-workspace" onClick={this.createWorkspace}>Создать</button>
                <p className="select-label">Выберите рабочее пространство:</p>
                <select className="select-workspaces" value={this.state.currentWorkspace} onChange={(e) => {this.props.onWorkspaceChange(e); this.onOptionClick(e)}}>
                    {workspaces}
                </select>
            </div>       
        )
    }
}

export default Dashboard;