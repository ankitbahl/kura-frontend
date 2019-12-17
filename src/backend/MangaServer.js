const host = window.localStorage.getItem("metadata") || "https://backend.ankit2bahl.ca:6969";

export async function search(searchTerm, auth, callback) {
    const http = new XMLHttpRequest();
    const url = `${host}/manga-names/${encodeURIComponent(searchTerm)}?auth=${encodeURIComponent(auth)}`;
    http.open("GET", url);
    http.onload = function(e) {
        if (http.status === 200 && http.readyState === 4) {
            callback(JSON.parse(http.responseText))
        }
    };
    http.send();
}

export async function startJob(manga_url, arg1, arg2, title, auth, callback) {
    const http = new XMLHttpRequest();
    const url = `${host}/manga?url=${encodeURIComponent(manga_url)}&arg1=${encodeURIComponent(arg1)}&arg2=${encodeURIComponent(arg2)}&name=${encodeURIComponent(title)}&auth=${encodeURIComponent(auth)}`;
    http.open("POST", url);
    http.onload = function(e) {
        if (http.status === 200 && http.readyState === 4) {
            if (http.responseText === 'job in progress') {
                alert('job already in progress!')
            } else if (http.responseText === 'bad input!') {
                alert('bad input!')
            } else {
                callback();
            }
        }
    };
    http.send();
}

export async function getProgress(auth, progressCallback, completionCallback) {
    let http = new XMLHttpRequest();
    const url = `${host}/progress?auth=${encodeURIComponent(auth)}`;
    http.open("GET", url);
    http.onload = function(e) {
        if (http.status === 200 && http.readyState === 4) {
            if (http.responseText !== 'done') {
                console.log(http.responseText);
                progressCallback(parseInt(http.responseText));
            } else {
                completionCallback();
            }
        }
    };
    http.send();
}

export function getMangaURL(auth) {
    return `${host}/manga?auth=${encodeURIComponent(auth)}`;
}