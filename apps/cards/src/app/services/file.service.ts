import { Injectable } from '@angular/core';
import {AngularFireStorage} from "@angular/fire/storage";
import {UtilService} from "./util.service";

@Injectable()
export class FileService {

    constructor(private storage: AngularFireStorage) {}

    async uploadImages(files: any[]) {
        const uploadedFileIds = []
        if(files.length) {
            for(let i = 0; i < files.length; i++) {
                const id = UtilService.generateId()
                await this.storage.upload(`images/${id}`, files[i]);
                uploadedFileIds.push(id)
            }
        }
        return uploadedFileIds;
    }

    async getImageUrls(fileIds: string[]) {
        const fileUrls = []
        if(fileIds.length) {
            for(let i = 0; i < fileIds.length; i++) {
                fileUrls.push(await this.storage.ref(`images/${fileIds[i]}`).getDownloadURL())
            }
        }
        return fileUrls;
    }
}
