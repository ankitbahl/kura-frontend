import React from 'react'
import $ from 'jquery'
import {search, startJob, getProgress, getMangaURL} from "../backend/MangaServer";
import {getCookie} from "../helpers/CookieFunctions";

class Manga extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            auth: '',
            results: [],
            jobStarted: false
        };
    }

    componentDidMount() {
        $(document).keypress(function(e){
            if (e.which === 13){
                $("#search").click();
            }
        });
        let auth = getCookie('auth');
        this.setState({ auth });
    }

    getMangaFile() {
        const changeProgress = (amount) => {
            let elem = document.getElementById("progressBar");
            let width = amount;
            elem.style.width = width + '%';
            elem.innerHTML = width * 1 + '%';
        };
        const callBackend = () => {
            getProgress(this.state.auth, (progress) => {
                    changeProgress(progress);
                    setTimeout(callBackend, 2000);
                },
                () => {
                    let URL = getMangaURL(this.state.auth);
                    let link = document.createElement('a');
                    link.href = URL;
                    link.download = 'out.zip';
                    link.click();
                    // this.setState({jobStarted: false})
                });
        };

        callBackend();
    };

    downloadManga(title) {
        const manga_url = this.state.results.filter((result) => {return result.title === title})[0].url;
        const arg1 = document.getElementById(`${title}_start`).value;
        const arg2 = document.getElementById(`${title}_end`).value;
        startJob(manga_url, arg1, arg2, title, this.state.auth, () => {this.getMangaFile();});
        this.setState({jobStarted: true});
    }

    searchManga() {
        let searchTerm = document.getElementById('input').value;
        search(searchTerm, this.state.auth, (results) => {
            this.setState({results});
        });
    }

    results() {
        return (<table><tbody>

        {this.state.results.map((result) => {
            return <tr key={result.title}>
                <th>
                    <img src={result.pic} />
                </th>
                <th>
                    {result.title}
                </th>
                <th>
                    <input id={`${result.title}_start`} type="text" placeholder="Start Chapter"/>
                </th>
                <th>
                    <input id={`${result.title}_end`} type="text" placeholder="End Chapter"/>
                </th>
                <th>
                    <button onClick={() => {this.downloadManga(result.title)}}>Download</button>
                </th>
            </tr>
        })}
        </tbody></table>);
    }

    render() {
        return <div>
            <h1>Manga Downloader</h1>
            <div className="content">
                <input id="input" type="text" placeholder="Search Manga"/>
                <button id="search" onClick={ () => this.searchManga()}>Search</button>
                <div id="progress" style={{display: this.state.jobStarted ? 'block': 'none'}}>
                    <div id="progressBar">0%</div>
                </div>
                {this.results()}
            </div>
        </div>
    }
}

export default Manga;