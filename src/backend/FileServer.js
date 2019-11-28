import {deleteCookie} from "../helpers/CookieFunctions";

const host = window.localStorage.getItem("metadata") || "https://ankit2bahl.ca:6969";
export function uploadURL(path, auth) {
  return `${host}/upload?path=${path}&auth=${encodeURIComponent(auth)}`
}

export async function getDirectoryKeys(root, auth, callback) {
  let http = new XMLHttpRequest();
  http.onreadystatechange = function () {
      if (http.readyState === 4  && http.status === 200) {
        callback(JSON.parse(http.response));
      }
      if (http.readyState === 4 && http.status === 401) {
        // deleteCookie('auth');
        alert('Login incorrect');
        window.location.replace('/');
      }
  };
  http.open("GET", `${host}/keys?path=${encodeURIComponent(root)}&auth=${encodeURIComponent(auth)}`);
  http.send(null);
}

export function getFile(filepath, auth) {
  return `${host}/file?path=${encodeURIComponent(filepath)}&auth=${encodeURIComponent(auth)}`;
}

export function getFolder(filepath, auth) {
  return `${host}/folder?path=${encodeURIComponent(filepath)}&auth=${encodeURIComponent(auth)}`;
}

export async function login(auth, captcha, callback) {
    let http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState === 4  && http.status === 200) {
            callback(JSON.parse(http.response));
        }
        if (http.readyState === 4 && http.status === 401) {
            callback(false);
        }
    };
    http.open("POST", `${host}/login`);
    http.send(JSON.stringify({
        auth,
        captcha
    }));
}