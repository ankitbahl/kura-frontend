import {grpc} from 'grpc-web-client'
import {MetadataService} from './generated/metadata/metadata_pb_service'
import Metadata from './generated/metadata/metadata_pb'
import {encryptFile, decryptFile} from './CryptFunctions'
import {deleteCookie} from "./cookieFunctions";

const host = window.localStorage.getItem("metadata") || "http://24.150.176.105:6969";
export function uploadURL(path, auth) {
  return `${host}/upload?path=${path}&auth=${encodeURI(auth)}`
}

export async function getDirectoryKeys(root, auth, callback) {
  let http = new XMLHttpRequest();
  http.onreadystatechange = function () {
      if (http.readyState === 4  && http.status === 200) {
        callback(JSON.parse(http.response));
      }
      if (http.readyState === 4 && http.status === 401) {
        deleteCookie('auth');
        alert('Login incorrect');
        document.location.reload();
      }
  };
    http.open("GET", `${host}/keys?path=${encodeURI(root)}&auth=${encodeURI(auth)}`);
    http.send(null);
}

export function getFile(filepath, auth) {
  return `${host}/file?path=${encodeURI(filepath)}&auth=${encodeURI(auth)}`;
}