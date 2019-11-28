import React from 'react';
import '../assets/css/Main.css';
import '../assets/css/bootstrap.css';
import Modal from 'react-modal';
import _ from 'lodash';
import moment from 'moment';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import {uploadURL, getDirectoryKeys, getFile, getFolder} from '../backend/FileServer';
import {getCookie} from "../helpers/CookieFunctions";
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

class Files extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      directory: {},
      root: this.props.match.params['path'] || 'root',
      favourites: [],
      sortCategory: 'lastModified',
      sortOrder: -1, //1 or -1 == asc or desc
      progress: 0,
      cutFile: '',
      selected: '',
      modalIsOpen: false,
      searchFilter: '',
      modalContent: '', //rename or delete
      modalSelect: '',
      fileSelected: true,
      auth: ''
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    let auth = getCookie('auth');
    this.setState({ auth });
    this.poll(auth);
  }

  poll = (auth) => {

    //if auth exists
    getDirectoryKeys(this.state.root, auth,
        (keysList) => {
            this.setState(
                {directory: this.parseStructure(keysList)})
        }
    );
  };

  setDirectory = (filepath, obj) => {
    let newDirectory = Object.assign({}, this.state.directory);
    let filename = _.last(filepath.split('/'));
    if (!filepath.includes('/')) {
      newDirectory[filename] = obj
    } else {
      let path = filepath.replace(`/${filename}`, `["${filename}"]`).replace(/\//g,'.');
      _.set(newDirectory, path, obj);
    }
    this.setState({directory: newDirectory});
  };

  unsetDirectory = (filepath) => {
    let newDirectory = Object.assign({}, this.state.directory);
    let filename = _.last(filepath.split('/'));
    if (!filepath.includes('/')) {
      delete newDirectory[filename];
    } else {
      let path = filepath.replace(`/${filename}`, `["${filename}"]`).replace(/\//g,'.');
      _.unset(newDirectory, path);
    }
    this.setState({directory: newDirectory});
  };

  parseStructure = (entriesList) => {
    let struct = Object.assign({}, this.state.directory);
    for(let entry of entriesList) {
      const file = entry.path;
      let path = file.split('/');
      let current = struct;
      for (let key of path) {
        if(key === '') {
          break;
        }
        if(!_.has(current, key)) {
          if (!entry.isDirectory && _.last(path) === key) {
            current[key] = {
              lastModified: entry.lastModified,
              size: entry.size
            }
          } else {
            current[key] = {};
          }
        }
        current = current[key];
      }
    }

    this.setState({directory: struct});

    // delete extra keys no longer there
    let rootPath = this.state.root.split('/');
    let current = struct;
    for(let key of rootPath) {
      current = current[key];
    }
    const topKeys = Object.keys(current);
    let entries = entriesList.map((entry) => {return entry.path});
    for (let key of topKeys) {
      if (!entries.includes(`${this.state.root}/${key}`)) {
        delete current[key];
      }
    }
    return struct;
  };

  folderClick = (obj) => {
    const root = `${this.state.root}/${obj}`;

    getDirectoryKeys(root, this.state.auth,
      (keysList) => {
      this.setState(
        {directory: this.parseStructure(keysList)})
      }
    );
    this.setState({root});
  };

  goBack = () => {
    if ((this.state.root.match(/\//g) || []).length === 0) {
      this.setState({root: ''});
    } else {
      this.setState({root: this.state.root.substring(0, this.state.root.lastIndexOf('/'))})
    }
  };

  downloadFile = (fileName) => {
    let filepath = this.state.root === '' ? fileName : `${this.state.root}/${fileName}`;
    let fileURI = getFile(filepath, this.state.auth);
    let link = document.createElement('a');
    link.href = fileURI;
    link.download = fileName;
    link.click();
  };

  downloadFolder = (fileName) => {
      let filepath = this.state.root === '' ? fileName : `${this.state.root}/${fileName}`;
      let folderURI= getFolder(filepath, this.state.auth);
      let link = document.createElement('a');
      link.href = folderURI;
      link.download = fileName;
      link.click();
  };

  uploadFiles = () => {
    // let file = files.target.files[0];
    // let path = this.state.root === '' ? file.name : `${this.state.root}/${file.name}`;
    // uploadURL(file, path,
    //   (fileName) => this.updateStructure(fileName, "create"),
    //   (data) => {
    //     if(data.lengthComputable) {
    //       this.setState({progress: data.loaded * 100 / data.total});
    //     }
    //   }
    // );
  };

  //TODO add arrow for sort
  filetable = () => {
    return (
      <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
        <table className="table">
          <thead>
            <tr onClick={this.pickSort}>
              <th id="name" scope="col" className="name">Name</th>
              <th id="size" scope="col" className="size">Size</th>
              <th id="lastModified" scope="col" className="lastModified">Last Modified</th>
              <th id="download" scope="col" className="download"></th>
            </tr>
          </thead>
          <tbody>
            {this.files()}
          </tbody>
        </table>
      </main>);
  };

  pickSort = (e) => {
    if(this.state.sortCategory === e.target.id) {
      this.setState({sortOrder: -this.state.sortOrder});
    } else {
      this.setState({sortCategory:e.target.id});
      this.setState({sortOrder: 1});
    }
  };
  files = () => {
    let rootObject = this.state.directory;
    if (Object.keys(rootObject).length > 0 && this.state.root !== "") {
      this.state.root.split('/').forEach((dir) => {
        rootObject = rootObject[dir];
      })
    }
    return Object.keys(rootObject)
      .filter(obj => obj!=='favourites')

      //search bar
      .filter(obj => obj.toLowerCase().includes(this.state.searchFilter))

      //files that start with .
      .filter(obj => !obj.startsWith('.'))

      //column sort
      .sort((key1, key2) => this.sortOrder(rootObject, key1, key2))
      .map(obj => {
        const isFile = rootObject[obj].hasOwnProperty('size');
        const selected = this.state.selected === obj;
        return <tr
          onClick={isFile ? ()=>{} : () =>{this.folderClick(obj)}}
          className={`block ${isFile ? "" : " folder"} ${selected ? 'selected' : ''}`}
          key={obj}
          id={obj}>
          <td className="fileblock">
            {isFile ? <span className="glyphicon glyphicon-cloud-download" onClick={() => {this.downloadFile(obj)}}></span>: ""}
            <ContextMenuTrigger id={obj}>
              {`${obj}${isFile ? '' : '/'}`}
            </ContextMenuTrigger>
          </td>
          <td>
            <ContextMenuTrigger id={obj}>
              {isFile ? this.formatFileSize(rootObject[obj].size) : ""}
            </ContextMenuTrigger>
          </td>
          <td>
            <ContextMenuTrigger id={obj}>
              {isFile ? this.formatDate(rootObject[obj].lastModified) : ""}
            </ContextMenuTrigger>
          </td>
        </tr>
      });
  };

  formatFileSize = (size) => {
    if (size < 1000) {
      return `${size} B`;
    }

    if (size < 1000000) {
      return `${Math.floor(size/1000)} KB`;
    }

    if (size < 1000000000) {
      return `${Math.floor(size/1000000)} MB`;
    }

    return `${Math.floor(size/100000000)/10} GB`;
  };

  formatDate = (time) => {
    return moment.unix(time).format('MMM Do YYYY, LT');
  };

  sortOrder = (structure, key1, key2) => {
    const sort = this.state.sortOrder;
    if (structure[key1].isDirectory) {
      return sort;
    }
    if (structure[key2].isDirectory) {
      return -sort;
    }
    switch (this.state.sortCategory) {
      case 'name':
        return key1.toLowerCase() >= key2.toLowerCase()  ? sort : -sort;
      case 'lastModified':
        return (structure[key1].lastModified || 0) >= (structure[key2].lastModified || 0) ? sort: -sort;
      case 'size':
        return (structure[key1].size || 0) >= (structure[key2].size || 0) ? sort: -sort;
      default:
        return key1 >= key2 ? sort : -sort;
    }
  };

  handleMenuClick = (e, config) => {
    const filePath = this.state.root === '' ? config.file : `${this.state.root}/${config.file}`;
    this.setState({modalSelect: filePath});
    this.setState({fileSelected: config.isFile});
    switch(config.option) {
      case 'Delete':
        this.setState({modalContent: 'delete'});
        this.openModal();
        break;
      case 'Download':
        this.downloadFile(config.file);
        break;
      case 'Cut':
        this.setState({cutFile: filePath});
        break;
      case 'Paste':
        this.setState({copiedFile: ''});
        break;
      case 'New Folder':
        this.setState({modalContent: 'folder'});
        this.openModal();
        break;
      case 'Rename':
        this.setState({modalContent: 'rename'});
        this.openModal();
        break;
      case 'Zip Folder':
        this.downloadFolder(config.file);
        break;
      default:
        window.alert('not implemented!');
    }
  };

  showMenu = (name) => {
    this.setState({selected: name});
  };

  menus = () => {
    let rootObject = this.state.directory;
    if(Object.keys(rootObject).length > 0 && this.state.root !== "") {
      this.state.root.split('/').forEach((dir) => {
        rootObject = rootObject[dir];
      })
    }
    const fileOptions = ["Download"];
    const folderOptions = ["Zip Folder"];
    return Object.keys(rootObject).filter(name => name!=='favourites').map(name => {
      const isFile = rootObject[name].hasOwnProperty('size');
      let options = isFile ? fileOptions : folderOptions;
      return (<ContextMenu id={name} key={`${name}-menu` } onShow={() => this.showMenu(name)} onHide={() => this.showMenu('')}>
        {options.map((option) => {
          return (
            <MenuItem key={option} className="dropdown-menu" data={{file: name, option, isFile }} onClick={this.handleMenuClick}>
              {option}
            </MenuItem>
          );
        })}
      </ContextMenu>);
    });
  };

  topbar = () => {
    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header topbar" href="#">
            <a className="navbar-brand home">
              <div className="kura">Kura</div>
            </a>
            <input className="form-control form-control-dark" type="text" placeholder="Search" aria-label="Search" onChange={this.onSearchText}/>
            {this.state.root === 'root' ? null : (<button className="navbar-btn" onClick={this.goBack}>Back</button>)}
            <form action={uploadURL(this.state.root, this.state.auth)} method="POST"
                  encType="multipart/form-data" >
                <input className="hidden" type="file" name="file" id="files" onChange={()=>{document.getElementById('submit').click()}}/>
                <input className="hidden" type="submit" id="submit" />
            </form>
            <label htmlFor="files">Upload</label>
            {/*<div className="test">{this.state.progress}</div>*/}
          </div>
        </div>
      </nav>
    );
  };

  onSearchText = (e) => {
    this.setState({searchFilter:e.target.value.toLowerCase()})
  };
  
  sidebar = () => {
    return (
    <nav className="col-md-2 d-none d-md-block bg-light sidebar">
      <div className="sidebar-sticky">
        <ul className="nav flex-column">
          <li className="nav-item">
            <a className="nav-link active" href="">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Dashboard <span className="sr-only">(current)</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-file"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              Orders
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-file"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              Orders
            </a>
          </li>
        </ul>
      </div>
    </nav>);
  };

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    if (this.state.modalContent === 'rename') {
      const inputBox = document.getElementById('filename');
      inputBox.value = this.state.modalSelect;
      inputBox.selectionStart = this.state.modalSelect.lastIndexOf('/') + 1;
      inputBox.selectionEnd = this.state.modalSelect.indexOf('.');
      inputBox.focus();
    } else if((this.state.modalContent === 'folder')) {
      const inputBox = document.getElementById('filename');
      inputBox.focus();
    }
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  modal = () => {
    return (<Modal
      isOpen={this.state.modalIsOpen}
      onAfterOpen={this.afterOpenModal}
      onRequestClose={this.closeModal}
      style={customStyles}
      contentLabel="Modal"
    >
      {this.modalContent()}
    </Modal>);
  };

  modalContent = () => {
    switch(this.state.modalContent) {
      case 'rename':
        return (<div>
          <h2 ref={subtitle => this.subtitle = subtitle}>Rename</h2>
          <br />
          <form onSubmit={e => this.submitModal(e)}>
          <input type="text" id="filename"/>{"    "} <input type="submit"/>
          </form>
        </div>);
      case 'delete':
        return (<div>
          <h2 ref={subtitle => this.subtitle = subtitle}>Delete</h2>
          {`Are you sure you want to delete this ${this.state.fileSelected ? 'file' : 'folder'}?`}
          <br />
          <button onClick={this.submitModal}>Yes</button>
          <button onClick={this.closeModal}>No</button>
        </div>);
      case 'folder':
        return (<div>
          <h2 ref={subtitle => this.subtitle = subtitle}>New Folder</h2>
          <br />
          <form onSubmit={e => this.submitModal(e)}>
            <input type="text" id="filename"/>{"    "} <input type="submit"/>
          </form>
        </div>);
        default:
    }
  };

  submitModal = (e) => {
    e.preventDefault();
    const textBox = document.getElementById('filename');
    // let text;
    if (textBox) {
      // text = textBox.value;
    }
    this.setState({modalIsOpen: false});
  };

  render() {
      return (<div>
          {this.topbar()}
          {this.filetable()}
          {this.menus()}
          {this.modal()}
      </div>);
  }
}

export default Files;